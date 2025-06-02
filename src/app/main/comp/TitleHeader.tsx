"use client"

// src/components/shared/layout/TitleHeader.tsx
import React from 'react'

const TitleHeader = () => {
  return (
    <div className="bg-[#5BC2C1] h-[28px] w-full flex items-center">
      <div className="px-4 flex justify-between items-center w-full">
        {/* UPDS Logo */}
        <div className="flex items-center">
          <span className="text-white font-semibold">UPDS</span>
        </div>
        {/* 오른쪽 사용자 정보 */}
        <div className="flex items-center space-x-4 text-white text-sm">
          <div className="flex items-center space-x-1">
            <span>홍길동(관리자)</span>
          </div>
          <button className="flex items-center hover:text-gray-200">
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}

export default TitleHeader