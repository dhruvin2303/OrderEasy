// Automatically detects if running on localhost or a local network IP (for mobile testing)
const isLocal = window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.');

const BASE_URL = isLocal
  ? `http://${window.location.hostname}:8000` // Use the exact IP the mobile device reached
  : 'https://ordereasy-backend-fwl1.onrender.com';

export const api = {
  request: async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    let response;
    try {
      // Standard JSON request handler
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        signal: options.signal, // Pass signal for cancellation
        credentials: 'include', // Crucial for session-based auth (cookies)
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error; // Request cancelled intentionally
      }
      console.error(`API Request Network Error to ${BASE_URL}${endpoint}:`, error);

      // Dispatch global error event for Toast
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: { message: "Network Error: Please check your connection.", type: 'error' }
      }));

      // BYPASS: Throw a simple error that we can catch and ignore in the UI
      throw new Error("Network Error: Request likely succeeded, but response was blocked.");
    }

    if (response.status === 401) {
      // Dispatch global error event for Toast
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: { message: "Session Expired: Please login again.", type: 'info' }
      }));
      throw new Error('Unauthorized: Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let msg = `Server Error ${response.status}: ${response.statusText}`;

      if (errorData.detail) {
        msg = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      }

      // Dispatch global error event for Toast
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: { message: msg, type: 'error' }
      }));

      throw new Error(msg);
    }

    return response.json();
  },

  get: async <T,>(endpoint: string, signal?: AbortSignal) => api.request<T>(endpoint, { method: 'GET', signal }),

  post: async <T,>(endpoint: string, body: any, signal?: AbortSignal) =>
    api.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), signal }),

  put: async <T,>(endpoint: string, body: any, signal?: AbortSignal) =>
    api.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), signal }),

  delete: async <T,>(endpoint: string, signal?: AbortSignal) => api.request<T>(endpoint, { method: 'DELETE', signal }),

  // ✅ New Upload Method
  upload: async (endpoint: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // No 'Content-Type' header needed; fetch sets multipart/form-data boundary automatically
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  },

  // Special handler for file downloads
  download: async (endpoint: string, filename: string) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let msg = 'Download failed';
        if (errorData.detail) {
          msg = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
        throw new Error(msg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download Error:", error);
      throw error;
    }
  },

  exportRevenueSummary: async (year?: number) => {
    const query = year ? `?start_year=${year}&end_year=${year}` : '';
    await api.download(`/exports/revenue-summary${query}`, `revenue_summary_${year || 'all'}.xlsx`);
  },

  exportOrders: async () => {
    await api.download(`/exports/orders`, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};
