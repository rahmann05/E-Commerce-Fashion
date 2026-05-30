// HTTP client untuk komunikasi antar-service
export function createServiceClient(baseUrl: string, internalKey: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': internalKey,
  };

  return {
    async get<T = any>(path: string): Promise<T> {
      const res = await fetch(`${baseUrl}${path}`, { headers });
      if (!res.ok) {
        let errorMsg = `Service call gagal: ${res.status}`;
        try {
            const data = await res.json();
            if (data && data.error) errorMsg = data.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      return res.json() as Promise<T>;
    },
    async post<T = any>(path: string, body: unknown): Promise<T> {
      const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST', headers, body: JSON.stringify(body),
      });
      if (!res.ok) {
        let errorMsg = `Service call gagal: ${res.status}`;
        try {
            const data = await res.json();
            if (data && data.error) errorMsg = data.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      return res.json() as Promise<T>;
    },
  };
}
