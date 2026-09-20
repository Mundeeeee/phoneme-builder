"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Records time-on-page for the observability dashboard. Starts a timer on
// mount/navigation, sends the duration when the visitor leaves the page
// (route change or tab close). Mounted once in the root layout.
export default function PageViewTracker() {
  const pathname = usePathname();
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();

    function sendDuration() {
      const durationMs = Date.now() - startRef.current;
      if (durationMs < 250) return; // ignore accidental instant navigations
      const payload = JSON.stringify({ page: pathname, durationMs });
      // sendBeacon survives the page actually closing; fetch is the fallback.
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/events/page-view", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/events/page-view", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
      }
    }

    window.addEventListener("beforeunload", sendDuration);
    return () => {
      sendDuration();
      window.removeEventListener("beforeunload", sendDuration);
    };
  }, [pathname]);

  return null;
}
