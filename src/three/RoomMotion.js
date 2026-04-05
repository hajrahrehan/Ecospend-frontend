import { createContext, useContext } from "react";

export const RoomMotionContext = createContext(null);

export const useRoomMotion = () => {
  const context = useContext(RoomMotionContext);
  if (!context) {
    throw new Error("useRoomMotion must be used within RoomMotionContext");
  }
  return context;
};
