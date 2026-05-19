const getOrigin = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
  return new URL(baseUrl).origin;
};

const buildAvatarSvg = (seed: string) => {
  const palette = [
    ["#7c3aed", "#ec4899"],
    ["#9333ea", "#f97316"],
    ["#6d28d9", "#db2777"],
    ["#4f46e5", "#ec4899"]
  ];
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % palette.length;
  }

  const [start, end] = palette[Math.abs(hash) % palette.length];
  const initials = seed
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CC";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs><rect width="320" height="320" rx="80" fill="url(#g)"/><text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="112" font-weight="700" fill="rgba(255,255,255,0.88)">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const resolveMediaUrl = (value?: string) => {
  if (!value) return "";
  if (/^https?:\/\//.test(value) || value.startsWith("data:image")) return value;
  return `${getOrigin()}${value}`;
};

export const getProfileImage = (value: string | undefined, seed: string) => {
  const resolved = resolveMediaUrl(value);
  return resolved || buildAvatarSvg(seed);
};

export const formatRelativeTime = (value?: string | Date) => {
  if (!value) return "Just now";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60_000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};