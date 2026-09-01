import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import TwoFactorAuthentication from "~/components/TwoFactorAuthentication";
import ErrorResponse from "~/service/ErrorResponse";
import {
  clearAdminPreAuthSession,
  completeAdmin2FASetup,
  getAdmin2FASetupQR,
} from "~/service/api/auth";
import localStorageService from "~/service/LocalstorageService";
import { useAuthStore } from "~/store";

interface FormData {
  twoFactorCode: string;
}

const Setup2FA = () => {
  const router = useRouter();
  const [twofaQR, setTwofaQR] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const preAuthToken = sessionStorage.getItem("preAuthToken");
    if (!preAuthToken) {
      void router.replace("/auth/login");
      return;
    }
    if (sessionStorage.getItem("requires2FASetup") !== "true") {
      void router.replace("/auth/verify-2fa");
      return;
    }

    const loadQr = async () => {
      try {
        const data = await getAdmin2FASetupQR();
        if (data?.success && data?.body?.qrImage) {
          setTwofaQR(data.body.qrImage);
          setReady(true);
        } else {
          toast.error("Failed to load Google Authenticator QR code");
        }
      } catch (error) {
        toast.error(ErrorResponse(error));
        clearAdminPreAuthSession();
        void router.replace("/auth/login");
      }
    };

    void loadQr();
  }, [router.isReady, router]);

  const finishLogin = (body: AuthBody) => {
    useAuthStore.setState(body);
    localStorageService.encodeAuthBody(body);
    localStorageService.setLocalAccessToken(body.token);
    clearAdminPreAuthSession();
    toast.success("Google Authenticator enabled. Welcome back!");
    void router.replace("/");
  };

  const submitData = async (value: FormData) => {
    setLoading(true);
    try {
      const data = await completeAdmin2FASetup(value.twoFactorCode);
      if (data?.success && data?.body?.token) {
        finishLogin(data.body);
      } else {
        toast.error("Failed to verify code");
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
        <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-2 text-2xl font-bold text-black">
            Set up Google Authenticator
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Scan the QR code with Google Authenticator, then enter the 6-digit
            code to finish signing in.
          </p>
          {ready && twofaQR ? (
            <TwoFactorAuthentication
              close={() => {
                clearAdminPreAuthSession();
                void router.replace("/auth/login");
              }}
              submitData={submitData}
              loading={loading}
              twofaQR={twofaQR}
            />
          ) : (
            <p className="text-sm text-gray-500">Loading QR code...</p>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default Setup2FA;
