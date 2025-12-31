import axios from 'axios';

export class APIClient {
  private static instance: APIClient;
  private static readonly apiURL =
    import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_ROUTE;

  private constructor() {
    axios.defaults.baseURL = APIClient.apiURL;

    // Intercept outgoing requests to attach Authorization header
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Intercept responses to handle errors
    axios.interceptors.response.use(
      (response) => response, // Pass successful responses through
      async (error) => {
        // const originalRequest = error.config;

        // Handle 500 TokenExpiredError
        if (
          error.response?.status === 500 &&
          error.response?.data?.error?.name === 'TokenExpiredError'
        ) {
          this.handleTokenExpiration();
          return Promise.reject(error); // Stop retries
        }

        // Handle 401 Unauthorized errors
        // if (error.response?.status === 401 && !originalRequest._retry) {
        //   originalRequest._retry = true; // Prevent multiple retries
        //   try {
        //     const refreshToken = localStorage.getItem('refresh');
        //     if (!refreshToken) {
        //       this.handleTokenExpiration();
        //       return Promise.reject(error);
        //     }

        //     // Attempt to refresh the token
        //     const response = await axios.post(
        //       `${APIClient.apiURL}/auth/refresh-token`,
        //       {},
        //       {
        //         headers: {
        //           Authorization: `Bearer ${refreshToken}`,
        //         },
        //       }
        //     );

        //     const newAccessToken = response.data?.data?.data?.token;
        //     localStorage.setItem('accessToken', newAccessToken);

        //     // Retry the original request with the new token
        //     originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        //     return axios(originalRequest);
        //   } catch (err) {
        //     this.handleTokenExpiration();
        //     return Promise.reject(err);
        //   }
        // }

        return Promise.reject(error); // Pass other errors to the caller
      }
    );
  }

  /**
   * Handles token expiration by clearing stored tokens and navigating to login.
   */
  private handleTokenExpiration() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refresh');
    window.location.href = '/login'; // Navigate to login
  }

  /**
   * Returns the singleton instance of the APIClient
   *
   * @returns APIClient instance
   */
  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  /**
   * GET request to the API with the given Endpoint appended to the base URL
   *
   * @param url string to be appended to the base URL
   * @returns Promise<T> where T is the type of the response data
   */
  public async get<T>(url: string): Promise<T> {
    const response = await axios.get<T>(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  public async post<T, D>(url: string, data: D): Promise<T> {
    const response = await axios.post<T>(url, data);
    return response.data;
  }

  public async put<T, D>(url: string, data: D): Promise<T> {
    const response = await axios.put<T>(url, data);
    return response.data;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await axios.delete<T>(url);
    return response.data;
  }

  public async patch<T, D>(url: string, data: D): Promise<T> {
    const response = await axios.patch<T>(url, data);
    return response.data;
  }
}
