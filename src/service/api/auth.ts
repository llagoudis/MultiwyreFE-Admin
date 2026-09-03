import axios from "axios";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";
import { decryptResponse, encryptPayload } from "~/common/functions";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getPreAuthHeaders = () => {
  if (typeof window === "undefined") {
    throw new Error("Login session expired. Please sign in again.");
  }
  const preAuthToken = sessionStorage.getItem("preAuthToken");
  if (!preAuthToken) {
    throw new Error("Login session expired. Please sign in again.");
  }
  return {
    Authorization: `Bearer ${preAuthToken}`,
    "Content-Type": "application/json",
  };
};

export const verify2FAOTP = (otp: string): APIFunction<unknown> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.post("/auth/verify-two-factor-otp", { otp }),
  );

export const get2FAQRCode = () =>
  ProtectedAxiosInstance.get("/auth/two-factor-authenticator");

export const submit2FAOtp = (data: FormData) =>
  ProtectedAxiosInstance.post("/auth/verify-two-factor-otp", data);

export const getAdmin2FASetupQR = async () => {
  const response = await axios.get(`${baseURL}/auth/admin/2fa/setup`, {
    headers: getPreAuthHeaders(),
  });
  return decryptResponse(response.data);
};

export const completeAdmin2FASetup = async (otp: string) => {
  const response = await axios.post(
    `${baseURL}/auth/admin/2fa/complete-setup`,
    encryptPayload({ otp }),
    { headers: getPreAuthHeaders() },
  );
  return decryptResponse(response.data);
};

export const verifyAdmin2FALogin = async (otp: string) => {
  const response = await axios.post(
    `${baseURL}/auth/admin/2fa/verify-login`,
    encryptPayload({ otp }),
    { headers: getPreAuthHeaders() },
  );
  return decryptResponse(response.data);
};

export const clearAdminPreAuthSession = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("preAuthToken");
  sessionStorage.removeItem("requires2FASetup");
};

export const saveAdminPreAuthSession = (
  preAuthToken: string,
  requires2FASetup: boolean,
) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("preAuthToken", preAuthToken);
  sessionStorage.setItem("requires2FASetup", String(requires2FASetup));
};

export const forgotAdminPassword = (email: string) =>
  ApiHandler(() =>
    axios.post(
      `${baseURL}/forgotPassword/admin/forgot-password`,
      encryptPayload({ email }),
      { headers: { "Content-Type": "application/json" } },
    ),
  );

export const resetAdminPassword = (data: {
  id: string | number;
  token: string;
  newPassword: string;
  confirmPassword: string;
}) =>
  ApiHandler(() =>
    axios.post(
      `${baseURL}/forgotPassword/admin/reset-password`,
      encryptPayload(data),
      { headers: { "Content-Type": "application/json" } },
    ),
  );
