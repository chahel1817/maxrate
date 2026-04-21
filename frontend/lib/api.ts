const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiFetch = async (endpoint: string, options: any = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = null;
    }

    if (!response.ok) {
        if (data && (data.error || data.messages)) {
            throw data;
        }
        throw {
            error: text || `HTTP error! Status: ${response.status}`,
            messages: [text || "An unexpected error occurred"]
        };
    }

    return data || {};
};

export const registerUser = (data: any) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
export const loginUser = (data: any) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
export const checkEmail = (email: string) => apiFetch(`/auth/check-email?email=${encodeURIComponent(email)}`);
export const getStatsSummary = () => apiFetch("/analytics/summary");
export const getLogs = () => apiFetch("/logs");
export const getApiKey = (userId: number) => apiFetch(`/user/api-key?userId=${userId}`);
export const regenerateApiKey = (userId: number) => apiFetch(`/user/regenerate-key?userId=${userId}`, { method: "POST" });
export const getAllRateLimits = () => apiFetch("/rate-limit");
export const createRateLimit = (userId: number, data: any) => apiFetch(`/rate-limit?userId=${userId}`, { method: "POST", body: JSON.stringify(data) });
export const updateRateLimit = (id: number, data: any) => apiFetch(`/rate-limit/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteRateLimit = (id: number) => apiFetch(`/rate-limit/${id}`, { method: "DELETE" });
