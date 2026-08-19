import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env["VITE_API_URL_GPG_POST"],
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosInstanceGPGGet = axios.create({
  baseURL: import.meta.env["VITE_API_URL_GPG_GET"],
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosInstanceGPGPost = axios.create({
  baseURL: import.meta.env["VITE_API_URL_GPG_POST"],
  headers: {
    "Content-Type": "application/json",
  },
});