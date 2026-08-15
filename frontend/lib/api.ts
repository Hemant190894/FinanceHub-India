const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}
