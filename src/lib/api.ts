export interface ApiErrorShape {
  code: string;
  message: string;
  requestId: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiEnvelope<T> {
  data: T;
}

interface ApiFailure {
  error?: Partial<ApiErrorShape>;
}

const API_BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
    credentials: 'include',
    headers: options.body === undefined ? undefined : { 'content-type': 'application/json' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const failure = isApiFailure(payload) ? payload.error : undefined;
    throw new ApiError(
      failure?.message ?? 'No pudimos completar la solicitud.',
      response.status,
      failure?.code ?? 'API_ERROR',
    );
  }

  return (payload as ApiEnvelope<T>).data;
}

function isApiFailure(value: unknown): value is ApiFailure {
  return typeof value === 'object' && value !== null && 'error' in value;
}
