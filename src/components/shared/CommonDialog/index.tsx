"use client";

import React, { useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface CommonDialogProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    children: ReactNode;
    confirmText?: string;
    maxWidth?: string;
}

const CommonDialog = ({
    isOpen = false,
    onOpenChange,
    title = "확인",
    children,
    confirmText = "확인",
    maxWidth = "sm:max-w-[400px]"
}: CommonDialogProps) => {
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
                    
                    <div className="flex justify-end mt-6">
                        <Button 
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            className="h-8 px-4 text-sm"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CommonDialog;