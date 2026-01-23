const API_BASE_URL = 'http://localhost:3001';

interface ErrorResponse {
  error: string;
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const errorData = (await response.json()) as ErrorResponse;
    return errorData.error || `API error: ${response.status}`;
  } catch {
    return `API error: ${response.status}`;
  }
}

/**
 * Base fetch wrapper for API calls
 *
 * @param endpoint - API endpoint path (e.g., '/api/tasks')
 * @returns Parsed JSON response
 * @throws {Error} If response status is not OK (200-299)
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

/**
 * Base POST request wrapper
 *
 * @param endpoint - API endpoint path
 * @param data - Request body data
 * @returns Parsed JSON response
 * @throws {Error} If response status is not OK
 */
export async function apiPost<T, R>(endpoint: string, data: T): Promise<R> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    return (await response.json()) as R;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

/**
 * Base PATCH request wrapper
 *
 * @param endpoint - API endpoint path
 * @param body - Optional request body data
 * @returns Parsed JSON response
 * @throws {Error} If response status is not OK
 */
export async function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

/**
 * Base PUT request wrapper
 *
 * @param endpoint - API endpoint path
 * @param body - Optional request body data
 * @returns Parsed JSON response
 * @throws {Error} If response status is not OK
 */
export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

/**
 * Base DELETE request wrapper
 *
 * @param endpoint - API endpoint path
 * @returns void (DELETE returns 204 No Content)
 * @throws {Error} If response status is not OK
 */
export async function apiDelete(endpoint: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    // DELETE returns 204 No Content, no need to parse response
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}
