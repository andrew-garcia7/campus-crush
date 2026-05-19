"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    return () => {
      socket.disconnect();
    };
  }, []);
};
