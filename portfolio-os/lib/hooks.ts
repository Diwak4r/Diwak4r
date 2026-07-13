"use client";

import { useEffect, useState } from "react";

/**
 * true below 768px, false at md and up, null before first client render
 * (so the server and first client paint agree).
 */
export function useIsMobile(): boolean | null {
  const [mobile, setMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}
