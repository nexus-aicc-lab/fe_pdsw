// src\widgets\sidebar2\resizable-devider\index.tsx
import React, { useCallback } from "react";

interface Props {
  onResize: (deltaX: number) => void;
  onResizeEnd: () => void;
  onResizeStart: () => void;
}

const ResizableSidebarDivider = ({ onResize, onResizeEnd, onResizeStart }: Props) => {
  let animationFrame: number;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onResizeStart();
    const startX = e.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => onResize(deltaX));
    };

    const handleMouseUp = () => {
      onResizeEnd();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [onResize, onResizeEnd, onResizeStart]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className="hover:bg-[#5BC2C1] transition-colors"
      style={{
        width: "6px",
        height: "100%",
        position: "absolute",
        right: "0",
        top: "0",
        cursor: "col-resize",
        zIndex: 20,
        willChange: "width", // 💡 리렌더 최적화
      }}
    />
  );
};

export default ResizableSidebarDivider;
