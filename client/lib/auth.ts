function normalizeToken(token: string | null): string {
  if (!token) return "";

  const trimmed = token.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return "";
  }

  return trimmed.startsWith("Bearer ") ? trimmed.slice(7).trim() : trimmed;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

export function getUserIdFromToken(token: string | null): string {
  const normalizedToken = normalizeToken(token);
  if (!normalizedToken) return "";

  const parts = normalizedToken.split(".");
  if (parts.length < 2) return "";

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (payload.exp && Date.now() >= Number(payload.exp) * 1000) {
      return "";
    }

    return String(payload.userId || payload.id || payload.sub || "");
  } catch {
    return "";
  }
}
