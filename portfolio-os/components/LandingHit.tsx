"use client";

import { useEffect } from "react";
import { recordLanding } from "@/lib/landing";

/** Counts the visit once, as soon as the page loads (before boot and login finish). */
export default function LandingHit() {
  useEffect(() => {
    recordLanding();
  }, []);
  return null;
}
