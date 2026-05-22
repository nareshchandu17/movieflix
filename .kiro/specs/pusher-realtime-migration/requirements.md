# Requirements Document

## Introduction

This document defines the requirements for migrating MovieFlix's real-time communication layer from a standalone Socket.io server to Pusher Channels. The migration replaces `server/socket-server.ts` and `lib/websocket.ts` with Pusher-backed Next.js API routes, making all real-time features — Watch Party room management, player sync, chat, WebRTC signaling, and notification delivery — compatible with Vercel's serverless deployment model. All existing feature contracts are preserved; only the transport layer changes.

## Glossary

- **Pusher_Server**: The server-side Pusher SDK instance (`lib/pusher/server.ts`) used by API routes to trigger events.
- **Pusher_Client**: The browser-side Pusher SDK instance (`lib/pusher/client.ts`) used by React components to subscribe to channels.
- **Auth_Route**: The Next.js API route at `/api/pusher/auth` that signs Pusher channel subscriptions.
- **WatchParty_API**: The collection of Next.js API routes under `/api/pusher/watchparty/` that handle Watch Party actions.
- **Notification_Utility**: The `lib/pusher/notifications.ts` module that delivers real-time notifications via Pusher.
- **Presence_Channel**: A Pusher channel prefixed `presence-room-{roomId}` that tracks live membership for a Watch Party room.
- **Private_User_Channel**: A Pusher channel prefixed `private-user-{userId}` used for per-user notifications and device sync.
- **Private_Signal_Channel**: A Pusher channel prefixed `private-signal-{userId}` used for WebRTC signaling.
- **Host**: The Watch Party participant whose `userId` matches `WatchPartyRoom.hostId` in MongoDB.
- **Participant**: Any authenticated user who has joined a Watch Party room.
- **PlayerControlPayload**: The event payload for play/pause/seek actions containing `action`, `time`, `userId`, `userName`, and `timestamp`.
- **ChatMessagePayload**: The event payload for chat messages containing `id`, `userId`, `userName`, `message`, `timestamp`, and `type`.
- **SignalingPayload**: The event payload for WebRTC signaling containing `type`, `sdp`, `candidate`, `senderId`, `senderName`, and `roomId`.
- **Socket_io_Server**: The legacy standalone server at `server/socket-server.ts` being replaced.

---

## Requirements

### Requirement 1: Pusher Server Client Initialisation

**User Story:** As a developer, I want a singleton Pusher server instance available to all API routes, so that I can trigger real-time events without duplicating configuration.

#### Acceptance Criteria

1. THE Pusher_Server SHALL be initialised using `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, and `PUSHER_CLUSTER` environment variables.
2. THE Pusher_Server SHALL expose a `triggerRoomEvent(roomId, event, data)` helper that targets the `presence-room-{roomId}` channel.
3. THE Pusher_Server SHALL expose a `triggerUserEvent(userId, event, data)` helper that targets the `private-user-{userId}` channel.
4. THE Pusher_Server SHALL expose a `triggerSignalEvent(targetUserId, event, data)` helper that targets the `private-signal-{targetUserId}` channel.
5. IF `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, or `PUSHER_CLUSTER` are absent at initialisation time, THEN THE Pusher_Server SHALL throw a configuration error.
6. THE Pusher_Server SHALL never expose `PUSHER_SECRET` to the browser environment.

---

### Requirement 2: Pusher Channel Authentication

**User Story:** As an authenticated user, I want the server to sign my Pusher channel subscriptions, so that only authorised users can access private and presence channels.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/pusher/auth` with a valid NextAuth session, THE Auth_Route SHALL return a signed Pusher auth token for the requested channel.
2. WHEN a POST request is made to `/api/pusher/auth` without a valid NextAuth session, THE Auth_Route SHALL return HTTP 401.
3. WHEN the requested `channel_name` starts with `presence-`, THE Auth_Route SHALL include `user_id` and `user_info` (containing `userName` and `isHost`) in the auth payload.
4. WHEN the requested `channel_name` starts with `private-signal-{userId}` and `session.user.id` does not match `userId`, THE Auth_Route SHALL return HTTP 403.
5. WHEN the requested `channel_name` is a public channel (not prefixed with `private-` or `presence-`), THE Auth_Route SHALL return HTTP 403.
6. THE Auth_Route SHALL use `pusherServer.authorizeChannel()` to generate all auth signatures.

---

### Requirement 3: Watch Party Room Creation

**User Story:** As an authenticated user, I want to create a Watch Party room via an API route, so that I can host a synchronised viewing session without a standalone server.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/pusher/watchparty/create` with a valid session and `{ roomName, movieId }`, THE WatchParty_API SHALL create a new `WatchPartyRoom` document in MongoDB and return the room details.
2. WHEN a POST request is made to `/api/pusher/watchparty/create` without a valid session, THE WatchParty_API SHALL return HTTP 401.
3. WHEN a room is created, THE WatchParty_API SHALL set the requesting user as the `hostId` in the `WatchPartyRoom` document.
4. WHEN a room is created with `isPrivate: true` and a `password`, THE WatchParty_API SHALL store the password on the room document.
5. THE WatchParty_API SHALL generate a unique `roomId` for every created room.

---

### Requirement 4: Watch Party Room Join

**User Story:** As an authenticated user, I want to join an existing Watch Party room, so that I can watch content in sync with other participants.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/pusher/watchparty/join` with a valid session and a valid `roomId`, THE WatchParty_API SHALL add the user as a participant in the `WatchPartyRoom` document and return the current room state.
2. WHEN a POST request is made to `/api/pusher/watchparty/join` without a valid session, THE WatchParty_API SHALL return HTTP 401.
3. WHEN a join request is made for a room that does not exist, THE WatchParty_API SHALL return HTTP 404.
4. WHEN a join request is made for a room that has reached `maxParticipants`, THE WatchParty_API SHALL return HTTP 400 with a "Room is full" message.
5. WHEN a join request is made for a private room with an incorrect password, THE WatchParty_API SHALL return HTTP 403.
6. WHEN a user joins a room they are already a participant of, THE WatchParty_API SHALL NOT create a duplicate participant entry in MongoDB.
7. WHEN a user successfully joins a room, THE WatchParty_API SHALL trigger a `user-joined` event on the Presence_Channel for that room.
8. WHEN a user successfully joins a room, THE WatchParty_API SHALL return `{ roomId, movieId, playState, currentTime, participants }` in the response body.

---

### Requirement 5: Watch Party Room Leave

**User Story:** As a participant, I want to leave a Watch Party room, so that the room's participant list stays accurate.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/pusher/watchparty/leave` with a valid session and `roomId`, THE WatchParty_API SHALL remove the user from the `participants` array in MongoDB.
2. WHEN a POST request is made to `/api/pusher/watchparty/leave` without a valid session, THE WatchParty_API SHALL return HTTP 401.
3. WHEN a user leaves a room, THE WatchParty_API SHALL trigger a room-state update event on the Presence_Channel.
4. WHEN a participant disconnects without calling the leave endpoint, THE Presence_Channel SHALL emit `pusher:member_removed` to remaining subscribers so the client-side member list stays accurate.

---

### Requirement 6: Player Synchronisation

**User Story:** As a Watch Party host, I want to control playback for all participants, so that everyone watches in sync.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/pusher/watchparty/player-control` with `action: "play"` by the Host, THE WatchParty_API SHALL update `currentPlayState` to `"playing"` in MongoDB and trigger a `player-control` event on the Presence_Channel.
2. WHEN a POST request is made to `/api/pusher/watchparty/player-control` with `action: "pause"` by the Host, THE WatchParty_API SHALL update `currentPlayState` to `"paused"` in MongoDB and trigger a `player-control` event on the Presence_Channel.
3. WHEN a POST request is made to `/api/pusher/watchparty/player-control` with `action: "seek"` and a `time` value by the Host, THE WatchParty_API SHALL update `currentTime` in MongoDB and trigger a `player-control` event on the Presence_Channel.
4. WHEN a player-control request is made by a user who is not the Host, THE WatchParty_API SHALL return HTTP 403 and SHALL NOT trigger any Pusher event.
5. WHEN a player-control request is made without a valid session, THE WatchParty_API SHALL return HTTP 401.
6. WHEN a `player-control` event is triggered, THE WatchParty_API SHALL include `{ action, time, userId, userName, timestamp }` in the PlayerControlPayload.
7. WHEN a `seek` action is submitted without a `time` value, THE WatchParty_API SHALL return HTTP 400.

---

### Requirement 7: Watch Party Chat

**User Story:** As a Watch Party participant, I want to send and receive chat messages in real time, so that I can communicate with other viewers.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/pusher/watchparty/chat` with a valid session, `roomId`, and non-empty `message`, THE WatchParty_API SHALL persist the message to `WatchPartyRoom.chatHistory` in MongoDB and trigger a `chat-message` event on the Presence_Channel.
2. WHEN a chat request is made without a valid session, THE WatchParty_API SHALL return HTTP 401.
3. WHEN a chat request is made with an empty or whitespace-only `message`, THE WatchParty_API SHALL return HTTP 400 and SHALL NOT persist or broadcast the message.
4. WHEN a `chat-message` event is triggered, THE WatchParty_API SHALL include a ChatMessagePayload with `id`, `userId`, `userName`, `message`, `timestamp` (ISO string), and `type: "text"`.

---

### Requirement 8: WebRTC Signaling Relay

**User Story:** As a Watch Party participant, I want to exchange WebRTC offer/answer/ICE-candidate messages with other participants, so that peer-to-peer video/audio connections can be established.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/pusher/watchparty/signal` with a valid session, `roomId`, `targetUserId`, and a valid `type`, THE WatchParty_API SHALL trigger a `signaling` event on `private-signal-{targetUserId}`.
2. WHEN a signaling request is made without a valid session, THE WatchParty_API SHALL return HTTP 401.
3. WHEN a signaling request is made by a user who is not a participant in the specified room, THE WatchParty_API SHALL return HTTP 403.
4. WHEN a `signaling` event is triggered, THE WatchParty_API SHALL include a SignalingPayload with `type`, `sdp` (for offer/answer), `candidate` (for ice-candidate), `senderId`, `senderName`, and `roomId`.
5. THE WatchParty_API SHALL NOT store signaling payloads in MongoDB; signaling is an ephemeral relay only.
6. WHEN a signaling event targets a user who is not subscribed to their Private_Signal_Channel, THE WatchParty_API SHALL return HTTP 200 and Pusher SHALL silently drop the event.

---

### Requirement 9: Real-Time Notification Delivery

**User Story:** As a user, I want to receive real-time notifications instantly, so that I am informed of events such as Watch Party invites without polling.

#### Acceptance Criteria

1. WHEN `pushNotificationToUser(userId, notification)` is called from any API route, THE Notification_Utility SHALL trigger a `new-notification` event on `private-user-{userId}`.
2. THE Notification_Utility SHALL NOT trigger notification events on public Pusher channels.
3. WHEN a `new-notification` event is triggered, THE Notification_Utility SHALL include the full notification payload in the event data.
4. THE Notification_Utility SHALL replace the Redis polling loop (`sync:*:notification` key scanning) for notification delivery; no code path SHALL poll Redis for notification delivery after migration.

---

### Requirement 10: Pusher Client Initialisation and React Hooks

**User Story:** As a frontend developer, I want typed React hooks for subscribing to Pusher channels and events, so that I can replace Socket.io client usage in components without rewriting business logic.

#### Acceptance Criteria

1. THE Pusher_Client SHALL be initialised as a singleton using `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER`, with `authEndpoint` set to `/api/pusher/auth`.
2. THE Pusher_Client SHALL expose a `usePusherChannel(channelName)` hook that subscribes on mount and unsubscribes on unmount.
3. THE Pusher_Client SHALL expose a `usePusherEvent(channel, eventName, handler)` hook that binds the handler on mount and unbinds on unmount.
4. THE Pusher_Client SHALL expose a `usePresenceChannel(roomId)` hook that returns `{ channel, members, myId }`.
5. WHEN `pusher:member_added` fires on a Presence_Channel, THE Pusher_Client SHALL update the `members` map returned by `usePresenceChannel` reactively.
6. WHEN `pusher:member_removed` fires on a Presence_Channel, THE Pusher_Client SHALL remove the member from the `members` map returned by `usePresenceChannel` reactively.
7. WHEN the Pusher subscription fails (e.g. `pusher:subscription_error`), THE Pusher_Client SHALL surface the error so the consuming component can redirect to sign-in.

---

### Requirement 11: Socket.io Removal and Dependency Cleanup

**User Story:** As a developer, I want all Socket.io code and dependencies removed, so that the project no longer requires a standalone server process and is fully compatible with Vercel serverless deployment.

#### Acceptance Criteria

1. THE System SHALL remove `socket.io`, `socket.io-client`, and `@types/socket.io` from `package.json` after migration.
2. THE System SHALL add `pusher` (server SDK) and `pusher-js` (client SDK) to `package.json`.
3. THE System SHALL delete `server/socket-server.ts` after migration.
4. THE System SHALL delete or replace `lib/websocket.ts` with `lib/pusher/client.ts` after migration.
5. THE System SHALL remove the `socket:dev`, `socket:build`, `socket:start`, and `socket:watch` scripts from `package.json`.
6. THE System SHALL add `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, and `NEXT_PUBLIC_PUSHER_CLUSTER` to `.env.example`.
7. THE System SHALL update `app/ClientLayout.tsx` to initialise the Pusher_Client instead of a Socket.io provider.

---

### Requirement 12: Security and Channel Isolation

**User Story:** As a platform operator, I want all real-time channels to be authenticated and properly isolated, so that users cannot intercept each other's signals or notifications.

#### Acceptance Criteria

1. THE System SHALL use only `private-` or `presence-` prefixed Pusher channels for all Watch Party and notification events; public channels SHALL NOT be used.
2. WHEN a user attempts to subscribe to `private-signal-{userId}` where `userId` does not match their `session.user.id`, THE Auth_Route SHALL return HTTP 403.
3. THE System SHALL verify host identity server-side against MongoDB for all player-control requests; client-supplied host status SHALL NOT be trusted.
4. THE System SHALL never include `PUSHER_SECRET` in any client-side bundle or API response.
5. WHEN the `/api/auth/socket-token` route is no longer needed after migration, THE System SHALL remove it to reduce the attack surface.

---

### Requirement 13: WatchPartyRoom Data Model Update

**User Story:** As a developer, I want the WatchPartyRoom data model updated to reflect the Pusher-based architecture, so that deprecated Socket.io fields do not cause confusion.

#### Acceptance Criteria

1. THE System SHALL mark the `socketId` field on `ParticipantSchema` as deprecated and SHALL NOT write new values to it after migration.
2. WHEN a participant joins a room via `/api/pusher/watchparty/join`, THE WatchParty_API SHALL NOT set `socketId` on the participant document.
3. THE System SHALL preserve the `socketId` field in the schema for backward compatibility with existing data.

---

### Requirement 14: Error Handling and Resilience

**User Story:** As a user, I want the system to handle errors gracefully, so that transient failures do not permanently disrupt my Watch Party session.

#### Acceptance Criteria

1. WHEN `pusherServer.trigger()` throws an error, THE WatchParty_API SHALL catch the error, log it server-side, and return HTTP 500 to the client.
2. WHEN the Auth_Route returns 401 or 403 during a channel subscription attempt, THE Pusher_Client SHALL emit a `pusher:subscription_error` event that the consuming component can handle.
3. WHEN a participant's browser closes without calling the leave endpoint, THE Presence_Channel SHALL automatically emit `pusher:member_removed` to remaining subscribers within Pusher's disconnection detection window.
4. WHEN a WebRTC signal is sent to a target user who is offline, THE WatchParty_API SHALL return HTTP 200 and the calling client SHALL handle the resulting WebRTC timeout by displaying a "peer unavailable" message.
5. IF a `player-control` request fails due to a Pusher error, THEN THE WatchParty_API SHALL return HTTP 500 so the Host client can retry the action.
