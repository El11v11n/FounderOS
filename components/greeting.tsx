"use client";

import { useEffect, useState } from "react";

function greetingFor(hour: number): string {
  if (hour < 5) return "Still up, Boss.";
  if (hour < 12) return "Good morning, Boss.";
  if (hour < 18) return "Good afternoon, Boss.";
  return "Good evening, Boss.";
}

/**
 * Client component: needs the device clock for local time,
 * so it renders a stable placeholder on the server first.
 */
export function Greeting() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h1 className="font-serif text-3xl italic text-foreground">
        {now ? greetingFor(now.getHours()) : "Welcome, Boss."}
      </h1>
      <p className="font-mono text-sm tracking-widest text-muted">
        {now
          ? now.toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--"}
        <span className="text-faint">
          {" "}
          ·{" "}
          {now
            ? now.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })
            : ""}
        </span>
      </p>
    </div>
  );
}
