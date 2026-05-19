"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { api } from "@/services/api";

type ApiKey = string | [string, Record<string, unknown>?] | null;

async function fetcher<T>(key: Exclude<ApiKey, null>) {
  if (typeof key === "string") {
    const response = await api.get(key);
    return response.data?.data as T;
  }

  const [url, params] = key;
  const response = await api.get(url, { params });
  return response.data?.data as T;
}

export function useApiSWR<T>(key: ApiKey, config?: SWRConfiguration<T>) {
  return useSWR<T>(key, fetcher, config);
}