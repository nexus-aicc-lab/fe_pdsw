"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle
} from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { TabItem } from "@/store";
import { renderTabContent } from "@/app/main/comp/renderTabContent";

interface Props {
  buttonText?: string;
  tabs: TabItem[];
}

const TabPreview = ({ tab, index }: { tab: TabItem; index: number }) => {
  const content = renderTabContent(tab.id);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="shrink-0 text-lg font-semibold p-2 border-b">
        {tab.title || `화면 ${index + 1}`}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {content}
      </div>
    </div>
  );
};

const SplitScreenDialog2 = ({ buttonText = "2탭 보기", tabs }: Props) => {
  const displayTabs = tabs.slice(0, 2);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center rounded-[3px] text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#56CAD6] text-primary-foreground  px-4 py-1 h-[30px]">
          {buttonText}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-none w-full h-screen p-0">
        <VisuallyHidden>
          <DialogTitle>Split Screen View</DialogTitle>
        </VisuallyHidden>
        <div className="w-full h-full overflow-x-auto">
          <div className="h-full p-4 bg-gray-100 inline-flex">
            <div className="flex h-full gap-4">
              {displayTabs.map((tab, index) => (
                <div
                  key={`screen-${index}`}
                  className="h-full flex-shrink-0 bg-white rounded-lg shadow-sm"
                >
                  <TabPreview tab={tab} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SplitScreenDialog2;