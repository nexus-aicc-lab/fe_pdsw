// src/components/ui/PulseBarsLoader.tsx
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface PulseBarsLoaderProps {
  /** 로더 전체 크기 (px) */
  size?: number;
  /** 메시지 */
  message?: string;
  /** 메시지 표시 여부 */
  showMessage?: boolean;
  /** 특정 스타일 강제 지정 (0-4, undefined면 랜덤) */
  forceStyle?: number;
}

// 5가지 다양한 로더 스타일 정의
const loaderStyles = [
  // 1. 세로 막대 (파스텔 블루)
  {
    name: "bars",
    primaryColor: "#93C5FD", // sky-300
    accentColor: "#DBEAFE",  // sky-200
    shape: "bars"
  },
  // 2. 원형 도트 (파스텔 핑크)
  {
    name: "dots",
    primaryColor: "#F9A8D4", // pink-300
    accentColor: "#FECDD3",  // pink-200
    shape: "dots"
  },
  // 3. 사각형 블록 (파스텔 그린)
  {
    name: "blocks",
    primaryColor: "#86EFAC", // green-300
    accentColor: "#BBF7D0", // green-200
    shape: "blocks"
  },
  // 4. 다이아몬드 (파스텔 퍼플)
  {
    name: "diamonds",
    primaryColor: "#C084FC", // purple-300
    accentColor: "#E9D5FF", // purple-200
    shape: "diamonds"
  },
  // 5. 웨이브 바 (파스텔 오렌지)
  {
    name: "waves",
    primaryColor: "#FDBA74", // orange-300
    accentColor: "#FED7AA", // orange-200
    shape: "waves"
  }
];

/**
 * PulseBarsLoader: 5가지 다양한 모양과 색상 중 랜덤 선택
 */
export const PulseBarsLoader: React.FC<PulseBarsLoaderProps> = ({
  size = 60,
  message = "로딩 중입니다...",
  showMessage = true,
  forceStyle
}) => {
  // 랜덤 스타일 선택 (컴포넌트 마운트 시 한 번만 결정)
  const selectedStyle = useMemo(() => {
    const index = forceStyle !== undefined ? forceStyle : Math.floor(Math.random() * loaderStyles.length);
    return loaderStyles[index];
  }, [forceStyle]);

  const elementCount = 3;
  const elementSize = size / 6;

  // 세로 막대 스타일
  const renderBars = () => (
    <div className="flex items-end justify-center" style={{ height: size, width: size }}>
      {Array.from({ length: elementCount }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: elementSize,
            height: size * 0.5,
            marginLeft: i > 0 ? elementSize / 2 : 0,
          }}
          initial={{ scaleY: 0.4, backgroundColor: selectedStyle.primaryColor }}
          animate={{
            scaleY: [0.4, 1, 0.4],
            backgroundColor: [selectedStyle.primaryColor, selectedStyle.accentColor, selectedStyle.primaryColor],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );

  // 원형 도트 스타일
  const renderDots = () => (
    <div className="flex items-center justify-center gap-2" style={{ height: size, width: size }}>
      {Array.from({ length: elementCount }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: elementSize,
            height: elementSize,
          }}
          initial={{ scale: 0.5, backgroundColor: selectedStyle.primaryColor }}
          animate={{
            scale: [0.5, 1.2, 0.5],
            backgroundColor: [selectedStyle.primaryColor, selectedStyle.accentColor, selectedStyle.primaryColor],
          }}
          transition={{
            duration: 1,
            delay: i * 0.15,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );

  // 사각형 블록 스타일
  const renderBlocks = () => (
    <div className="flex items-end justify-center gap-1" style={{ height: size, width: size }}>
      {Array.from({ length: elementCount }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-sm"
          style={{
            width: elementSize,
            height: size * 0.4,
          }}
          initial={{ scaleY: 0.3, backgroundColor: selectedStyle.primaryColor }}
          animate={{
            scaleY: [0.3, 1.3, 0.3],
            backgroundColor: [selectedStyle.primaryColor, selectedStyle.accentColor, selectedStyle.primaryColor],
          }}
          transition={{
            duration: 0.9,
            delay: i * 0.25,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );

  // 다이아몬드 스타일
  const renderDiamonds = () => (
    <div className="flex items-center justify-center gap-2" style={{ height: size, width: size }}>
      {Array.from({ length: elementCount }).map((_, i) => (
        <motion.div
          key={i}
          className="transform rotate-45"
          style={{
            width: elementSize,
            height: elementSize,
          }}
          initial={{ scale: 0.4, backgroundColor: selectedStyle.primaryColor }}
          animate={{
            scale: [0.4, 1.1, 0.4],
            backgroundColor: [selectedStyle.primaryColor, selectedStyle.accentColor, selectedStyle.primaryColor],
            rotate: [45, 90, 45],
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );

  // 웨이브 바 스타일
  const renderWaves = () => (
    <div className="flex items-center justify-center gap-1" style={{ height: size, width: size }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: elementSize * 0.6,
            height: size * 0.6,
          }}
          initial={{ scaleY: 0.2, backgroundColor: selectedStyle.primaryColor }}
          animate={{
            scaleY: [0.2, 1, 0.2],
            backgroundColor: [selectedStyle.primaryColor, selectedStyle.accentColor, selectedStyle.primaryColor],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.1,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );

  // 선택된 스타일에 따라 렌더링
  const renderLoader = () => {
    switch (selectedStyle.shape) {
      case "bars": return renderBars();
      case "dots": return renderDots();
      case "blocks": return renderBlocks();
      case "diamonds": return renderDiamonds();
      case "waves": return renderWaves();
      default: return renderBars();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-3">
      {renderLoader()}
      {showMessage && (
        <p className="text-xs text-gray-600 animate-pulse">{message}</p>
      )}
      {/* 개발용: 현재 스타일 표시 */}
      {/* {process.env.NODE_ENV === 'development' && (
        <p className="text-xs text-gray-400">Style: {selectedStyle.name}</p>
      )} */}
    </div>
  );
};