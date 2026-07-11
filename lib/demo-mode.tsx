"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Demo mode shows realistic sample data; real mode shows only the user's
 * actual data (arriving in Phase 2). The two are never mixed.
 * Defaults to ON while no real data source exists.
 */
const DemoModeContext = createContext<{
  demo: boolean;
  setDemo: (value: boolean) => void;
}>({ demo: true, setDemo: () => {} });

const STORAGE_KEY = "founderos-demo-mode";

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demo, setDemoState] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setDemoState(stored === "on");
  }, []);

  const setDemo = (value: boolean) => {
    setDemoState(value);
    window.localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
  };

  return (
    <DemoModeContext.Provider value={{ demo, setDemo }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
