import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Button from "~/components/common/Button";
import InputComponent from "~/components/common/InputComponent";
import { forgotAdminPassword } from "~/service/api/auth";

type FormData = {
  email: string;
};

const ForgotPasswordPage = () => {
  const router = useRouter();
  const { handleSubmit, control, watch, setValue } = useForm<FormData>({
    defaultValues: { email: "" },
  });

  const [loading, setLoading] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [emailSent, setEmailSent] = useState(true);

  useEffect(() => {
    if (typeof router.query.email === "string" && router.query.email) {
      setValue("email", router.query.email);
    }
  }, [router.query.email, setValue]);

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    const [data, error] = await forgotAdminPassword(
      values.email.trim().toLowerCase(),
    );
    setLoading(false);

    if (error) return;

    const link =
      typeof data?.body?.resetLink === "string" ? data.body.resetLink : "";
    const sent = data?.body?.emailSent === true;

    setResetLink(link);
    setEmailSent(sent);

    toast.success(
      data?.message ??
        "If an administrator account exists for this email, a reset link has been sent.",
    );
    setMailSent(true);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Toaster />
      <div className="w-[40%] min-w-[320px] max-w-[480px] rounded bg-white p-8 shadow-md">
        {mailSent ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">
              {resetLink && !emailSent
                ? "Reset your password"
                : "Check your inbox"}
            </h1>
            <p className="font-medium text-gray-600">
              {resetLink && !emailSent
                ? "Email could not be sent (SMTP not configured on this machine). Use the reset link below to continue testing."
                : "We have sent password reset instructions to your email. Follow the link to create a new password."}
            </p>
            {resetLink ? (
              <a
                href={resetLink}
                className="break-all text-sm font-semibold text-blue-600 hover:underline"
              >
                {resetLink}
              </a>
            ) : null}
            <Link
              href="/auth/login"
              className="mt-6 text-sm font-semibold text-blue-600 hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-3xl font-bold">Forgot Password</h1>
            <p className="mb-10 font-semibold text-gray-600">
              Enter your administrator email to receive a reset link
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <InputComponent
                control={control}
                name="email"
                label="Email"
                watch={watch}
                type="text"
                rules={{
                  required: "Email is required",
                  validate: (value: string) =>
                    value.trim() !== "" || "This field cannot be blank",
                }}
              />
              <div className="mt-16 flex items-center">
                <Link href="/auth/login" className="text-sm hover:underline">
                  Back to login
                </Link>
                <Button
                  className="ml-auto rounded-md bg-blue-500 px-8 py-2 text-sm text-slate-100 transition delay-75 ease-in-out hover:bg-blue-900"
                  title="Continue"
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

export default ForgotPasswordPage;
