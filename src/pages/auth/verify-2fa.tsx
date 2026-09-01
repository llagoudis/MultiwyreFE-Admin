import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import Image, { type StaticImageData } from "next/image";
import Sheld from "~/assets/general/sheld.svg";
import MuiButton from "~/components/common/Button";
import ErrorResponse from "~/service/ErrorResponse";
import {
  clearAdminPreAuthSession,
  verifyAdmin2FALogin,
} from "~/service/api/auth";
import localStorageService from "~/service/LocalstorageService";
import { useAuthStore } from "~/store";

const Verify2FA = () => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!router.isReady) return;

    const preAuthToken = sessionStorage.getItem("preAuthToken");
    if (!preAuthToken) {
      void router.replace("/auth/login");
      return;
    }
    if (sessionStorage.getItem("requires2FASetup") === "true") {
      void router.replace("/auth/setup-2fa");
    }
  }, [router.isReady, router]);

  const setDigit = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const chars = otp.split("");
    while (chars.length < 6) chars.push("");
    chars[index] = sanitized;
    const next = chars.join("").slice(0, 6);
    setOtp(next);
    if (sanitized && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const finishLogin = (body: AuthBody) => {
    useAuthStore.setState(body);
    localStorageService.encodeAuthBody(body);
    localStorageService.setLocalAccessToken(body.token);
    clearAdminPreAuthSession();
    toast.success("Login successful");
    void router.replace("/");
  };

  const submit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyAdmin2FALogin(otp);
      if (data?.success && data?.body?.token) {
        finishLogin(data.body);
      } else {
        toast.error("Invalid code. Please try again.");
      }
    } catch (error) {
      toast.error(ErrorResponse(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Toaster />
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-2 text-2xl font-bold text-black">Verify 2FA</h1>
          <p className="mb-8 text-sm text-gray-600">
            Enter the 6-digit code from your Google Authenticator app to
            continue.
          </p>
          <div className="flex items-start gap-5">
            <Image src={Sheld as StaticImageData} alt="" width={80} height={80} />
            <div className="flex-1">
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    value={otp[i] ?? ""}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void submit();
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        inputsRef.current[i - 1]?.focus();
                      }
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-11 w-11 rounded-md border border-slate-200 text-center text-base font-semibold outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              className="text-sm font-semibold text-slate-600"
              onClick={() => {
                clearAdminPreAuthSession();
                void router.replace("/auth/login");
              }}
            >
              Back to login
            </button>
            <MuiButton
              className="btn-solid"
              title="Continue"
              loading={loading}
              onClick={() => void submit()}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Verify2FA;
