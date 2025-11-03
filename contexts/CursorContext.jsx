"use client";
import { createContext, useState, useContext, useMemo } from "react";

const CursorContext = createContext({
  cursorState: "default",
  setCursorState: (state) => {},
});

export function CursorProvider({ children }) {
  const [cursorState, setCursorState] = useState("default");

  const value = useMemo(
    () => ({
      cursorState,
      setCursorState,
    }),
    [cursorState]
  );

  return (
    <CursorContext.Provider value={value}>{children}</CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
}
