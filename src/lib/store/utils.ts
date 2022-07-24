export function parseUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return;
  }
}

export function getUrlLevels(url: URL): string[] {
    const host = url.hostname;
    const parts = host.split(".");
    const last = parts[parts.length - 1];
    const levels: string[] = [];

    // Ip address.
    if (parts.length === 4 && parseInt(last, 10) > 0) {
      return levels;
    }

    // Localhost.
    if (parts.length <= 1) {
      return levels;
    }

    // Create levels.
    for (let i = parts.length - 2; i >= 0; --i) {
      levels.push(parts.slice(i).join("."));
    }

    return levels;
  }