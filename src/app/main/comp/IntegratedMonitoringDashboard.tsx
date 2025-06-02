// C:\nproject\fe_pdsw\src\app\main\comp\IntegratedMonitoringDashboard.tsx
import React, { useState } from 'react';
import { ZoomableContent } from '@/components/shared/ui/ZoomableContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import CustomAlert from '@/components/shared/layout/CustomAlert';

const IntegratedMonitoringDashboard: React.FC = () => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleOpenAlert = () => setIsAlertOpen(true);
  const handleCloseAlert = () => setIsAlertOpen(false);

  return (
    <ZoomableContent>
      <div className="flex flex-col h-full w-full p-4 bg-gray-100">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-center">통합 모니터링 대시보드</h1>
        </header>
        <main className="flex flex-wrap gap-4">
          <section className="w-full md:w-1/2 lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>실시간 메트릭</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">CPU 사용률</h3>
                    <Badge variant="outline">75%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">메모리 사용률</h3>
                    <Badge variant="outline">60%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">디스크 사용률</h3>
                    <Badge variant="outline">80%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          <section className="w-full md:w-1/2 lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>알림</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTitle>경고: 메모리 사용률 높음</AlertTitle>
                    <AlertDescription>2023-10-01 12:00:00</AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertTitle>경고: 디스크 사용률 높음</AlertTitle>
                    <AlertDescription>2023-10-01 13:00:00</AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </section>
          <section className="w-full md:w-1/2 lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>로그</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>2023-10-01 12:00:00 - 시스템 시작</p>
                  <p>2023-10-01 12:05:00 - 사용자 로그인</p>
                </div>
              </CardContent>
            </Card>
          </section>
          <section className="w-full md:w-1/2 lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>상태 표시기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">서버 상태</h3>
                    <Badge variant="outline">정상</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">네트워크 상태</h3>
                    <Badge variant="outline">정상</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
        <button onClick={handleOpenAlert} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          알림 열기
        </button>
        <CustomAlert
          title="알림"
          message="이것은 테스트 알림입니다."
          type="1"
          isOpen={isAlertOpen}
          onClose={handleCloseAlert}
        />
      </div>
    </ZoomableContent>
  );
};

export default IntegratedMonitoringDashboard;
