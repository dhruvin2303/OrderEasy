/**
 * @file api.ts
 * @description Core networking layer for the OrderEazy platform.
 * Provides a standardized, type-safe interface for communicating with the backend API.
 * Features include:
 * - Automatic environment detection (Local vs. Production).
 * - Global error handling and toast notification triggers.
 * - Support for cancellation signals and file uploads/downloads.
 * @author OrderEazy Team
 */

// Automatically detects if running on localhost or a local network IP (for mobile testing)
const isLocal = window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.');

/**
 * The base URL for all API requests.
 * Points to localhost for development and a hosted Render instance for production.
 */
const BASE_URL = isLocal
  ? `http://${window.location.hostname}:8000` // Use the exact IP the mobile device reached
  : 'https://ordereasy-backend-fwl1.onrender.com';

/**
 * Standardized API utility singleton.
 * Encapsulates fetch logic with global error handling and authentication support.
 */
export const api = {
  /**
   * Universal request handler for all HTTP methods.
   * Handles network errors, authentication failures, and JSON parsing.
   * 
   * @template T - The expected response data type.
   * @param {string} endpoint - The relative API path (e.g., '/orders/').
   * @param {RequestInit} [options={}] - Standard Fetch options.
   * @returns {Promise<T>} Resolves with the parsed JSON response.
   * @throws {Error} Throws descriptive errors for network or server-side failures.
   */
  request: async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    let response;
    try {
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        signal: options.signal,
        credentials: 'include', // Ensures cookies are sent for session auth
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error(`API Request Network Error to ${BASE_URL}${endpoint}:`, error);

      // Notify UI via global event
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: { message: "Network Error: Please check your connection.", type: 'error' }
      }));

      throw new Error("Network Error: Request likely succeeded, but response was blocked.");
    }

    // Handle session expiry
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: { message: "Session Expired: Please login again.", type: 'info' }
      }));
      throw new Error('Unauthorized: Please login again.');
    }

    // Handle application-level errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let msg = `Server Error ${response.status}: ${response.statusText}`;

      if (errorData.detail) {
        msg = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      }

      window.dispatchEvent(new CustomEvent('api-error', {
        detail: { message: msg, type: 'error' }
      }));

      throw new Error(msg);
    }

    return response.json();
  },

  /** Performs a GET request. */
  get: async <T,>(endpoint: string, signal?: AbortSignal) => api.request<T>(endpoint, { method: 'GET', signal }),

  /** Performs a POST request with a JSON body. */
  post: async <T,>(endpoint: string, body: any, signal?: AbortSignal) =>
    api.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), signal }),

  /** Performs a PUT request with a JSON body. */
  put: async <T,>(endpoint: string, body: any, signal?: AbortSignal) =>
    api.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), signal }),

  /** Performs a DELETE request. */
  delete: async <T,>(endpoint: string, signal?: AbortSignal) => api.request<T>(endpoint, { method: 'DELETE', signal }),

  /**
   * Uploads a file using multipart/form-data.
   * 
   * @param {string} endpoint - The upload endpoint.
   * @param {File} file - The file to be uploaded.
   * @returns {Promise<any>} The server response metadata.
   */
  upload: async (endpoint: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Downloads a file from the server and triggers a browser save dialog.
   * 
   * @param {string} endpoint - The download endpoint.
   * @param {string} filename - The name to save the file as.
   * @returns {Promise<void>}
   */
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
          msg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
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

  /**
   * Generates and downloads a revenue summary Excel report.
   * @param {number} [year] - Optional year filter.
   */
  exportRevenueSummary: async (year?: number) => {
    const query = year ? `?start_year=${year}&end_year=${year}` : '';
    await api.download(`/exports/revenue-summary${query}`, `revenue_summary_${year || 'all'}.xlsx`);
  },

  /**
   * Generates and downloads a complete orders export in Excel format.
   */
  exportOrders: async () => {
    await api.download(`/exports/orders`, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};

