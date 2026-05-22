import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

export const verify2FAOTP = (otp: string): APIFunction<unknown> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.post("/auth/verify-two-factor-otp", { otp }),
  );

export const get2FAQRCode = () =>
  ProtectedAxiosInstance.get("/auth/two-factor-authenticator");

export const submit2FAOtp = (data: FormData) =>
  ProtectedAxiosInstance.post("/auth/verify-two-factor-otp", data);
