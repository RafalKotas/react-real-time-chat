import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** Shared interval (ms) for chat list and chat messages so they refresh together. */
export const CHAT_POLL_MS = 3000;

const PollContext = createContext(0);

export function PollProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), CHAT_POLL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <PollContext.Provider value={tick}>
      {children}
    </PollContext.Provider>
  );
}

export function usePollTick(): number {
  return useContext(PollContext);
}
