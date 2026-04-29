import { VersionMeta } from './types';

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 2000;

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchVersion(
  url: string,
  retryAttempts = DEFAULT_RETRY_ATTEMPTS,
  retryDelay = DEFAULT_RETRY_DELAY_MS,
): Promise<VersionMeta | null> {
  const bustUrl = `${url}?t=${Date.now()}`;

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      const res = await fetch(bustUrl, {
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as VersionMeta;
    } catch {
      if (attempt < retryAttempts) await delay(retryDelay);
    }
  }

  return null;
}

export function versionsAreDifferent(a: string | null, b: string | null): boolean {
  return !!a && !!b && a !== b;
}
