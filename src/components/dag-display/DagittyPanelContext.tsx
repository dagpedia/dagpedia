"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const DAGITTY_PANEL_DEFAULT_WIDTH = 448;
export const DAGITTY_PANEL_MIN_WIDTH = 280;
export const DAGITTY_PANEL_MAX_WIDTH = 720;

interface DagittyPanelContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  width: number;
  setWidth: (width: number) => void;
}

const DagittyPanelContext = createContext<DagittyPanelContextValue | null>(null);

export function DagittyPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [width, setWidthState] = useState(DAGITTY_PANEL_DEFAULT_WIDTH);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const setWidth = useCallback((next: number) => {
    setWidthState(
      Math.min(DAGITTY_PANEL_MAX_WIDTH, Math.max(DAGITTY_PANEL_MIN_WIDTH, next))
    );
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle, width, setWidth }),
    [open, toggle, width, setWidth]
  );

  return (
    <DagittyPanelContext.Provider value={value}>
      {children}
    </DagittyPanelContext.Provider>
  );
}

export function useDagittyPanel() {
  const context = useContext(DagittyPanelContext);
  if (!context) {
    throw new Error("useDagittyPanel must be used within DagittyPanelProvider.");
  }
  return context;
}

/** Returns null when outside DAG detail shell (optional consumers). */
export function useDagittyPanelOptional() {
  return useContext(DagittyPanelContext);
}
