    // store/sseStore.ts
import { create } from 'zustand';
import { sseService } from '@/lib/sseService'; // Adjust path as needed

interface SseData {
    announce: string;
    command: string;
    data: any;
    kind: string;
    campaign_id: string;
    skill_id?: string;
    [key: string]: any;
}

interface SseState {
  latestMessage: SseData | null;
  isConnected: boolean;
  tenantId: string | null;
  userId: string | null;
  apiUrl: string | null;
  connect: (tenant_id: string, id: string, apiUrl: string) => void;
  disconnect: () => void;
  _setLatestMessage: (message: SseData) => void; // Internal helper
  _setConnectionStatus: (status: boolean) => void; // Internal helper
}

// Store the unsubscribe function returned by sseService.subscribe
let unsubscribeFromService: (() => void) | null = null;

export const useSseStore = create<SseState>((set, get) => ({
  latestMessage: null,
  isConnected: false,
  tenantId: null,
  userId: null,
  apiUrl: null,

  connect: (tenant_id: string, id: string, apiUrl: string) => {
    if (!tenant_id || !id || !apiUrl) return;

    // Store connection parameters
    set({ tenantId: tenant_id, userId: id, apiUrl: apiUrl });

    // Ensure previous subscription is cleaned up before starting a new one
    if (unsubscribeFromService) {
        unsubscribeFromService();
        unsubscribeFromService = null;
    }

    // Connect the singleton service
    sseService.connect(tenant_id, id, apiUrl);

    // Subscribe the store to updates from the service
    unsubscribeFromService = sseService.subscribe((data) => {
        // console.log("Zustand Store: Received data from SSE service", data);
        get()._setLatestMessage(data); // Use internal action via get()
    });

    // Update connection status (might need slight delay or check after connect)
    // A more robust way is to have the service emit status events
    set({ isConnected: sseService.isConnected() });
    // Consider adding an interval or listening to service's open/error events for status
     const intervalId = setInterval(() => {
       const currentStatus = sseService.isConnected();
       if (currentStatus !== get().isConnected) {
         get()._setConnectionStatus(currentStatus);
       }
     }, 1000); // Check status periodically

     // Store interval ID to clear later - This is simplistic, event-based is better
     // but requires modifying sseService to emit status events.

     // Cleanup function for connect (called when disconnect is needed)
     const cleanupConnection = () => {
        clearInterval(intervalId);
        if (unsubscribeFromService) {
            unsubscribeFromService();
            unsubscribeFromService = null;
        }
        sseService.disconnect();
        set({ isConnected: false, latestMessage: null, tenantId: null, userId: null, apiUrl: null });
     };

     // Attach cleanup function to be called by disconnect action
     // This is a bit indirect; managing the cleanup directly in disconnect might be cleaner.
     set({ disconnect: cleanupConnection });


  },

  // Initial disconnect action - will be overwritten by the one created in connect
  disconnect: () => {
    // console.log("Zustand Store: Initial disconnect called (should be replaced by connect's cleanup).");
    if (unsubscribeFromService) {
        unsubscribeFromService();
        unsubscribeFromService = null;
    }
    sseService.disconnect();
    set({ isConnected: false, latestMessage: null, tenantId: null, userId: null, apiUrl: null });
  },

  // Internal action to update message state
  _setLatestMessage: (message: SseData) => {
    set({ latestMessage: message });
  },

   // Internal action to update connection status
  _setConnectionStatus: (status: boolean) => {
     set({ isConnected: status });
     if (!status) {
         // Optionally clear message when disconnected
        //  set({ latestMessage: null });
     }
   }
}));