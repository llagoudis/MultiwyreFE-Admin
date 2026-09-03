import axios from "axios";
import Router from "next/router";
import toast from "react-hot-toast";
import { encryptPayload } from "~/common/functions";
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
    message.includes("access token was expired") ||
    message.includes("session expired") ||
    message.includes("account suspended")
  );
};

const revokeAllAdminSessions = async () => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token = localStorageService.getLocalAccessToken();
  if (!baseURL || !token) return;

  // Plain axios (not ProtectedAxiosInstance) so logout flag / 401 interceptor
  // cannot cancel or recurse while we revoke server sessions.
  await axios.post(
    `${baseURL}/auth/admin/logout`,
    encryptPayload({}),
    {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      timeout: 8000,
    },
  );
};

/** Clears session and navigates to login without 401 toast spam.
 *  Also bumps server tokenVersion so other browsers/devices are logged out.
 */
export const logoutAdmin = () => {
  if (loggingOut) return;
  loggingOut = true;

  toast.dismiss();

  void revokeAllAdminSessions()
    .catch(() => {
      // Still clear local session even if revoke fails (offline / already invalid)
    })
    .finally(() => {
      useAuthStore.setState({ ...initAuth });
      clearAdminPreAuthSession();
      localStorageService.clearStorage();

      void Router.replace("/auth/login").finally(() => {
        window.setTimeout(() => {
          loggingOut = false;
        }, 2000);
      });
    });
};
