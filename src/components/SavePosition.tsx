"use client";

import { useEffect } from "react";
import { setLastLesson } from "@/lib/progress";

/** Remembers this lesson as "where you left off" (saved in this browser). */
export default function SavePosition({ slug }: { slug: string }) {
  useEffect(() => {
    setLastLesson(slug);
  }, [slug]);
  return null;
}
