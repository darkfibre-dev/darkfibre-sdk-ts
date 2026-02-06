import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import https from 'https';
import { APIError } from '../errors';
import { APIErrorResponse } from '../types';

/**
 * HTTP client wrapper for making API requests
 */
export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey?: string) {
    // HTTPS agent with keepalive for connection reuse.
    // timeout is the socket inactivity timeout – kept well below any
    // test-runner / caller timeout so a hung socket surfaces as an
    // APIError('TIMEOUT') instead of a mysterious "test timed out."
    const httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 30000,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only add Authorization header if apiKey is provided (for registration endpoint)
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    this.client = axios.create({
      baseURL,
      headers,
      httpsAgent,
      timeout: 30000, // 30 second default request timeout
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<APIErrorResponse>) => {
        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new APIError(
            'TIMEOUT',
            'Request timed out',
            408
          );
        }

        // Handle API error responses
        if (error.response?.data?.error) {
          const { code, message } = error.response.data.error;
          throw new APIError(code, message, error.response.status);
        }

        // Handle network errors
        if (!error.response) {
          throw new APIError(
            'NETWORK_ERROR',
            error.message || 'Network error occurred',
            0
          );
        }

        throw error;
      }
    );
  }

  /**
   * Make a POST request
   * @param url - Request URL path
   * @param data - Request body
   * @param timeout - Optional per-request timeout in ms (overrides the default)
   */
  public async post<T, D = unknown>(url: string, data: D, timeout?: number): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, timeout ? { timeout } : undefined);
  }

  /**
   * Make a GET request
   */
  public async get<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url);
  }
}
