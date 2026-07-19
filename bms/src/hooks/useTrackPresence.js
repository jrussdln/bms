import { useEffect, useRef } from "react";
import { tokenUtils } from "../utils/auth/token";
import { env } from "../config/env";
import api from "../api/axios";

const HEARTBEAT_INTERVAL = 25000; // 25s

export function useTrackPresence() {
  const intervalRef = useRef(null);

  useEffect(() => {
    const sendHeartbeat = () => {
      if (!tokenUtils.getToken()) return;
      api.post("/heartbeat").catch(() => {});
    };

    const markOffline = () => {
      const token = tokenUtils.getToken();
      if (!token) return;
      fetch(`${env.API_BASE_URL}/mark-offline`, {
        method: "POST",
        keepalive: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    };

    const start = () => {
      sendHeartbeat();
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    };
    const stop = () => clearInterval(intervalRef.current);

    const handleVisibility = () => {
      document.visibilityState === "visible" ? start() : stop();
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", markOffline);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", markOffline);
    };
  }, []);
}