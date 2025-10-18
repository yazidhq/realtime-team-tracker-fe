import { useEffect, useRef, useState } from "react";

export function usePanelToggle(initial = null, transitionMs = 300) {
  const [activePanel, setActivePanel] = useState(initial);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef(null);

  const togglePanel = (panelName) => {
    if (isTransitioning) return;

    if (activePanel === panelName) {
      setActivePanel(null);
      return;
    }

    if (!activePanel) {
      setActivePanel(panelName);
      return;
    }

    setIsTransitioning(true);
    setActivePanel(null);

    timeoutRef.current = setTimeout(() => {
      setActivePanel(panelName);
      setIsTransitioning(false);
      timeoutRef.current = null;
    }, transitionMs + 30);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { activePanel, togglePanel, isTransitioning, setActivePanel };
}
