/**
 * Base API Client
 * 
 * This module provides the base API client for making requests to the backend.
 * It is 100% portable - works with Vercel API Routes now and Harken backend later.
 * 
 * To switch backends, change the VITE_API_BASE_URL environment variable:
 * - Vercel: /api (default, same-origin)
 * - Harken: https://api.harken.com/v2
 */

// API base URL - defaults to /api for Vercel same-origin requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * API Error class for handling API-specific errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API request function
 * 
 * @param endpoint - The API endpoint (e.g., '/ai/draft')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise resolving to the typed response
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle non-2xx responses
    if (!response.ok) {
      // Read the response body as text first (can only read once)
      const errorText = await response.text();
      let errorData: unknown;
      try {
        // Try to parse as JSON
        errorData = JSON.parse(errorText);
      } catch {
        // If not JSON, use the raw text
        errorData = errorText;
      }
      
      throw new ApiError(
        `API Error: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Wrap other errors
    if (error instanceof Error) {
      throw new ApiError(error.message, 0, error);
    }
    
    throw new ApiError('Unknown API error', 0, error);
  }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T, B = unknown>(endpoint: string, body: B): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Get the current API base URL (useful for debugging)
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}


