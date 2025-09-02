// src/components/NotificationSetup.tsx
"use client";

import { useEffect, useState } from "react";

// Notification 권한 요청 및 서비스 워커 등록 컴포넌트
export const NotificationSetup = () => {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const registerSWAndRequestPermission = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          // 기존 서비스 워커 등록 해제
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            // console.log("기존 SW 등록 해제됨");
          }

          // 새 서비스 워커 등록
          const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          // console.log("SW 등록 완료", registration);

          setSwRegistration(registration);

          // 서비스 워커 상태 확인
          if (registration.active) {
            // console.log("SW가 이미 활성화됨");
          } else if (registration.installing) {
            // console.log("SW 설치 중...");
            const installingWorker = registration.installing;
            installingWorker?.addEventListener("statechange", () => {
              // console.log("SW 상태 변경:", installingWorker.state);
              if (installingWorker.state === "activated") {
                // console.log("SW 활성화 완료!");
              }
            });
          } else if (registration.waiting) {
            // console.log("SW 대기 중...");
          }

          // 알림 권한 요청
          const permission = await Notification.requestPermission();
          // console.log("알림 권한 상태:", permission);

          if (permission !== "granted") {
            // console.warn("알림 권한이 필요합니다.");
          }
        } catch (err) {
          // console.error("SW 등록 실패", err);
        }
      } else {
        // console.warn("이 브라우저는 서비스 워커 또는 푸시 알림을 지원하지 않습니다.");
      }
    };

    registerSWAndRequestPermission();
  }, []);

  return null;
};

// 브라우저 알림 표시 함수
export const showPushNotification = async (
  title: string,
  body: string,
  tag: string = "campaign-event"
) => {
  // console.log("[showPushNotification] 호출됨", { title, body, tag });

  try {
    // 권한 확인 및 요청
    if (Notification.permission !== "granted") {
      // console.warn("[showPushNotification] 알림 권한이 없음");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        // console.error("[showPushNotification] 알림 권한 거부됨");
        return;
      }
    }

    // 서비스 워커 등록 확인
    const reg = await navigator.serviceWorker.getRegistration();
    // console.log("[showPushNotification] 서비스 워커 등록 정보:", reg);

    if (!reg) {
      // console.error("[showPushNotification] 등록된 서비스 워커가 없음");
      return;
    }

    // 활성화 확인
    if (!reg.active) {
      // console.warn("[showPushNotification] 서비스 워커가 활성화되지 않음, 대기 중...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const updatedReg = await navigator.serviceWorker.getRegistration();
      if (!updatedReg?.active) {
        // console.error("[showPushNotification] 서비스 워커 활성화 타임아웃");
        return;
      }
    }

    // 알림 표시
    await reg.showNotification(title, {
      body,
      icon: "/icon.png",
      tag,
      vibrate: [200, 100, 200],
      requireInteraction: true,
    } as any); // vibrate 허용을 위해 타입 단언

    // console.log("[showPushNotification] 알림 호출 성공");
  } catch (err) {
    // console.error("[showPushNotification] 에러 발생", err);
  }
};
