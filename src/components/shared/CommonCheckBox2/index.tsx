"use client";

import React, { useRef, useEffect } from 'react';
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

interface Props {
    checked: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    title?: string;
    size?: 'sm' | 'md';
    indeterminate?: boolean;
}

const CommonCheckBox2 = ({
    checked,
    onChange,
    disabled = false,
    className = "",
    title,
    size = 'sm',
    indeterminate = false
}: Props) => {
    const sizeClasses = size === 'sm' ? 'h-4 w-4' : 'h-4 w-4';
    
    // Radix UI의 checked 상태에 대한 변환
    // indeterminate가 true면 'indeterminate' 상태로 설정
    // 그렇지 않으면 checked 값에 따라 true/false로 설정
    const checkboxState = indeterminate ? 'indeterminate' : checked;
    
    const handleChange = (value: boolean | 'indeterminate') => {
        if (!disabled && onChange) {
            // 'indeterminate'인 경우 false로 변환하여 전달
            onChange(value === true);
        }
    };
    
    return (
        <div className={`relative inline-block ${className}`}>
            <CheckboxPrimitive.Root
                checked={checkboxState}
                onCheckedChange={handleChange}
                disabled={disabled}
                title={title}
                className={`${sizeClasses} flex items-center justify-center rounded-none border border-[#b6b6b6] bg-white text-[#333] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <CheckboxPrimitive.Indicator>
                    {indeterminate ? (
                        <Minus className={`${sizeClasses} text-[#333]`} strokeWidth={2} />
                    ) : (
                        <Check className={`${sizeClasses} text-[#333]`} strokeWidth={2} />
                    )}
                </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
        </div>
    );
};

export default CommonCheckBox2;