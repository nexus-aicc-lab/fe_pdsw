// C:\nproject\fe_pdsw\public\sw.js
self.addEventListener("install", (event) => {
    console.log("[Service Worker] 설치됨");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("[Service Worker] 활성화됨");
    event.waitUntil(clients.claim());
  });
  
  // 알림 닫힘 이벤트 처리
  self.addEventListener("notificationclose", (event) => {
    console.log("[Service Worker] 알림이 닫힘:", event.notification.tag);
  });
  
  // 알림 클릭 이벤트 처리
  self.addEventListener("notificationclick", (event) => {
    const notification = event.notification;
    const action = event.action;
    const data = notification.data || {};
    
    console.log("[Service Worker] 알림이 클릭됨:", notification.tag, "액션:", action);
    
    // 알림 닫기
    notification.close();
    
    // 액션 기반 처리
    if (action === "view") {
      // 태스크 상세 페이지로 이동 (taskId가 있는 경우)
      const taskUrl = data.taskId ? `/tasks/${data.taskId}` : '/tasks';
      
      // 클라이언트 창 포커스
      event.waitUntil(
        clients.matchAll({type: 'window'}).then(clientList => {
          // 열린 창이 있으면 포커스
          for (const client of clientList) {
            if ("focus" in client) {
              return client.focus().then(focusedClient => {
                if (taskUrl && focusedClient.url !== taskUrl) {
                  return focusedClient.navigate(taskUrl);
                }
                return focusedClient;
              });
            }
          }
          // 열린 창이 없으면 새 창 열기
          return clients.openWindow(taskUrl);
        })
      );
    } else if (action === "dismiss") {
      // 나중에 다시 알림 (15분 후)
      console.log("[Service Worker] 알림 나중에 다시 표시:", notification.title);
      
      // 자체 타이머는 서비스 워커 생명주기에 의존적이므로 대신 postMessage 사용
      self.registration.active.postMessage({
        type: "REMIND_LATER",
        notification: {
          title: notification.title,
          body: notification.body,
          data: data,
          tag: `${notification.tag}-remind`
        }
      });
    } else {
      // 기본 클릭 동작 (액션 버튼을 클릭하지 않은 경우)
      event.waitUntil(
        clients.matchAll({type: 'window'}).then(clientList => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          return clients.openWindow('/');
        })
      );
    }
  });
  
  self.addEventListener("push", function (event) {
    let data = {};
    try {
      data = event.data ? event.data.json() : {};
    } catch (e) {
      console.error("[Service Worker] Push 데이터 파싱 실패:", e);
      data = {};
    }
  
    console.log("[Service Worker] Push Event Received:", data);
    
    if (!data.timestamp) {
      data.timestamp = Date.now();
    }
    
    const tag = data.tag ? `${data.tag}-${data.timestamp}` : `notification-${Date.now()}`;
    
    // 우선순위에 따른 아이콘 결정
    let iconPath = "/task-icon.png";
    if (data.priority === "high") {
      iconPath = "/task-icon-high.png";
    } else if (data.priority === "low") {
      iconPath = "/task-icon-low.png";
    }
  
    // 액션 설정
    const actions = [
      { action: "view", title: "확인" },
      { action: "dismiss", title: "나중에" }
    ];
    
    event.waitUntil(
      self.registration.showNotification(data.title || "업무 알림", {
        body: data.body || "새로운 업무가 할당되었습니다.",
        icon: iconPath,
        badge: "/badge-icon.png",
        tag: tag,
        actions: actions,
        requireInteraction: false,
        silent: data.silent || false,
        timestamp: data.timestamp,
        data: {
          ...data,
          timestamp: data.timestamp || Date.now()
        }
      })
    );
  });
  
  // 메시지 수신 처리 (나중에 알림 다시 표시용)
  self.addEventListener("message", (event) => {
    console.log("[Service Worker] 메시지 수신:", event.data);
    
    if (event.data && event.data.type === "REMIND_LATER") {
      const notificationData = event.data.notification;
      
      // 클라이언트에게 나중에 알림을 표시하라고 메시지 보내기
      clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: "SCHEDULE_NOTIFICATION",
            notification: notificationData,
            delay: 15 * 60 * 1000 // 15분
          });
        });
      });
    }
  });