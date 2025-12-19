'use client';

import { Inter } from 'next/font/google';
import { useState, useRef } from 'react';
import Footer from '@/components/shared/layout/Footer';
import '@/app/globals.css';
import Header from '@/widgets/header';
import { useSidebarWidthStore } from '@/widgets/sidebar2/store/useSidebarWidthStore';
import { PortalProvider } from '@/features/campaignManager/components/treeMenus/provider/usePortal';
import Sidebar2 from '@/widgets/sidebar2';

const inter = Inter({ subsets: ['latin'] });

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const width = useSidebarWidthStore((state) => state.width);
  const isOpen = useSidebarWidthStore((state) => state.isOpen);

  const [footerHeight, setFooterHeight] = useState(111);
  const [isFooterOpen, setIsFooterOpen] = useState(true);

  const contentRef = useRef<HTMLDivElement>(null);

  const toggleFooter = (isOpen: boolean) => {
    setIsFooterOpen(isOpen);
  };

  const handleResize = (height: number) => {
    if (contentRef.current) {
      contentRef.current.style.height = `calc(100% - ${height}px)`;
    }
  };

  const handleResizeEnd = (height: number) => {
    setFooterHeight(height);
  };

  const getMainWidth = () => {
    return isOpen ? `calc(100% - ${width}px)` : '100%';
  };

  const handleContextMenu = (e:any) => {
    // 기본 브라우저 동작(오른쪽 클릭 메뉴)을 막습니다.
    e.preventDefault();
    // alert("마우스 오른쪽 버튼 사용이 금지되었습니다."); // 사용자에게 알림 (선택 사항)
  };

  const actualFooterHeight = isFooterOpen ? footerHeight : 32;

  return (
    <PortalProvider>
      <div className={`${inter.className} h-screen overflow-hidden`} onContextMenu={handleContextMenu}>
        <div className="flex flex-col h-full">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar2 />
            <main
              className="flex flex-col h-full relative"
              style={{ width: getMainWidth() }}
            >
              <div 
                ref={contentRef}
                className="refined-scrollbar overflow-auto flex-1"
                style={{
                  height: `calc(100% - ${actualFooterHeight}px)`,
                  padding: '20px 25px 20px 35px',
                  boxSizing: 'border-box',
                }}
              >
                <div className="h-full min-w-[800px]">
                  {children}
                </div>
              </div>
              <div
                className="flex-shrink-0"
                style={{
                  height: `${actualFooterHeight}px`,
                }}
              >
                <Footer
                  footerHeight={footerHeight}
                  onToggleDrawer={toggleFooter}
                  onResizeHeight={handleResize}
                  onResizeStart={() => {}}
                  onResizeEnd={handleResizeEnd}
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </PortalProvider>
  );
}