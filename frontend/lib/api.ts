const API_BASE_URL = "http://localhost:8080";

export const apiFetch = async (endpoint: string, options: any = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || `HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

export const registerUser = (data: any) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });
export const loginUser = (data: any) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });
export const getStatsSummary = () => apiFetch("/analytics/summary");
export const getLogs = () => apiFetch("/logs");
export const getApiKey = (userId: number) => apiFetch(`/user/api-key?userId=${userId}`);
export const regenerateApiKey = (userId: number) => apiFetch(`/user/regenerate-key?userId=${userId}`, { method: "POST" });
export const getAllRateLimits = () => apiFetch("/rate-limit");
export const createRateLimit = (userId: number, data: any) => apiFetch(`/rate-limit?userId=${userId}`, { method: "POST", body: JSON.stringify(data) });
export const updateRateLimit = (id: number, data: any) => apiFetch(`/rate-limit/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteRateLimit = (id: number) => apiFetch(`/rate-limit/${id}`, { method: "DELETE" });
