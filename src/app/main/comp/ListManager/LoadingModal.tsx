import React from 'react';
import CustomAlert from '@/components/shared/layout/CustomAlert';

interface LoadingModalProps {
  isLoading: boolean;
  totalCount: number;
  completedCount: number;
  outboundProgress: number;
  onClose: () => void;
}

const LoadingModal: React.FC<LoadingModalProps> = ({  isLoading, totalCount = 0, completedCount = 0, outboundProgress, onClose }) => {
  const totalProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const outboundProgressValue = isFinite(outboundProgress) ? outboundProgress : 0;

  return (
    <CustomAlert
      title="데이터전송"
      isOpen={isLoading}
      message={<div className="flex flex-col h-full gap-5">
        <div>고객 데이터 파일을 서버로 전송 중입니다. 잠시만 기다려 주세요.</div>
        <div className="border rounded w-full px-[40px] py-[20px]">
          <div>
            <div className="text-gray-700">
              발신비율(%)
            </div>
            <div className="mt-3 w-full h-[20px] bg-gray-200 rounded-full relative">
              <div
                className="h-full bg-primary-500 rounded-full transition-all bg-[#4EE781]"
                style={{ width: `${outboundProgressValue}%` }}
              ></div>
              <div className="absolute top-[1px] left-[50%] transform -translate-x-1/2">{outboundProgressValue.toFixed(2)}%</div>
            </div>
          </div>
          <div>
            <div className="mt-4 text-gray-700">
              전체 전송현황 ({completedCount}/{totalCount})
            </div>
            <div className="mt-3 w-full h-[20px] bg-gray-200 rounded-full relative">
              <div
                className="h-full bg-primary-500 rounded-full transition-all bg-[#4EE781]"
                style={{ width: `${totalProgress}%` }}
              ></div>
              <div className="absolute top-[1px] left-[50%] transform -translate-x-1/2">{totalProgress.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </div>}
      width="max-w-modal"
      onClose={onClose}
      showButtons={false} type={''}    />
  );
};

export default LoadingModal;