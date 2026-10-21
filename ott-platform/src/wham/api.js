export const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export async function request(path, { method = 'GET', body, token, params } = {}) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')) : '';
    const res = await fetch(`${API_URL}/wham${path}${qs === '?' ? '' : qs}`, {
        method,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        const detail = data?.detail;
        throw new ApiError(res.status, typeof detail === 'string' ? detail : detail?.[0]?.msg || data?.message || `Request failed (${res.status})`);
    }
    return data;
}
