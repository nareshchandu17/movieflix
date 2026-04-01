"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Room {
  id: string;
  name: string;
  host: string;
  participants: string[];
  movieId?: string;
  createdAt: Date;
}

interface RoomContextType {
  rooms: Map<string, Room>;
  currentRoom: Room | null;
  createRoom: (hostName: string, movieId?: string) => string;
  joinRoom: (roomId: string, userName: string) => void;
  leaveRoom: (roomId: string, userName: string) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [rooms, setRooms] = useState<Map<string, Room>>(new Map());
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const createRoom = (hostName: string, movieId?: string): string => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: Room = {
      id: roomId,
      name: `${hostName}'s Watch Party`,
      host: hostName,
      participants: [hostName],
      movieId: movieId,
      createdAt: new Date()
    };

    setRooms(prev => new Map(prev).set(roomId, newRoom));
    setCurrentRoom(newRoom);
    
    return roomId;
  };

  const joinRoom = (roomId: string, userName: string) => {
    const room = rooms.get(roomId);
    if (room && !room.participants.includes(userName)) {
      const updatedRoom = {
        ...room,
        participants: [...room.participants, userName]
      };
      
      setRooms(prev => new Map(prev).set(roomId, updatedRoom));
      setCurrentRoom(updatedRoom);
    }
  };

  const leaveRoom = (roomId: string, userName: string) => {
    const room = rooms.get(roomId);
    if (room) {
      const updatedRoom = {
        ...room,
        participants: room.participants.filter(p => p !== userName)
      };
      
      if (updatedRoom.participants.length === 0) {
        // Delete room if no participants left
        setRooms(prev => {
          const newRooms = new Map(prev);
          newRooms.delete(roomId);
          return newRooms;
        });
        if (currentRoom?.id === roomId) {
          setCurrentRoom(null);
        }
      } else {
        // Update room with remaining participants
        setRooms(prev => new Map(prev).set(roomId, updatedRoom));
        if (currentRoom?.id === roomId) {
          setCurrentRoom(updatedRoom);
        }
      }
    }
  };

  const value: RoomContextType = {
    rooms,
    currentRoom,
    createRoom,
    joinRoom,
    leaveRoom
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
