import axios from "axios";
import LocalstorageService from "./LocalstorageService";
import toast from "react-hot-toast";
import { getUserIp } from "~/utils/getUserIp";
import Router from "next/router";
import { encryptPayload } from "~/common/functions";
const ProtectedAxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

ProtectedAxiosInstance.interceptors.request.use(
  async (config) => {
    const token = LocalstorageService.getLocalAccessToken();
    const userIp = await getUserIp();

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.data = encryptPayload(config.data);
    }

    if (token) {
      config.headers.Authorization = token;
      config.headers["x-data-ip"] = userIp;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

ProtectedAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.message === "Network Error" && !error.response) {
      // toast.error("Network error - make sure API is running");
    }

    if (error?.response.status === 401) {
      localStorage.clear();
      void Router.replace("/auth/login");
    }
    return Promise.reject(error);
  },
);

export default ProtectedAxiosInstance;
