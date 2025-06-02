import React, { useState, useEffect, ReactNode } from 'react';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import { Label } from "@/components/ui/label";

export interface BlackListCountPopupProps {
    campaignId?: string | number;
    blackListCount?: number;
    maxBlacklistCount?: number;
    commonBlacklistCount?: number;
    isOpen?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

const BlackListCountPopup = ({
    campaignId,
    blackListCount = 0,
    maxBlacklistCount = 1000000,
    commonBlacklistCount = 0,
    isOpen = false,
    onConfirm = () => {},
    onCancel
}: BlackListCountPopupProps) => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            // 가짜 로딩 효과
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    }, [isOpen]);

    const content = (
        <div 
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <div className="flex items-center gap-2 justify-between">
                <Label className="w-48">캠페인 ID</Label>
                <span>{campaignId}</span>
            </div>
            <div className="flex items-center gap-2 justify-between">
                <Label className="w-48">블랙리스트 등록건수</Label>
                {isLoading ? (
                    <span>로딩 중...</span>
                ) : (
                    <span>{blackListCount.toLocaleString()}</span>
                )}
            </div>
            <div className="flex items-center gap-2 justify-between">
                <Label className="w-48">블랙리스트 MAX 등록 건수</Label>
                {isLoading ? (
                    <span>로딩 중...</span>
                ) : (
                    <span>{maxBlacklistCount.toLocaleString()}</span>
                )}
            </div>
            <div className="flex items-center gap-2 justify-between">
                <Label className="w-48">공통 적용된 블랙리스트 등록 건수</Label>
                {isLoading ? (
                    <span>로딩 중...</span>
                ) : (
                    <span>{commonBlacklistCount.toLocaleString()}</span>
                )}
            </div>
        </div>
    );

    return (
       
        <CustomAlert
            isOpen={isOpen}
            title="블랙리스트 건수 조회"
            message={content}
            onClose={onConfirm}
            onCancel={onCancel}  // Changed from onCancel to onCancel
            type="info"
        />
    );
};

export default BlackListCountPopup;