import { ApiResponse } from '@/types';

// API request helper
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An error occurred',
        data: data.data,
      };
    }

    return {
      success: true,
      data: data.data || data.user,
      message: data.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

// Helper for API error responses
export function errorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

// Helper for API success responses
export function successResponse<T>(data: T, status: number = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

// Pagination helper
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  return {
    page: Math.max(1, page),
    limit: Math.min(Math.max(1, limit), 100), // Max 100 per page
    offset: (Math.max(1, page) - 1) * Math.min(Math.max(1, limit), 100),
  };
}
