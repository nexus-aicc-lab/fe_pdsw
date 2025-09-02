// C:\nproject\fe_pdsw3\src\app\main\comp\ResizableDivider.tsx
import React, { useRef, useCallback, useEffect } from 'react';
import { useTabStore } from '@/store/tabStore';

interface ResizableDividerProps {
  rowId: string;
  className?: string;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

const ResizableDivider: React.FC<ResizableDividerProps> = ({
  rowId,
  className = '',
  onResizeStart,
  onResizeEnd
}) => {
  const { updateSectionWidths, rows, setResizing } = useTabStore();
  const startXRef = useRef<number>(0);
  const containerWidthRef = useRef<number>(0);
  const initialWidthsRef = useRef<number[]>([]);
  const isDraggingRef = useRef<boolean>(false);

  // 드래그 시작 이벤트 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // 이벤트 전파 방지 추가
    e.stopPropagation(); // 버블링 방지
    
    // 부모 컨테이너의 너비 저장
    const container = e.currentTarget.parentElement;
    if (!container) return;
    
    const row = rows.find(r => r.id === rowId);
    if (!row || row.sections.length < 2) return;
    
    // 초기 섹션 너비 저장
    initialWidthsRef.current = row.sections.map(s => s.width);
    
    containerWidthRef.current = container.getBoundingClientRect().width;
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    
    // 커서 스타일 변경 및 텍스트 선택 방지
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    // 전역 리사이징 상태 true로 설정
    setResizing(true);
    if (onResizeStart) onResizeStart();
    
    // 마우스 이벤트 리스너 등록
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // console.log("Resize started", rowId, initialWidthsRef.current);
  }, [rows, rowId, setResizing, onResizeStart]);

  // 드래그 중 이벤트 핸들러
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // 마우스 이동 거리 계산
    const deltaX = e.clientX - startXRef.current;
    
    // 변화량을 백분율로 계산
    const percentDelta = (deltaX / containerWidthRef.current) * 100;
    
    // 새로운 섹션 너비 계산 (첫 번째 섹션은 증가, 두 번째 섹션은 감소)
    let newWidth1 = initialWidthsRef.current[0] + percentDelta;
    let newWidth2 = initialWidthsRef.current[1] - percentDelta;
    
    // 최소 너비 제한 (각 섹션이 20% 미만이 되지 않도록)
    if (newWidth1 < 20) {
      newWidth1 = 20;
      newWidth2 = 80;
    } else if (newWidth2 < 20) {
      newWidth1 = 80;
      newWidth2 = 20;
    }
    
    // 섹션 너비 업데이트 (전역 상태 업데이트)
    updateSectionWidths(rowId, [newWidth1, newWidth2]);
    
    // console.log("Resizing", rowId, [newWidth1, newWidth2]);
  }, [rowId, updateSectionWidths]);

  // 드래그 종료 이벤트 핸들러
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
    
    // 이벤트 리스너 제거
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // 전역 리사이징 상태 false로 설정
    setResizing(false);
    if (onResizeEnd) onResizeEnd();
    
    // console.log("Resize ended");
  }, [setResizing, handleMouseMove, onResizeEnd]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (isDraggingRef.current) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        setResizing(false);
        if (onResizeEnd) onResizeEnd();
      }
    };
  }, [handleMouseMove, handleMouseUp, setResizing, onResizeEnd]);

  return (
    <div 
      className={`divider-handle ${className}`}
      onMouseDown={handleMouseDown}
      style={{
        width: '6px',
        backgroundColor: isDraggingRef.current ? '#55BEC8' : '#eaeaea',
        cursor: 'col-resize',
        position: 'relative',
        zIndex: 0,
        margin: '0 -3px',
        alignSelf: 'stretch',
        touchAction: 'none',
        // transition: 'background-color 0.2s'
      }}
    >
      {/* 드래그 핸들 표시 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '2px',
        height: '30px',
        backgroundColor: isDraggingRef.current ? 'white' : '#999',
        borderRadius: '1px'
      }} />
    </div>
  );
};

export default ResizableDivider;