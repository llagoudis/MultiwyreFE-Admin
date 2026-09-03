import React, { Fragment, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import toast, { Toaster } from "react-hot-toast";
import { login } from "~/service/ApiRequests";
import ErrorResponse from "~/service/ErrorResponse";
import localStorageService from "~/service/LocalstorageService";
import InputComponent from "../common/InputComponent";
import { decryptResponse } from "~/common/functions";
import { saveAdminPreAuthSession } from "~/service/api/auth";
import { useAuthStore } from "~/store";

interface FormData {
  email: string;
  firstname?: string;
  lastname?: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();

  const { handleSubmit, control, watch, resetField } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showEmailField, setShowEmailField] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submitData = async (data: FormData) => {
    const { email, password } = data;

    setIsLoading(true);
    try {
      const res_en: {
        data: {
          body: AuthBody & {
            preAuthToken?: string;
            requires2FASetup?: boolean;
          };
          success?: boolean;
          message?: string;
        };
      } = await login({
        email: email,
        password,
        type: "admin",
      });

      const res = decryptResponse(res_en.data);

      if (res?.success && res.body?.preAuthToken) {
        saveAdminPreAuthSession(
          res.body.preAuthToken,
          Boolean(res.body.requires2FASetup),
        );
        toast.success(res.message ?? "Continue with Google Authenticator");
        if (res.body.requires2FASetup) {
          void router.push("/auth/setup-2fa");
        } else {
          void router.push("/auth/verify-2fa");
        }
        return;
      }

      if (res?.success && res.body?.token) {
        useAuthStore.setState(res?.body);
        localStorageService.encodeAuthBody(res?.body);
        localStorageService.setLocalAccessToken(res?.body?.token);
        toast.success("Login successful");
        void router.push("/");
      }
    } catch (error) {
      const message = ErrorResponse(error);
      resetField("password");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: FormData) => {
    data.password && !showEmailField
      ? void submitData(data)
      : setShowEmailField(false);
  };

  const email = watch("email");

  return (
    <Fragment>
      <Toaster />
      <div className="flex h-screen items-center justify-center">
        <div className="w-[40%] rounded bg-white p-8 shadow-md">
          <h1 className="mb-1 text-3xl font-bold">Welcome back</h1>
          <p className="mb-20 font-semibold text-gray-600">
            Login to access your account
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            {showEmailField ? (
              <div className="w-full">
                <InputComponent
                  control={control}
                  name={"email"}
                  label={"Email"}
                  watch={watch}
                  type={"text"}
                  rules={{
                    required: "Email is required",
                    validate: (value: string) =>
                      value.trim() !== "" || "This field cannot be blank",
                  }}
                />
              </div>
            ) : (
              <Fragment>
                <div className="mb-4">
                  <div className="mb-2 block text-sm">Email</div>
                  <div className="text-lg font-bold">{email}</div>
                </div>
                <div className="mb-4 mt-10">
                  <InputComponent
                    control={control}
                    name={"password"}
                    label={"Password"}
                    watch={watch}
                    type={"password"}
                  />
                </div>
                <div className="mb-2">
                  <button
                    type="button"
                    className="text-sm font-semibold text-blue-600 hover:underline"
                    onClick={() =>
                      void router.push({
                        pathname: "/auth/forgotPassword",
                        query: email ? { email } : undefined,
                      })
                    }
                  >
                    Forgot password?
                  </button>
                </div>
              </Fragment>
            )}
            <div className="mt-20 flex">
              <button
                className="text-sm"
                type="button"
                onClick={() => setShowEmailField(true)}
              >
                Cancel
              </button>
              <Button
                className="ml-auto rounded-md bg-blue-500 px-8 py-2 text-sm text-slate-100 transition delay-75 ease-in-out hover:bg-blue-900"
                title="Next"
                loading={isLoading}
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginForm;
