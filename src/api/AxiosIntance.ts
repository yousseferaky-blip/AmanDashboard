import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "https://amanapi.runasp.net/api";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // headers: {
  //   "Content-Type": "application/json",
  //   Accept: "application/json",
  // },
  timeout: 30000,
});


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (token) {
        if ((config.headers as any)?.set) {
          (config.headers as any).set("Authorization", `Bearer ${token}`);
        } else {
          (config.headers as any) = {
            ...(config.headers as any),
            Authorization: `Bearer ${token}`,
          };
        }
      }

      // const countryCode = localStorage.getItem("countryCode") || "+20";

      // config.params = {
      //   ...config.params,
      //   countryCode,
      // };
    } catch {
      // ignore
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Optional: clear token or redirect to login
      // localStorage.removeItem('accessToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
