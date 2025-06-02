import React, { useState, useEffect } from 'react';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";

export interface CallingNumberPopupProps {
    param: string;
    isOpen?: boolean;
    type: string;
    onConfirm: (param: string) => void;
    onCancel?: () => void;
}

const CallingNumberPopup = ({
    param,
    type,
    isOpen = true,
    onConfirm,
    onCancel
}: CallingNumberPopupProps) => {
    const [inputValue, setInputValue] = useState(param);

    useEffect(() => {
        if(param !== null){
            setInputValue(param);
        }
    }, [param]);

    const inputField = (
        <div className="flex items-center gap-2 justify-between">
            <Label className="w-[8.3rem] min-w-[8.3rem]">
                변경할 발신번호
            </Label>
            <CustomInput
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setInputValue(value);
                }}
                maxLength={11}
            />
        </div>
    );

    return (
        <CustomAlert
            isOpen={isOpen}
            title="발신번호 변경"
            message={inputField}
            onClose={() => {
                onConfirm(inputValue);  // 확인 버튼이 눌렸을 때는 입력값 전달
            }}
            onCancel={onCancel}  // 취소 버튼, ESC, 닫기 버튼
            type={type}
        />
    );
};

export default CallingNumberPopup;