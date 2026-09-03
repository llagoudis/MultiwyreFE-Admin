import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Button from "~/components/common/Button";
import InputComponent from "~/components/common/InputComponent";
import { resetAdminPassword } from "~/service/api/auth";

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const { handleSubmit, control, watch } = useForm<FormData>({
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [linkError, setLinkError] = useState("");

  const id = typeof router.query.id === "string" ? router.query.id : "";
  const token = typeof router.query.token === "string" ? router.query.token : "";

  useEffect(() => {
    if (!router.isReady) return;
    if (!id || !token) {
      setLinkError("Invalid or missing reset link.");
    }
  }, [router.isReady, id, token]);

  const newPassword = watch("newPassword");

  const onSubmit = async (values: FormData) => {
    if (!id || !token) {
      toast.error("Invalid or missing reset link.");
      return;
    }

    setLoading(true);
    const [data, error] = await resetAdminPassword({
      id,
      token,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });
    setLoading(false);

    if (error) return;

    toast.success(data?.message ?? "Password updated successfully");
    setDone(true);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Toaster />
      <div className="w-[40%] min-w-[320px] max-w-[480px] rounded bg-white p-8 shadow-md">
        {linkError ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Reset link invalid</h1>
            <p className="font-medium text-gray-600">{linkError}</p>
            <Link
              href="/auth/forgotPassword"
              className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
            >
              Request a new link
            </Link>
          </div>
        ) : done ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Password updated</h1>
            <p className="font-medium text-gray-600">
              Your password has been reset. You can now log in with your new
              password.
            </p>
            <Link
              href="/auth/login"
              className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-3xl font-bold">Reset Password</h1>
            <p className="mb-10 font-semibold text-gray-600">
              Enter a new password for your administrator account
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <div>
                  <InputComponent
                    control={control}
                    name="newPassword"
                    label="New password"
                    watch={watch}
                    type="password"
                    rules={{
                      required: "New password is required",
                      validate: (value: string) => {
                        const hasSmallLetter = /[a-z]/.test(value);
                        const hasCapitalLetter = /[A-Z]/.test(value);
                        const hasNumber = /\d/.test(value);
                        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);
                        return (
                          (value.length >= 6 &&
                            hasSmallLetter &&
                            hasCapitalLetter &&
                            hasNumber &&
                            hasSymbol) ||
                          "Should contain at least one Capital Letter, one Small Letter, one Number & one Symbol"
                        );
                      },
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Should contain at least one Capital Letter, one Small
                    Letter, one Number & one Symbol
                  </p>
                </div>
                <InputComponent
                  control={control}
                  name="confirmPassword"
                  label="Re-enter password"
                  watch={watch}
                  type="password"
                  rules={{
                    required: "Please re-enter your password",
                    validate: (value: string) =>
                      value === newPassword || "Passwords do not match",
                  }}
                />
              </div>
              <div className="mt-16 flex items-center">
                <Link href="/auth/login" className="text-sm hover:underline">
                  Back to login
                </Link>
                <Button
                  className="ml-auto rounded-md bg-blue-500 px-8 py-2 text-sm text-slate-100 transition delay-75 ease-in-out hover:bg-blue-900"
                  title="Save password"
                  loading={loading}
                  type="submit"
                />
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
