// src/components/ui/FancyGraphLoader.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FancyGraphLoaderProps {
  message?: string;
  showMessage?: boolean;
}

// 애니메이션될 막대 높이 비율
const barHeights = [0.6, 0.8, 0.5, 0.7, 0.9];

export const FancyGraphLoader: React.FC<FancyGraphLoaderProps> = ({
  message = "로딩 중입니다. 잠시만 기다려 주세요...",
  showMessage = true,
}) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Card className="mx-auto w-64 h-48 flex flex-col items-center justify-center p-3 bg-white/90 backdrop-blur-sm border">
        <div className="relative w-full h-full flex items-end">
          {/* 막대 그래프 애니메이션 */}
          {barHeights.map((height, idx) => (
            <motion.div
              key={idx}
              className="mx-1 bg-primary-600 w-3 rounded-t"
              style={{ height: `${height * 100}%` }}
              initial={{ scaleY: 0.5 }}
              animate={{ scaleY: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.2,
                delay: idx * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          {/* 라인 차트 애니메이션 */}
          <svg className="absolute inset-0 w-full h-full">
            <motion.path
              d="M8,104 L40,64 L72,80 L104,56 L136,84 L168,60"
              fill="none"
              stroke="#9333EA"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
          </svg>
        </div>
        {showMessage && (
          <motion.p
            className="mt-2 text-xs text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {message}
          </motion.p>
        )}
      </Card>
    </div>
  );
};
