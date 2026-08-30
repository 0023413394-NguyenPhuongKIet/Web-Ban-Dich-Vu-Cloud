const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5286';

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const status = response.status;

    if (status === 204) {
      return { status };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('json')) {
      const json = await response.json();
      if (!response.ok) {
        return {
          error: json.detail || json.title || json.message || 'Yêu cầu không thành công',
          status,
        };
      }
      return { data: json, status };
    }

    if (!response.ok) {
      const text = await response.text();
      return { error: text || `Lỗi HTTP ${status}`, status };
    }

    return { status } as any;
  } catch (err: any) {
    return {
      error: err.message || 'Không thể kết nối đến máy chủ Backend WebApi (Port 5286)',
      status: 0,
    };
  }
}
