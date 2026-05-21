"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const DAGITTY_PANEL_DEFAULT_WIDTH = 448;
export const DAGITTY_PANEL_MIN_WIDTH = 280;

function getPanelMaxWidth() {
  if (typeof window === "undefined") {
    return DAGITTY_PANEL_DEFAULT_WIDTH;
  }
  return window.innerWidth;
}

function clampPanelWidth(width: number, maxWidth: number) {
  return Math.min(maxWidth, Math.max(DAGITTY_PANEL_MIN_WIDTH, width));
}

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
  const [maxWidth, setMaxWidth] = useState(DAGITTY_PANEL_DEFAULT_WIDTH);
  const [width, setWidthState] = useState(DAGITTY_PANEL_DEFAULT_WIDTH);

  useEffect(() => {
    function syncMaxWidth() {
      const nextMax = getPanelMaxWidth();
      setMaxWidth(nextMax);
      setWidthState((current) => clampPanelWidth(current, nextMax));
    }

    syncMaxWidth();
    window.addEventListener("resize", syncMaxWidth);
    return () => window.removeEventListener("resize", syncMaxWidth);
  }, []);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const setWidth = useCallback((next: number) => {
    setWidthState(clampPanelWidth(next, maxWidth));
  }, [maxWidth]);

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
