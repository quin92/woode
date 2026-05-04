import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(API_BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  return socketInstance;
};

export const setupLoyaltyPointsListener = (
  userId: number,
  callback: (points: number) => void
) => {
  const socket = getSocket();

  socket.on(`loyalty-points-${userId}`, (data) => {
    console.log("⭐ Loyalty points updated:", data.loyaltyPoints);
    callback(data.loyaltyPoints);
  });
};

export const removeLoyaltyPointsListener = (userId: number) => {
  const socket = getSocket();
  socket.off(`loyalty-points-${userId}`);
};
