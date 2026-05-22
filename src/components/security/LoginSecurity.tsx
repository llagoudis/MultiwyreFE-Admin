import React, { useEffect, useState } from "react";
import InputComponent from "~/components/common/InputComponent";
import { useForm } from "react-hook-form";
import HeaderLayout from "~/components/common/HeaderLayout";
import Button from "~/components/common/Button";
import { updateSecurity } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { enforcePermission } from "~/utils/permissions";

type formData = {
  loginAttempts: string;
  passwordAttempts: string;
  IpAttempts: string;
  blockingDuration: string;
};

type Props = {
  data?: Security;
  fetchUpdatedSecuriy: () => void;
};

const LoginSecurity = ({ data, fetchUpdatedSecuriy }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<Security>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    reset(data as formData);
  }, [data]);

  const onSubmit = async (data: formData) => {
    setLoading(true);
    const reqBody = {
      loginAttempts: data?.loginAttempts,
      passwordAttempts: "0",
      IpAttempts: data?.IpAttempts,
      blockingDuration: data?.blockingDuration,
    };
    const [res, error] = await updateSecurity(reqBody);

    if (res?.success) {
      toast.success("Security updated successfully");
      setLoading(false);

      // void fetchSecurity();
      void fetchUpdatedSecuriy();
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enforcePermission("write", () => handleSubmit(onSubmit)(e));
        }}
        className="flex flex-col gap-3"
      >
        <div className="grid grid-cols-2 gap-5">
          <HeaderLayout name={"Block user by login"}>
            <div className="grid grid-cols-1 gap-3">
              <InputComponent
                control={control}
                errors={errors}
                type="text"
                watch={watch}
                label="Number of failed attempts"
                required={true}
                name="loginAttempts"
                rules={{ required: "Number of failed attempts are required" }}
              />

              {/* <InputComponent
                control={control}
                errors={errors}
                type="number"
                watch={watch}
                label="Attempts reset"
                name="passwordAttempts"
              /> */}
            </div>
          </HeaderLayout>

          <HeaderLayout name={"Blocking IP Address"}>
            <div className="grid grid-cols-1 gap-3">
              <InputComponent
                control={control}
                errors={errors}
                type="text"
                watch={watch}
                label="Number of failed attempts"
                required={true}
                name="IpAttempts"
                rules={{ required: "Number of failed attempts are required" }}
              />

              <InputComponent
                control={control}
                errors={errors}
                type="text"
                watch={watch}
                required={true}
                rules={{ required: "Blocking duration are required" }}
                label="Blocking duration"
                name="blockingDuration"
              />
            </div>
          </HeaderLayout>
        </div>

        <div className="flex w-full justify-end gap-4 px-3">
          <Button
            loading={loading}
            title="Apply Changes"
            type="submit"
            className="btn-solid"
          ></Button>
        </div>
      </form>
    </>
  );
};

export default LoginSecurity;
