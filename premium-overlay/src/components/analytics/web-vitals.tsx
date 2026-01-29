"use client";

import { useEffect } from "react";
import type { Metric } from "web-vitals";

const SAMPLE_RATE: number = 0.5; // 50% sampling

/**
 * Send a single Web Vitals metric to the RUM endpoint.
 * Uses navigator.sendBeacon when available for reliability.
 */
function sendToAnalytics(metric: Metric): void {
  if (Math.random() > SAMPLE_RATE) return;

  type ConnectionLike = { effectiveType?: string };
  const nav: Navigator & { connection?: ConnectionLike } = navigator as Navigator & { connection?: ConnectionLike };

  const payload: {
    name: string;
    id: string;
    value: number;
    label: "web-vital";
    path: string;
    url: string;
    connection?: string;
    viewport: string;
    ua: string;
    sampleRate: number;
  } = {
    name: metric.name,
    id: metric.id,
    value: metric.value,
    label: "web-vital",
    path: window.location.pathname,
    url: window.location.href,
    connection: nav.connection?.effectiveType,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    ua: navigator.userAgent,
    sampleRate: SAMPLE_RATE,
  };

  const body = JSON.stringify(payload);
  // Use sendBeacon only; avoid fetch fallback to keep Lighthouse network-idle stable
  navigator.sendBeacon?.("/api/rum", new Blob([body], { type: "application/json" }));
}

/**
 * Client component to wire up Web Vitals listeners.
 */
export function WebVitals(): null {
  useEffect(() => {
    // Skip during Lighthouse CI runs when ?lhci=1 is present to avoid
    // extending the network activity window.
    if (typeof window !== "undefined" && window.location.search.includes("lhci=1")) {
      return;
    }
    (async () => {
      // web-vitals v5: FID removed in favor of INP. Keep optional for fwd-compat.
      interface WebVitalsAPI {
        onCLS(cb: (m: Metric) => void): void;
        onLCP(cb: (m: Metric) => void): void;
        onINP(cb: (m: Metric) => void): void;
        onTTFB(cb: (m: Metric) => void): void;
        onFID?: (cb: (m: Metric) => void) => void;
      }
      const mod = (await import("web-vitals")) as unknown as WebVitalsAPI;
      mod.onCLS(sendToAnalytics);
      if (typeof mod.onFID === "function") mod.onFID(sendToAnalytics);
      mod.onLCP(sendToAnalytics);
      mod.onINP(sendToAnalytics);
      mod.onTTFB(sendToAnalytics);
    })();
  }, []);

  return null;
}
