# Implementation Plan: Pusher Real-Time Migration

## Overview

Replace the standalone Socket.io server (`server/socket-server.ts`) with Pusher Channels so that all real-time features run entirely inside Next.js API routes. The migration proceeds in layers: infrastructure first (Pusher SDK + env), then server-side helpers, then API routes, then client hooks, then component rewiring, and finally cleanup of Socket.io artifacts.

## Tasks

- [ ] 1. Install Pusher dependencies and configure environment variables
  - Run `npm install pusher@^5.2.0 pusher-js@^8.4.0` to add the Pusher server and client SDKs
  - Add `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, and `NEXT_PUBLIC_PUSHER_CLUSTER` entries to `.env.example` with placeholder values and comments
  - Verify both packages appear in `package.json` under `dependencies`
  - _Requirements: 1.1, 11.2, 11.6_

- [ ] 2. Create the Pusher server client singleton (`lib/pusher/server.ts`)
  - [ ] 2.1 Implement `lib/pusher/server.ts` with singleton initialisation and channel helpers
    - Initialise `new Pusher(...)` using `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` env vars
    - Throw a descriptive configuration error at module load time if any of the four vars are absent
    - Export `pusherServer` as the singleton instance
    - Implement `triggerRoomEvent(roomId, event, data)` targeting `presence-room-{roomId}`
    - Implement `triggerUserEvent(userId, event, data)` targeting `private-user-{userId}`
    - Implement `triggerSignalEvent(targetUserId, event, data)` targeting `private-signal-{targetUserId}`
    - Ensure no server-only env vars are referenced with `NEXT_PUBLIC_` prefix
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write property test for channel name construction (Property 2)
    - **Property 2: Channel Name Construction** — for any `roomId`, `triggerRoomEvent` constructs `presence-room-{roomId}`; for any `userId`, `triggerUserEvent` constructs `private-user-{userId}`; for any `targetUserId`, `triggerSignalEvent` constructs `private-signal-{targetUserId}`; no helper produces a public (unprefixed) channel name
    - **Validates: Requirements 1.2, 1.3, 1.4, 9.1, 12.1**

  - [ ]* 2.3 Write property test for channel name length safety (Property 3)
    - **Property 3: Channel Name Length Safety** — for any `roomId`, `userId`, or `targetUserId` string, the channel name produced by the corresponding helper is no longer than 200 characters
    - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ] 3. Create the Pusher auth API route (`app/api/pusher/auth/route.ts`)
  - [ ] 3.1 Implement `POST /api/pusher/auth` with session validation and channel signing
    - Validate the caller's NextAuth session; return 401 if absent or invalid
    - Parse `socket_id` and `channel_name` from the request body
    - For `presence-` channels: call `pusherServer.authorizeChannel(socket_id, channel_name, { user_id, user_info: { userName, isHost: false } })`
    - For `private-signal-{userId}` channels: extract `userId` from the channel name and return 403 if it does not match `session.user.id`
    - For `private-user-{userId}` channels: sign with `pusherServer.authorizeChannel(socket_id, channel_name)`
    - For any channel not prefixed with `private-` or `presence-`: return 403
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 3.2 Write property test for auth gate (Property 1)
    - **Property 1: Auth Gate** — for any request to `/api/pusher/auth` where `session.user.id` is absent or invalid, the response status is 401
    - **Validates: Requirements 2.2, 3.2, 4.2, 5.2, 6.5, 7.2, 8.2**

  - [ ]* 3.3 Write property test for auth isolation — signal channel (Property 4)
    - **Property 4: Auth Isolation — Signal Channel** — for any `userId` and any `session.user.id` that differs from `userId`, a POST to `/api/pusher/auth` requesting `private-signal-{userId}` returns HTTP 403
    - **Validates: Requirements 2.4, 12.2**

  - [ ]* 3.4 Write property test for auth isolation — public channel rejection (Property 5)
    - **Property 5: Auth Isolation — Public Channel Rejection** — for any channel name that does not start with `private-` or `presence-`, the auth route returns HTTP 403 regardless of session validity
    - **Validates: Requirements 2.5, 12.1**

  - [ ]* 3.5 Write property test for presence auth payload completeness (Property 6)
    - **Property 6: Presence Auth Payload Completeness** — for any valid authenticated request for a `presence-` channel, the returned auth payload contains `user_id` equal to `session.user.id` and a `user_info` object containing at least `userName`
    - **Validates: Requirements 2.3**

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Watch Party room creation route (`app/api/pusher/watchparty/create/route.ts`)
  - [ ] 5.1 Implement `POST /api/pusher/watchparty/create`
    - Validate NextAuth session; return 401 if absent
    - Parse and validate `{ roomName, movieId, isPrivate?, password?, maxParticipants? }` from request body
    - Generate a unique 6-character alphanumeric `roomId` (same charset as existing `generateRoomCode`)
    - Create a `WatchPartyRoom` document in MongoDB with `hostId` set to `session.user.id` and the creator as the first participant (no `socketId` field)
    - Return the created room details in the response body
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.2_

  - [ ]* 5.2 Write property test for unique room ID generation (Property 15)
    - **Property 15: Unique Room ID Generation** — for any set of N room creation requests, all N generated `roomId` values are distinct
    - **Validates: Requirements 3.5**

  - [ ]* 5.3 Write property test for host assignment on room creation (Property 16)
    - **Property 16: Host Assignment on Room Creation** — for any valid room creation request, the `hostId` field on the created `WatchPartyRoom` document equals `session.user.id`
    - **Validates: Requirements 3.3**

- [ ] 6. Implement Watch Party join route (`app/api/pusher/watchparty/join/route.ts`)
  - [ ] 6.1 Implement `POST /api/pusher/watchparty/join`
    - Validate NextAuth session; return 401 if absent
    - Parse and validate `{ roomId, userName }` from request body
    - Return 404 if room does not exist in MongoDB
    - Return 400 with "Room is full" if `participants.length >= maxParticipants`
    - Return 403 if room is private and provided password does not match
    - Upsert participant using `{ "participants.userId": { $ne: session.user.id } }` guard to prevent duplicates
    - Do NOT set `socketId` on the participant document
    - Call `triggerRoomEvent(roomId, "user-joined", { userId, userName, isHost })` after successful upsert
    - Return `{ roomId, movieId, playState, currentTime, participants }` on success
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 13.1, 13.2_

  - [ ]* 6.2 Write property test for idempotent room join (Property 11)
    - **Property 11: Idempotent Room Join** — for any user already a participant in a room, submitting a join request does NOT increase the length of the `participants` array in MongoDB
    - **Validates: Requirements 4.6**

  - [ ]* 6.3 Write property test for join response shape (Property 12)
    - **Property 12: Join Response Shape** — for any successful join request, the response body contains all of `roomId`, `movieId`, `playState`, `currentTime`, and `participants`
    - **Validates: Requirements 4.8**

  - [ ]* 6.4 Write property test for room capacity enforcement (Property 13)
    - **Property 13: Room Capacity Enforcement** — for any room where `participants.length >= maxParticipants`, a join request returns HTTP 400 and the participant list remains unchanged
    - **Validates: Requirements 4.4**

  - [ ]* 6.5 Write property test for private room password enforcement (Property 14)
    - **Property 14: Private Room Password Enforcement** — for any private room and any password string that does not match `room.password`, a join request returns HTTP 403 and the participant list remains unchanged
    - **Validates: Requirements 4.5**

  - [ ]* 6.6 Write property test for no socketId written on join (Property 25)
    - **Property 25: No socketId Written on Join** — for any participant document created by the join route after migration, the `socketId` field is absent or `undefined`
    - **Validates: Requirements 13.1, 13.2**

- [ ] 7. Implement Watch Party leave route (`app/api/pusher/watchparty/leave/route.ts`)
  - Validate NextAuth session; return 401 if absent
  - Parse and validate `{ roomId }` from request body
  - Remove the user from `participants` array in MongoDB using `$pull`
  - Call `triggerRoomEvent(roomId, "room-state", { participants })` with the updated participant list
  - Return 200 on success
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. Implement Watch Party player-control route (`app/api/pusher/watchparty/player-control/route.ts`)
  - [ ] 8.1 Implement `POST /api/pusher/watchparty/player-control`
    - Validate NextAuth session; return 401 if absent
    - Parse and validate `{ roomId, action, time? }` from request body; return 400 if `action` is `"seek"` and `time` is absent
    - Fetch room from MongoDB; return 404 if not found
    - Return 403 if `session.user.id` does not match `room.hostId.toString()` — do NOT call `pusherServer.trigger()`
    - Update `currentPlayState` (for play/pause) or `currentTime` (for seek) in MongoDB
    - Call `triggerRoomEvent(roomId, "player-control", { action, time, userId, userName, timestamp: Date.now() })`
    - Catch Pusher errors and return 500
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 14.1, 14.5_

  - [ ]* 8.2 Write property test for host-only playback enforcement (Property 7)
    - **Property 7: Host-Only Playback Enforcement** — for any `player-control` request where `session.user.id` does not equal `room.hostId`, the response status is 403 and `pusherServer.trigger()` is NOT called
    - **Validates: Requirements 6.4, 12.3**

  - [ ]* 8.3 Write property test for player state persistence (Property 8)
    - **Property 8: Player State Persistence** — for any valid `play` or `pause` action by the Host, `WatchPartyRoom.currentPlayState` is updated to match the action and a `player-control` event is triggered
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 8.4 Write property test for seek state persistence (Property 9)
    - **Property 9: Seek State Persistence** — for any valid `seek` action with a non-negative `time` value by the Host, `WatchPartyRoom.currentTime` is updated to that value and a `player-control` event is triggered
    - **Validates: Requirements 6.3**

  - [ ]* 8.5 Write property test for PlayerControlPayload completeness (Property 10)
    - **Property 10: PlayerControlPayload Completeness** — for any valid player-control action, the Pusher event payload contains all of `action`, `userId`, `userName`, and `timestamp`; `time` is present when `action` is `"seek"`
    - **Validates: Requirements 6.6**

  - [ ]* 8.6 Write property test for payload JSON serialisability (Property 26)
    - **Property 26: Payload JSON Serialisability** — for any `PlayerControlPayload`, `ChatMessagePayload`, or `SignalingPayload` instance, `JSON.stringify(payload)` completes without throwing
    - **Validates: Requirements 6.6, 7.4, 8.4**

- [ ] 9. Implement Watch Party chat route (`app/api/pusher/watchparty/chat/route.ts`)
  - [ ] 9.1 Implement `POST /api/pusher/watchparty/chat`
    - Validate NextAuth session; return 401 if absent
    - Parse and validate `{ roomId, message }` from request body
    - Return 400 if `message` is empty or whitespace-only — do NOT persist or call `pusherServer.trigger()`
    - Persist the message to `WatchPartyRoom.chatHistory` in MongoDB
    - Build a `ChatMessagePayload` with `id` (UUID), `userId`, `userName`, `message`, `timestamp` (ISO string), `type: "text"`
    - Call `triggerRoomEvent(roomId, "chat-message", chatMessagePayload)`
    - Catch Pusher errors and return 500
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 14.1_

  - [ ]* 9.2 Write property test for whitespace chat message rejection (Property 17)
    - **Property 17: Whitespace Chat Message Rejection** — for any `message` string composed entirely of whitespace, the chat route returns HTTP 400, does NOT persist the message, and does NOT call `pusherServer.trigger()`
    - **Validates: Requirements 7.3**

  - [ ]* 9.3 Write property test for ChatMessagePayload completeness (Property 18)
    - **Property 18: ChatMessagePayload Completeness** — for any valid chat message, the Pusher event payload contains all of `id`, `userId`, `userName`, `message`, `timestamp` (ISO string), and `type: "text"`
    - **Validates: Requirements 7.4**

- [ ] 10. Implement Watch Party signaling route (`app/api/pusher/watchparty/signal/route.ts`)
  - [ ] 10.1 Implement `POST /api/pusher/watchparty/signal`
    - Validate NextAuth session; return 401 if absent
    - Parse and validate `{ roomId, targetUserId, type, sdp?, candidate? }` from request body
    - Fetch room from MongoDB; return 403 if `session.user.id` is not in `room.participants`
    - Call `triggerSignalEvent(targetUserId, "signaling", { type, sdp, candidate, senderId, senderName, roomId })`
    - Do NOT persist the signaling payload to MongoDB
    - Return 200 even if the target user is offline (Pusher silently drops the event)
    - Catch Pusher errors and return 500
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 14.1_

  - [ ]* 10.2 Write property test for signaling channel isolation (Property 19)
    - **Property 19: Signaling Channel Isolation** — for any signaling request with `targetUserId`, the Pusher trigger targets `private-signal-{targetUserId}` exclusively
    - **Validates: Requirements 8.1, 8.3**

  - [ ]* 10.3 Write property test for SignalingPayload completeness (Property 20)
    - **Property 20: SignalingPayload Completeness** — for any valid signaling request, the Pusher event payload contains `type`, `senderId`, `senderName`, and `roomId`; `sdp` is present for `offer`/`answer`; `candidate` is present for `ice-candidate`
    - **Validates: Requirements 8.4**

- [ ] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Create the notification delivery utility (`lib/pusher/notifications.ts`)
  - Implement `pushNotificationToUser(userId, notification)` that calls `triggerUserEvent(userId, "new-notification", notification)`
  - Ensure the full notification object is passed through unchanged
  - Do NOT trigger on public channels
  - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 12.1 Write property test for notification channel isolation (Property 21)
    - **Property 21: Notification Channel Isolation** — for any call to `pushNotificationToUser(userId, notification)`, the Pusher trigger targets `private-user-{userId}` and the full `notification` object is included in the event data unchanged
    - **Validates: Requirements 9.1, 9.3**

- [ ] 13. Integrate `pushNotificationToUser` into existing notification API routes
  - Update `app/api/notifications/route.ts` (and any other routes that create notifications) to call `pushNotificationToUser` after persisting a notification to MongoDB
  - Remove any remaining calls to `RedisManager.emitSyncEvent` that were used for the `sync:*:notification` polling bridge
  - Verify no code path polls Redis keys matching `sync:*:notification` for notification delivery after this change
  - _Requirements: 9.4_

- [ ] 14. Create the Pusher client singleton and React hooks (`lib/pusher/client.ts` and `hooks/usePusher.ts`)
  - [ ] 14.1 Implement `lib/pusher/client.ts` — Pusher browser singleton
    - Initialise `new Pusher(NEXT_PUBLIC_PUSHER_KEY, { cluster: NEXT_PUBLIC_PUSHER_CLUSTER, authEndpoint: "/api/pusher/auth", authTransport: "ajax" })` once
    - Export `getPusherClient()` that returns the same instance on every call (singleton pattern)
    - _Requirements: 10.1, 12.4_

  - [ ]* 14.2 Write property test for Pusher client singleton (Property 24)
    - **Property 24: Pusher Client Singleton** — for any number of calls to `getPusherClient()` within the same browser session, all calls return the same `Pusher` instance (reference equality)
    - **Validates: Requirements 10.1**

  - [ ] 14.3 Implement `hooks/usePusher.ts` — `usePusherChannel`, `usePusherEvent`, and `usePresenceChannel` hooks
    - `usePusherChannel(channelName)`: subscribes on mount, unsubscribes on unmount; returns the `Channel` or `null`
    - `usePusherEvent<T>(channel, eventName, handler)`: binds handler on mount, unbinds on unmount; re-binds when handler reference changes
    - `usePresenceChannel(roomId)`: subscribes to `presence-room-{roomId}`; returns `{ channel, members, myId }`; updates `members` reactively on `pusher:member_added` and `pusher:member_removed`; surfaces `pusher:subscription_error` so the consuming component can redirect to sign-in
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 14.4 Write property test for presence membership reactivity (Property 23)
    - **Property 23: Presence Membership Reactivity** — for any sequence of `pusher:member_added` and `pusher:member_removed` events, the `members` map returned by `usePresenceChannel` reflects the current live membership after each event
    - **Validates: Requirements 10.5, 10.6**

- [ ] 15. Replace `hooks/useWatchPartySocket.ts` with a Pusher-backed hook (`hooks/useWatchPartyPusher.ts`)
  - Create `hooks/useWatchPartyPusher.ts` that mirrors the public API of `useWatchPartySocket` (same return shape: `socketState`, `playbackState`, `chatMessages`, `reactions`, `play`, `pause`, `seek`, `sendMessage`, `sendReaction`, `setStatus`, `setQuality`, `updateProgress`)
  - Use `usePresenceChannel(roomId)` for room membership and `usePusherEvent` for `player-control`, `chat-message`, `user-joined`, `room-state` events
  - Replace socket `emit` calls with `fetch` POSTs to the corresponding `/api/pusher/watchparty/*` routes
  - Map `isConnected` to the Pusher subscription state (connected when `pusher:subscription_succeeded` fires)
  - Map `isHost` by comparing `myId` from `usePresenceChannel` against the `hostId` returned in the join response
  - _Requirements: 10.2, 10.3, 10.4, 4.1, 6.1, 6.2, 6.3, 7.1_

- [ ] 16. Update the Watch Party room page to use the new Pusher hook
  - In `app/watch-party/room/[roomId]/page.tsx`, replace the `useWatchPartySocket` import with `useWatchPartyPusher`
  - Call `POST /api/pusher/watchparty/join` on mount to register the participant and receive initial room state
  - Call `POST /api/pusher/watchparty/leave` on unmount / when the user clicks Leave
  - Subscribe to `private-signal-{userId}` via `usePusherChannel` for WebRTC signaling events
  - Update the `WatchPartyFooter` and `WatchPartySidePanel` props to use the new hook's return values (the shape is identical, so prop names should not change)
  - _Requirements: 4.1, 4.7, 5.1, 5.3, 8.1_

- [ ] 17. Update `app/watch-party/page.tsx` to use Pusher-backed room creation and join
  - Replace the `createRoom` call (from `RoomContext`) with a `fetch` POST to `/api/pusher/watchparty/create`
  - Replace the `joinRoom` call with a `fetch` POST to `/api/pusher/watchparty/join`
  - Navigate to `/watch-party/room/{roomId}` after successful creation or join
  - _Requirements: 3.1, 4.1_

- [ ] 18. Update `app/ClientLayout.tsx` to initialise the Pusher client and notification listener
  - Remove any Socket.io provider or `socket` import
  - Add a `NotificationListener` component (or inline effect) that calls `usePusherChannel(`private-user-${session.user.id}`)` and `usePusherEvent(channel, "new-notification", handler)` to display toast notifications and invalidate the notifications query cache
  - Only render the listener when `status === "authenticated"`
  - _Requirements: 9.1, 10.2, 10.3, 11.7_

- [ ] 19. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Update `models/WatchPartyRoom.ts` to mark `socketId` as deprecated
  - Add a JSDoc `@deprecated` comment to the `socketId` field on `ParticipantSchema`
  - Keep the field in the schema (do not remove it) for backward compatibility with existing documents
  - _Requirements: 13.1, 13.3_

- [ ] 21. Remove Socket.io artifacts and clean up dependencies
  - [ ] 21.1 Delete `server/socket-server.ts`
    - _Requirements: 11.3_

  - [ ] 21.2 Delete `lib/socket/client.ts` and `lib/websocket.ts`
    - _Requirements: 11.4_

  - [ ] 21.3 Delete `app/api/auth/socket-token/route.ts` to reduce attack surface
    - _Requirements: 12.5_

  - [ ] 21.4 Remove `socket.io`, `socket.io-client`, and `@types/socket.io` from `package.json`
    - Run `npm uninstall socket.io socket.io-client @types/socket.io`
    - _Requirements: 11.1_

  - [ ] 21.5 Remove the `socket:dev`, `socket:build`, `socket:start`, and `socket:watch` scripts from `package.json`
    - _Requirements: 11.5_

  - [ ] 21.6 Remove the Redis notification polling loop from `lib/websocket.ts` (already deleted) and verify no remaining `setupRedisSubscription`-style polling exists in the codebase
    - Search for `sync:*:notification` key patterns and `setInterval` blocks that poll Redis for notifications; remove any found
    - _Requirements: 9.4_

- [ ] 22. Final checkpoint — Ensure all tests pass and build succeeds
  - Run `npm run build` to verify the Next.js build completes without errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each major phase boundary
- Property tests use `fast-check` as specified in the design's testing strategy
- Unit tests mock `pusherServer.trigger()` and MongoDB calls to test routes in isolation
- The `useWatchPartyPusher` hook is a drop-in replacement for `useWatchPartySocket` — the consuming page components require only an import swap
- `PUSHER_SECRET` must never appear in any `NEXT_PUBLIC_` variable or client bundle
