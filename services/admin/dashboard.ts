const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function getDashboard() {
  const res = await fetch(`${BASE}/dashboard`, {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Erro ${res.status}`);

  return res.json();
}
