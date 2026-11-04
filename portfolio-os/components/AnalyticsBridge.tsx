"use client";

import { useEffect } from "react";
import { useWindows } from "@/lib/store";
import { track } from "@/lib/consent";

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** Reports each newly opened window as an analytics event. It sends nothing
 *  unless the visitor accepted analytics (see lib/consent.ts). */
export default function AnalyticsBridge() {
  useEffect(() => {
    const seen = new Set(Object.keys(useWindows.getState().wins));
    return useWindows.subscribe((state) => {
      for (const win of Object.values(state.wins)) {
        if (seen.has(win.winId)) continue;
        seen.add(win.winId);
        if (win.kind === "app") track("app_open", { app: win.appId });
        else if (win.url) track("link_click", { link_url: win.url, link_domain: hostOf(win.url), link_text: win.title });
      }
    });
  }, []);

  return null;
}
