"use client";

/**
 * Renders a relative timestamp (e.g. "5m ago") without causing a hydration
 * mismatch. The server and client may compute a slightly different value
 * because Date.now() advances between SSR and hydration. Using
 * suppressHydrationWarning tells React to accept the client value silently.
 */

import { formatRelativeTime } from "@/lib/media";

export function RelativeTime({
  value,
  className,
  prefix,
}: {
  value?: string | Date;
  className?: string;
  prefix?: string;
}) {
  return (
    // suppressHydrationWarning is the React-recommended approach for timestamps
    // that are intentionally different between server and client renders.
    <span className={className} suppressHydrationWarning>
      {prefix ? `${prefix} ` : ""}
      {formatRelativeTime(value)}
    </span>
  );
}
