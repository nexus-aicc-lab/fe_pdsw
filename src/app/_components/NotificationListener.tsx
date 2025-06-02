"use client";

import { useEffect } from "react";

export const NotificationListener = () => {
  useEffect(() => {
    // 서비스 워커 메시지 리스너 등록
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      console.log("[NotificationListener] 서비스 워커 메시지 수신:", event.data);
      
      if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
        const { notification, delay } = event.data;
        
        // 지연 후 알림 다시 표시
        setTimeout(() => {
          console.log("[NotificationListener] 지연된 알림 표시:", notification);
          
          // 서비스 워커 등록 정보 가져오기
          navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
              // ExtendedNotificationOptions 인터페이스를 정의한 경우 as any 생략 가능
              reg.showNotification(notification.title, {
                body: notification.body,
                tag: notification.tag,
                icon: "/task-icon.png",
                badge: "/badge-icon.png",
                data: notification.data,
                requireInteraction: false
              } as any); // TypeScript 오류 방지를 위한 타입 단언
            }
          });
        }, delay);
      }
    };

    // 메시지 리스너 등록
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    
    // 클린업 함수
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, []);

  return null;
};