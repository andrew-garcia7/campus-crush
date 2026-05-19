"use client";

import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SWRConfig } from "swr";

import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

function AuthBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  const syncedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      syncedTokenRef.current = null;
      return;
    }

    if (syncedTokenRef.current === token) {
      return;
    }

    syncedTokenRef.current = token;

    let cancelled = false;

    api
      .get("/auth/profile")
      .then((res) => {
        if (cancelled) return;

        const user = res.data?.data?.user;

        if (user) {
          setUser(user);
        }
      })
      .catch((err) => {
        if (cancelled) return;

        // Token is expired or invalid — clear auth so guards redirect to /login
        if (err?.response?.status === 401) {
          useAuthStore.getState().logout();
        } else {
          console.log(
            "Profile sync failed:",
            err?.response?.data || err.message
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, setUser]);

  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );

  return (
  <QueryClientProvider client={queryClient}>
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: true,
        keepPreviousData: true,
        dedupingInterval: 30000,
        focusThrottleInterval: 60000,
        shouldRetryOnError: false
      }}
    >
      <AuthBootstrap />
      {children}
    </SWRConfig>
  </QueryClientProvider>
);
}