import Router from "next/router";
import toast from "react-hot-toast";
import localStorageService from "~/service/LocalstorageService";
import { clearAdminPreAuthSession } from "~/service/api/auth";
import { useAuthStore } from "~/store";
import { initAuth } from "~/store/helper/InitStore";

let loggingOut = false;

export const isLoggingOut = () => loggingOut;

export const isUnauthorizedError = (error: unknown): boolean => {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (status === 401) return true;

  const message = String(
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
      (typeof error === "string" ? error : "") ??
      "",
  ).toLowerCase();

  return (
    message.includes("not logged in") ||
    message.includes("unauthorized") ||
    message.includes("access token was expired")
  );
};

/** Clears session and navigates to login without 401 toast spam. */
export const logoutAdmin = () => {
  if (loggingOut) return;
  loggingOut = true;

  toast.dismiss();
  useAuthStore.setState({ ...initAuth });
  clearAdminPreAuthSession();
  localStorageService.clearStorage();

  void Router.replace("/auth/login").finally(() => {
    window.setTimeout(() => {
      loggingOut = false;
    }, 2000);
  });
};
