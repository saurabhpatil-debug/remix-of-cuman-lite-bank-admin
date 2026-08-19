import { AuthService } from "../auth.service";
import { axiosInstance, axiosInstanceGPGGet } from "./axiosInstance";

const MAX_RETRY = 3;
const INITIAL_DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function redirectToLogin() {
  AuthService.redirectToLogin();
}

function exceptionHandling(error: any) {
  const status = error.response?.status;
  const url = error.config?.url;

  if (status === 0 && url === "/.auth/me") {
    window.location.href = window.location + '/.auth/login/aad/callback';
  }

  if (status === 401) {
    redirectToLogin();
    return Promise.reject(error);
  }

  if (status === 403) {
    // window.location.href = "/fw/forbidden";
    return Promise.reject(error);
  }

  if (status === 500) {
    window.location.href = "/fw/error";
    return Promise.reject(error);
  }

  if (status === 422) {
    return Promise.reject(error.response?.data);
  }

  return Promise.reject(error.response?.data || error.message || error);
}

function attachResponseInterceptor(instance: any) {
  instance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const config = error.config;

      if (!config) {
        return exceptionHandling(error);
      }

      config.__retryCount = config.__retryCount || 0;

      const isNetworkError = !error.response;
      const status = error.response?.status;
      const method = String(config.method || "get").toLowerCase();
      const isIdempotentMethod = method === "get" || method === "head" || method === "options";

      // Retry only idempotent requests to avoid replaying write operations (POST/PUT/PATCH/DELETE).
      const shouldRetry =
        isIdempotentMethod &&
        (isNetworkError || (status >= 500 && status < 600)) &&
        config.__retryCount < MAX_RETRY;

      if (shouldRetry) {
        config.__retryCount++;
        const delay =
          INITIAL_DELAY_MS * Math.pow(2, config.__retryCount - 1);

        console.warn(
          `Retrying request (attempt ${config.__retryCount}/${MAX_RETRY}) after ${delay}ms for ${config.url}`
        );

        await sleep(delay);
        return instance(config);
      }

      return exceptionHandling(error);
    }
  );
}

export const setupResponseInterceptor = () => {
  attachResponseInterceptor(axiosInstance);
  attachResponseInterceptor(axiosInstanceGPGGet);
};
