import React, { useEffect, useState } from "react";
import InputComponent from "~/components/common/InputComponent";
import { Controller, useForm } from "react-hook-form";
import HeaderLayout from "~/components/common/HeaderLayout";
import Button from "~/components/common/Button";
import { TextareaAutosize } from "@mui/material";
import { updateSecurity } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { enforcePermission } from "~/utils/permissions";

type formData = {
  logoutMinutes: string;
  messageAfterLogout: string;
  messageBeforeLogout: string;
  timeoutPadding: string;
};

type Props = {
  data?: Security;
  fetchUpdatedSecuriy: () => void;
};

const AutoLogout = ({ data, fetchUpdatedSecuriy }: Props) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm<formData>();

  useEffect(() => {
    reset(data as formData);
  }, [data]);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: formData) => {
    setLoading(true);
    const reqBody = {
      logoutMinutes: data?.logoutMinutes,
      messageAfterLogout: data?.messageAfterLogout,
      messageBeforeLogout: data?.messageBeforeLogout,
      timeoutPadding: data?.timeoutPadding,
    };
    const [res, error] = await updateSecurity(reqBody);

    if (res?.success) {
      toast.success("Security updated successfully");

      setLoading(false);

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
        <div className="grid grid-cols-1 gap-5">
          <HeaderLayout name={"Auto logout for regular users"}>
            <div className="grid grid-cols-2 gap-3">
              <InputComponent
                control={control}
                errors={errors}
                type="text"
                watch={watch}
                label="Minutes"
                name="logoutMinutes"
                rules={{ required: "Minutes are required" }}
              />

              <InputComponent
                control={control}
                errors={errors}
                type="text"
                watch={watch}
                label="Timeout padding"
                required={true}
                name="timeoutPadding"
                rules={{ required: "Timeout padding is required" }}
              />

              <div className=" max-w-full">
                <p className=" subText mb-2">Auto logout message *</p>
                <Controller
                  rules={{ required: "Auto logout message is required" }}
                  name="messageBeforeLogout"
                  control={control}
                  render={({ field }) => (
                    <TextareaAutosize
                      {...field}
                      minRows={5}
                      style={{ width: "100%", resize: "none" }}
                      className="rounded border"
                    />
                  )}
                />
                <p className="text-sm text-red-500">
                  {errors?.messageBeforeLogout?.message}
                </p>
              </div>

              <div className=" max-w-full">
                <p className=" subText mb-2">Message after logout *</p>
                <Controller
                  rules={{ required: "Message after logout is required" }}
                  name="messageAfterLogout"
                  control={control}
                  render={({ field }) => (
                    <TextareaAutosize
                      {...field}
                      minRows={5}
                      style={{ width: "100%", resize: "none" }}
                      className="rounded border"
                    />
                  )}
                />
                <p className="text-sm text-red-500">
                  {errors?.messageAfterLogout?.message}
                </p>
              </div>
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

export default AutoLogout;
