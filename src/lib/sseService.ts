// lib/sseService.ts
import { isEqual } from 'lodash'; // Assuming you use lodash for deep comparison

interface SseData {
  announce: string;
  command: string;
  data: any;
  kind: string;
  campaign_id: string;
  skill_id?: string;
  // Include other potential fields from tempEventData if needed
  [key: string]: any; // Allow for additional fields
}

let eventSourceInstance: EventSource | null = null;
let currentTenantId: string | null = null;
let currentUserId: string | null = null;
let currentApiUrl: string | null = null;

// Store the last received message details to prevent redundant updates
let lastAnnounce = "";
let lastData: any = {};
let lastKind = "";
let lastCampaignId = "";

// Use a Set to store listener functions (React state setters, etc.)
const listeners = new Set<(data: SseData) => void>();

export const sseService = {
  connect: (tenant_id: string, id: string, apiUrl: string) => {
    // Ensure running only in the browser
    if (typeof window === 'undefined' || !window.EventSource) {
      // console.warn("SSE Service: Not running in a browser environment or EventSource not supported.");
      return;
    }

    if (!tenant_id || !id || !apiUrl) {
      // console.warn("SSE Service: Missing tenant_id, id, or apiUrl.");
      return;
    }

    // If already connected with the same parameters, do nothing
    if (
      eventSourceInstance &&
      currentTenantId === tenant_id &&
      currentUserId === id &&
      currentApiUrl === apiUrl &&
      eventSourceInstance.readyState !== EventSource.CLOSED // Check if not closed
    ) {
      // console.log("SSE Service: Already connected with the same parameters.");
      return;
    }

    // If parameters changed or connection doesn't exist/is closed, close the old one first
    sseService.disconnect();
    // console.log("SSE Service: Attempting to connect...");

    currentTenantId = tenant_id;
    currentUserId = id;
    currentApiUrl = apiUrl;

    const url = `${apiUrl}/notification/${tenant_id}/subscribe/${id}`;
    // console.info("SSE Service: Connecting to URL:", url);

    try {
      eventSourceInstance = new EventSource(url);

      eventSourceInstance.onopen = () => {
        // console.log("SSE Service: Connection opened.");
        // Reset last message cache on new connection
        lastAnnounce = "";
        lastData = {};
        lastKind = "";
        lastCampaignId = "";
      };

      eventSourceInstance.onerror = (error) => {
        // console.error("SSE Service: EventSource failed:", error);
        // Optionally implement reconnection logic here
        sseService.disconnect(); // Close on error
        // Maybe notify listeners about the error/disconnection
        // listeners.forEach(listener => listener({ error: 'Connection failed' })); // Example error notification
      };

      eventSourceInstance.addEventListener('message', (event) => {
        // console.log("SSE Service: Raw message received:", event.data);

        if (event.data === "Connected!!") {
          // console.log("SSE Service: Handshake message received.");
          return; // Ignore the initial connection message
        }

        try {
          const tempEventData = JSON.parse(event.data) as SseData; // Type assertion

          // Deep comparison to avoid unnecessary updates
          if (
            lastAnnounce !== tempEventData.announce ||
            !isEqual(lastData, tempEventData.data) ||
            lastKind !== tempEventData.kind ||
            lastCampaignId !== tempEventData.campaign_id
          ) {
            // console.log("SSE Service: New data detected, updating listeners.");
            // Update cache
            lastAnnounce = tempEventData.announce;
            lastData = tempEventData.data;
            lastKind = tempEventData.kind;
            lastCampaignId = tempEventData.campaign_id;

            // Notify all subscribed listeners
            listeners.forEach(listener => listener(tempEventData));
          } else {
            // console.log("SSE Service: Data is the same as last message, skipping update.");
          }
        } catch (e) {
          // console.error("SSE Service: Failed to parse message data:", e, event.data);
        }
      });

    } catch (error) {
      // console.error("SSE Service: Failed to create EventSource:", error);
      sseService.disconnect(); // Clean up if constructor fails
    }
  },

  disconnect: () => {
    if (eventSourceInstance) {
      // console.log("SSE Service: Disconnecting...");
      eventSourceInstance.close();
    }
    eventSourceInstance = null;
    currentTenantId = null;
    currentUserId = null;
    currentApiUrl = null;
    // Don't clear listeners here, they might be needed if reconnecting
    // listeners.clear(); // Optional: clear if you don't want auto-resubscribe on reconnect
    // console.log("SSE Service: Disconnected.");
  },

  // Function for components to subscribe to updates
  subscribe: (listener: (data: SseData) => void): (() => void) => {
    listeners.add(listener);
    // console.log("SSE Service: Listener added. Total listeners:", listeners.size);
    // Return an unsubscribe function
    return () => {
      listeners.delete(listener);
      // console.log("SSE Service: Listener removed. Total listeners:", listeners.size);
    };
  },

  // Optional: Get current connection state
  isConnected: () => {
    return eventSourceInstance?.readyState === EventSource.OPEN;
  }
};

// Ensure disconnection on browser tab close (optional but good practice)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sseService.disconnect();
  });
}