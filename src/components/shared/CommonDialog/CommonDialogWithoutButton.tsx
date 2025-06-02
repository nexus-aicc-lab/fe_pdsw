"use client";

import React, { useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CommonDialogWithoutButtonProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
}

const CommonDialogWithoutButton = ({
    isOpen = false,
    onOpenChange,
    title = "확인",
    children,
    maxWidth = "sm:max-w-[400px]"
}: CommonDialogWithoutButtonProps) => {
    const [open, setOpen] = useState(isOpen);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={`${maxWidth} p-0`}>
                <div className="bg-[#5DC2BD] px-4 py-2">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-base font-medium text-white">
                            {title}
                        </DialogTitle>
                    </DialogHeader>
                </div>
                
                <div className="p-4">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CommonDialogWithoutButton;