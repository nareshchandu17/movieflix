/**
 * @file usePusher.ts
 * @description Custom React state hook for managing reactive client-side workflows and events.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher/client";
import { PresenceChannel, Channel } from "pusher-js";

/**
 * Hook to subscribe to a standard Pusher channel.
 * Automatically handles cleanup (unsubscribing) on unmount.
 */
export function usePusherChannel(channelName: string): Channel | null {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!channelName) return;

    const pusher = getPusherClient();
    const chan = pusher.subscribe(channelName);
    setChannel(chan);

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [channelName]);

  return channel;
}

/**
 * Hook to bind an event handler to a Pusher channel.
 * Automatically handles unbinding on unmount or when dependencies change.
 */
export function usePusherEvent<T = unknown>(
  channel: Channel | null,
  eventName: string,
  handler: (data: T) => void
): void {
  useEffect(() => {
    if (!channel || !eventName || !handler) return;

    channel.bind(eventName, handler);

    return () => {
      channel.unbind(eventName, handler);
    };
  }, [channel, eventName, handler]);
}

interface MemberInfo {
  userName: string;
  isHost: boolean;
}

/**
 * Hook to subscribe to a Pusher presence channel for room membership.
 * Surfaces the channel instance, a live reactive map of online members, the user's ID, and error states.
 */
export function usePresenceChannel(roomId: string) {
  const [channel, setChannel] = useState<PresenceChannel | null>(null);
  const [members, setMembers] = useState<Record<string, MemberInfo>>({});
  const [myId, setMyId] = useState<string | null>(null);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const pusher = getPusherClient();
    const channelName = `presence-room-${roomId}`;
    const presChannel = pusher.subscribe(channelName) as PresenceChannel;

    setChannel(presChannel);

    const handleSuccess = () => {
      setMyId(presChannel.members.myID);
      const liveMembers: Record<string, MemberInfo> = {};
      presChannel.members.each((member: any) => {
        liveMembers[member.id] = member.info;
      });
      setMembers(liveMembers);
    };

    const handleMemberAdded = (member: any) => {
      setMembers((prev) => ({
        ...prev,
        [member.id]: member.info,
      }));
    };

    const handleMemberRemoved = (member: any) => {
      setMembers((prev) => {
        const next = { ...prev };
        delete next[member.id];
        return next;
      });
    };

    const handleError = (err: unknown) => {
      console.error(`❌ Pusher presence subscription error on ${channelName}:`, err);
      setError(err);
    };

    presChannel.bind("pusher:subscription_succeeded", handleSuccess);
    presChannel.bind("pusher:member_added", handleMemberAdded);
    presChannel.bind("pusher:member_removed", handleMemberRemoved);
    presChannel.bind("pusher:subscription_error", handleError);

    return () => {
      presChannel.unbind("pusher:subscription_succeeded", handleSuccess);
      presChannel.unbind("pusher:member_added", handleMemberAdded);
      presChannel.unbind("pusher:member_removed", handleMemberRemoved);
      presChannel.unbind("pusher:subscription_error", handleError);
      pusher.unsubscribe(channelName);
    };
  }, [roomId]);

  return { channel, members, myId, error };
}
