import React, { useState, Fragment } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "~/store";
import { useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import toast, { Toaster } from "react-hot-toast";
import { login } from "~/service/ApiRequests";
import ErrorResponse from "~/service/ErrorResponse";
import localStorageService from "~/service/LocalstorageService";
import InputComponent from "../common/InputComponent";
import { decryptResponse } from "~/common/functions";

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
      const res_en: { data: { body: AuthBody; success?: boolean } } =
        await login({
          email: email,
          password,
          type: "admin",
        });

      const res = decryptResponse(res_en.data);

      const { email: adminEmail, firstname, lastname } = res.body;

      const adminData = {
        adminEmail,
        firstname,
        lastname,
      };

      if (res?.success) {
        useAuthStore.setState(res?.body);
        localStorageService.encodeAuthBody(res?.body);
        localStorageService.setLocalAccessToken(res?.body?.token);

        toast.success("Login successful");
        void router.push("/");
      }
    } catch (error) {
      const message = ErrorResponse(error);
      setIsLoading(false);
      resetField("password");
      toast.error(message);
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
