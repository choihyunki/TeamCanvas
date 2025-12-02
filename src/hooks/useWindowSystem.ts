// src/hooks/useWindowSystem.ts
import { useState, useRef } from "react";
import { AppWindow, ToolType } from "../types/InApp";

export const useWindowSystem = () => {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);
  // z-index 관리용 상태 추가
  const [highestZIndex, setHighestZIndex] = useState(100);

  const dragItem = useRef<any>(null);
  const resizeItem = useRef<any>(null);

  const openWindow = (type: ToolType, title: string) => {
    let defaultW = 300;
    let defaultH = 400;
    if (type === "calculator") {
      defaultW = 220;
      defaultH = 320;
    }
    if (type === "timer") {
      defaultW = 200;
      defaultH = 150;
    }
    if (type === "youtube") {
      defaultW = 340;
      defaultH = 240;
    }
    if (type === "code-review") {
      defaultW = 600;
      defaultH = 500;
    }
    if (type === "github") {
      defaultW = 500;
      defaultH = 600;
    }

    const newWindow: AppWindow = {
      id: Date.now(),
      type,
      title,
      x: 150 + windows.length * 30,
      y: 100 + windows.length * 30,
      zIndex: highestZIndex + 1,
      minimized: false,
      width: defaultW,
      height: defaultH,
    };
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setHighestZIndex((prev) => prev + 1);
  };

  const closeWindow = (id: number) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  const bringToFront = (id: number) => {
    setActiveWindowId(id);
    setHighestZIndex((prev) => prev + 1);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w))
    );
  };

  const handleMouseDownHeader = (
    e: React.MouseEvent,
    id: number,
    x: number,
    y: number
  ) => {
    e.stopPropagation();
    bringToFront(id);
    dragItem.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: x,
      initialTop: y,
    };
  };

  const handleMouseDownResize = (
    e: React.MouseEvent,
    id: number,
    w: number,
    h: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    bringToFront(id);
    resizeItem.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: w,
      initialHeight: h,
    };
  };

  const handleWindowMouseMove = (e: React.MouseEvent) => {
    if (resizeItem.current) {
      const { id, startX, startY, initialWidth, initialHeight } =
        resizeItem.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                width: Math.max(200, initialWidth + dx),
                height: Math.max(150, initialHeight + dy),
              }
            : w
        )
      );
      return;
    }
    if (dragItem.current) {
      const { id, startX, startY, initialLeft, initialTop } = dragItem.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, x: initialLeft + dx, y: initialTop + dy } : w
        )
      );
    }
  };

  const handleMouseUp = () => {
    dragItem.current = null;
    resizeItem.current = null;
  };

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    bringToFront,
    handleMouseDownHeader,
    handleMouseDownResize,
    handleWindowMouseMove,
    handleMouseUp,
  };
};
