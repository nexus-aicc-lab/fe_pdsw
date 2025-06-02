/**  /src/hooks/useSharedEventSource.ts  **/
'use client';

import { useEffect, useRef } from 'react';

export default function useSharedEventSource(
  url: string,
  onSSE: (data: string) => void,
  onStatus?: (connected: boolean) => void,
) {
  const workerRef = useRef<SharedWorker | null>(null);

  useEffect(() => {
    const workerUrl = new URL('/workers/sseSharedWorker.js', window.location.origin);
    workerRef.current = new SharedWorker(workerUrl);

    const { port } = workerRef.current;
    port.postMessage({ type: 'init', payload: { url } });

    port.onmessage = ({ data }) => {
      switch (data.type) {
        case 'sse':
          onSSE(data.payload);
          break;
        case 'status':
          onStatus?.(data.payload.connected);
          break;
        default:
          break;
      }
    };

    return () => port.close();
  }, [url, onSSE, onStatus]);
}
