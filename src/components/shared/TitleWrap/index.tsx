import React from "react";
import { Button } from "@/components/ui/button";


interface ButtonProps {
  label: string; // 버튼 텍스트
  onClick?: () => void; // 버튼 클릭 이벤트 (선택)
  variant?: "link" | "menu" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "menuActive" | "menuOpened" | "login" | "customblue" | null; // 버튼 스타일링 (선택)
  type?: "button" | "submit" | "reset"; // 버튼 타입 (기본값: button)
  disabled?: boolean; 
}

interface TitleWrapProps {
  title: string; // 제목 텍스트
  totalCount?: number; // 총 건수 (선택)
  buttons?: ButtonProps[]; // 버튼 목록 (선택)
  className?: string; // 추가적인 클래스명
}

const TitleWrap: React.FC<TitleWrapProps> = ({
  title,
  totalCount,
  buttons,
  className,
}) => {
  return (
    <div className={`flex justify-between items-center mb-2 text-[#333] ${className || ""}`}>
      {/* 제목과 총 건수 */}
      <div className="flex items-center">
        <h2 className="text-sm">{title}</h2>
        {totalCount !== undefined && (
          <span className="text-sm text-[#777] pl-2">
            (총 <span className="text-[#F01E29]">{totalCount}</span> 건)
          </span>
        )}
      </div>

      {/* 버튼 목록 */}
      {buttons && buttons.length > 0 && (
        <ul className="flex gap-1">
          {buttons.map((button, index) => (
            <li key={index}>
              <Button
                variant={button.variant || "default"}
                type={button.type || "button"}
                onClick={button.onClick}
                disabled={button.disabled || false} // disabled 속성 전달
              >
                {button.label}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TitleWrap;