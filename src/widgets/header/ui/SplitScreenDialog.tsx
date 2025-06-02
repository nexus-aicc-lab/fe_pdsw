"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TabItem } from '@/store';
import { renderTabContent } from '@/app/main/comp/renderTabContent';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SplitScreenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: TabItem[];
  onApply: () => void;
}

const OutboundCallProgressPanel = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>헤더 1</TableHead>
          <TableHead>헤더 2</TableHead>
          {/* 필요한 헤더들 추가 */}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>데이터 1</TableCell>
          <TableCell>데이터 2</TableCell>
          {/* 필요한 데이터 셀들 추가 */}
        </TableRow>
      </TableBody>
    </Table>
  );
};

const TabPreview = ({ tab, index }: { tab: TabItem; index: number }) => {
  const content = renderTabContent(tab.id);
  
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 text-xl font-semibold p-4 border-b bg-white">
        {tab.title || `화면 ${index + 1}`}
      </div>
      <div className="flex-1 relative bg-white">
        <div className="absolute inset-0 overflow-auto">
          {content}
        </div>
      </div>
    </div>
  );
};

export function SplitScreenDialog({ isOpen, onClose, tabs, onApply }: SplitScreenDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const screenRefs = useRef<Array<HTMLDivElement | null>>([]);

  function smoothScrollTo(element: HTMLElement, to: number, duration = 600) {
    const start = element.scrollTop;
    let startTime: number | null = null;

    function easeInOutQuad(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutQuad(progress);

      element.scrollTop = start + (to - start) * easedProgress;

      if (elapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop;
      let currentIndex = 0;

      for (let i = 0; i < tabs.length; i++) {
        const ref = screenRefs.current[i];
        if (ref && ref.offsetTop <= scrollPos + 10) {
          currentIndex = i;
        }
      }
      setActiveIndex(currentIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [tabs]);

  const handleScrollToIndex = (index: number) => {
    const container = containerRef.current;
    const ref = screenRefs.current[index];
    if (!container || !ref) return;

    setActiveIndex(index);

    const containerRect = container.getBoundingClientRect();
    const refRect = ref.getBoundingClientRect();
    const offset = (refRect.top - containerRect.top) + container.scrollTop;

    smoothScrollTo(container, offset, 1000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (!isNaN(Number(key))) {
        const screenNumber = Number(key);
        if (screenNumber >= 1 && screenNumber <= tabs.length) {
          handleScrollToIndex(screenNumber - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs]);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="fixed inset-0 w-screen h-screen max-w-none m-0 p-0 rounded-none bg-gray-50 border-0"
        style={{ 
          transform: 'none'
        }}
      >
        <DialogHeader className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b bg-white">
          <DialogTitle> </DialogTitle>
          <div className="flex gap-2">
            {tabs.map((tab, index) => (
              <Button
                key={`tab-${index}`}
                onClick={() => handleScrollToIndex(index)}
                variant="outline"
                className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-all
                  ${activeIndex === index
                    ? "bg-blue-100 text-blue-600 border-blue-500"
                    : "text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                {tab.title || `화면 ${index + 1}`}
              </Button>
            ))}
          </div>
        </DialogHeader>

        <div 
          ref={containerRef} 
          className="flex-1 overflow-y-auto px-6 py-6"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          <div className="flex flex-col gap-6">
            {tabs.map((tab, index) => (
              <div
                key={`screen-${index}`}
                ref={(el) => { screenRefs.current[index] = el; }}
                className={`border rounded-lg overflow-hidden bg-white
                  ${activeIndex === index ? "ring-2 ring-blue-400" : ""}`}
                style={{ height: 'calc(100vh - 200px)' }}
              >
                <TabPreview tab={tab} index={index} />
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4 border-t bg-white">
          <Button variant="secondary" onClick={onClose} className="w-32">
            취소
          </Button>
          <Button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="w-32"
          >
            적용
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}