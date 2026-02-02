// src/config/runtimeConfig.ts
export type RuntimeConfig = {
  apiBaseUrl: string;
  menuImagesPath: string;
};

let config: RuntimeConfig | null = null;

/**
 * config.json を fetch して読み込む
 */
export async function loadConfig(): Promise<void> {
  const res = await fetch("/config.json");
  if (!res.ok) throw new Error("Failed to load config.json");
  config = await res.json();
}

/**
 * 読み込んだ config を返す
 */
export function getConfig(): RuntimeConfig {
  if (!config) throw new Error("Runtime config not loaded yet");
  return config;
}