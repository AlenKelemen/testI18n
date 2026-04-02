const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function fetchFeatures(filter = {}) {
  const params = new URLSearchParams(filter).toString();
  const url = `${API_BASE}/features${params ? '?' + params : ''}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`);
  return resp.json();
}