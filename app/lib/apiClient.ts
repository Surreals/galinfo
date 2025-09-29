// Centralized API client with timeout support
// This ensures all requests have a maximum timeout of 60 seconds

export interface ApiRequestOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds, defaults to 60000 (60 seconds)
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  ok: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Default timeout configuration
const DEFAULT_TIMEOUT = 60000; // 60 seconds

/**
 * Enhanced fetch function with timeout support
 * @param url - The URL to fetch
 * @param options - Fetch options including custom timeout
 * @returns Promise that resolves to the response or rejects on timeout/error
 */
export async function apiFetch<T = any>(
  url: string, 
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    // Clear timeout since request completed
    clearTimeout(timeoutId);
    
    // Parse response
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as unknown as T;
    }
    
    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        response
      );
    }
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    };
    
  } catch (error) {
    // Clear timeout in case of error
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(
          `Request timeout after ${timeout}ms`,
          408,
          'Request Timeout'
        );
      }
      
      throw new ApiError(
        error.message || 'Network error occurred',
        0,
        'Network Error'
      );
    }
    
    throw new ApiError(
      'Unknown error occurred',
      0,
      'Unknown Error'
    );
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  url: string, 
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  url: string, 
  body?: any,
  options: Omit<ApiRequestOptions, 'method'> = {}
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  url: string, 
  body?: any,
  options: Omit<ApiRequestOptions, 'method'> = {}
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  url: string, 
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T = any>(
  url: string, 
  body?: any,
  options: Omit<ApiRequestOptions, 'method'> = {}
): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Utility function to build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

/**
 * GET request with query parameters helper
 */
export async function apiGetWithParams<T = any>(
  url: string, 
  params: Record<string, any> = {},
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<ApiResponse<T>> {
  const queryString = buildQueryString(params);
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return apiGet<T>(fullUrl, options);
}

// Export default timeout for easy access
export { DEFAULT_TIMEOUT };
