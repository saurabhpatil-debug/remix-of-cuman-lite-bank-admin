import { AuthService } from "../auth.service";
import { axiosInstance } from "./axiosInstance";


export const setupAuthInterceptor = () => {
  axiosInstance.interceptors.request.use(
    async (config) => {
      // Skip same endpoint as Angular
      if (config.url === "/.auth/me") {
        return config;
      }

      try {
        // Angular: from(inject(AuthService).getAuthToken())
        const response = await AuthService.getAuthToken();
    const token = response?.[0]?.id_token;

    if (config.headers) {
      config.headers["Content-Type"] = "application/json";
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    (error) => Promise.reject(error)
  );
};
