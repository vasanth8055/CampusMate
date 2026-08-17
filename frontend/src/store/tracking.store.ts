import { create } from "zustand";
import { Client } from "@stomp/stompjs";
import type { RideLocationResponse } from "@/features/tracking/types/tracking.types";
import { getLatestLocation } from "@/features/tracking/api/tracking.api";

interface TrackingState {
  currentTripId: string | null;
  latestLocation: RideLocationResponse | null;
  isConnected: boolean;
  isPolling: boolean;
  stompClient: Client | null;
  pollIntervalId: any;
  startTracking: (tripId: string) => void;
  stopTracking: () => void;
  setLatestLocation: (loc: RideLocationResponse) => void;
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  currentTripId: null,
  latestLocation: null,
  isConnected: false,
  isPolling: false,
  stompClient: null,
  pollIntervalId: null,

  setLatestLocation: (loc) => set({ latestLocation: loc }),

  startTracking: (tripId: string) => {
    const prev = get();
    if (prev.currentTripId === tripId && (prev.isConnected || prev.isPolling)) {
      return;
    }

    prev.stopTracking();

    set({ currentTripId: tripId });

    // Initial fetch
    getLatestLocation(tripId)
      .then((res) => {
        if (res.data) {
          set({ latestLocation: res.data });
        }
      })
      .catch(() => {});

    // Try WebSocket connection via STOMP
    try {
      const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "localhost";
      const brokerURL = `${wsProtocol}//${wsHost}:8080/ws`;

      const client = new Client({
        brokerURL,
        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        debug: (str) => {
          if (import.meta.env.DEV) {
            console.debug("[STOMP]", str);
          }
        },
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        set({ isConnected: true });
        client.subscribe(`/topic/trips/${tripId}`, (message) => {
          try {
            const loc: RideLocationResponse = JSON.parse(message.body);
            set({ latestLocation: loc });
          } catch (e) {
            console.error("Error parsing location message:", e);
          }
        });
      };

      client.onStompError = (frame) => {
        console.warn("STOMP error, falling back to polling:", frame.headers["message"]);
        set({ isConnected: false });
      };

      client.onWebSocketClose = () => {
        set({ isConnected: false });
      };

      client.activate();
      set({ stompClient: client });
    } catch (err) {
      console.warn("WebSocket setup failed, using polling:", err);
    }

    // Polling fallback every 4 seconds
    const interval = setInterval(async () => {
      try {
        const res = await getLatestLocation(tripId);
        if (res.data) {
          set({ latestLocation: res.data, isPolling: true });
        }
      } catch {
        // quiet error during tracking polling
      }
    }, 4000);

    set({ pollIntervalId: interval });
  },

  stopTracking: () => {
    const { stompClient, pollIntervalId } = get();

    if (stompClient) {
      try {
        stompClient.deactivate();
      } catch {}
    }

    if (pollIntervalId) {
      clearInterval(pollIntervalId);
    }

    set({
      currentTripId: null,
      latestLocation: null,
      isConnected: false,
      isPolling: false,
      stompClient: null,
      pollIntervalId: null,
    });
  },
}));
