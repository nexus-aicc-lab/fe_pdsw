// src/shared/ui/Tabs/CommonTabsWithHeadless/index.tsx
"use client";

import {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@headlessui/react";
import { cn } from "@/lib/utils";

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface CommonTabsWithHeadlessProps {
  tabs: TabItem[];
}

export const CommonTabsWithHeadless = ({ tabs }: CommonTabsWithHeadlessProps) => {
  return (
    <TabGroup>
      <TabList className="flex gap-2 mb-0">
        {tabs.map((tab, idx) => (
          <Tab
            key={idx}
            className={({ selected }) =>
              cn(
                "px-4 py-2 text-sm font-medium rounded-md border transition-colors",
                selected
                  ? "bg-blue-100 text-blue-600 border-blue-500"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100"
              )
            }
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map((tab, idx) => (
          <TabPanel key={idx} className="py-2">
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};
