const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

export function saveAuth(token: string) {
  localStorage.setItem("token", token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function clearAuth() {
  localStorage.removeItem("token");
}
