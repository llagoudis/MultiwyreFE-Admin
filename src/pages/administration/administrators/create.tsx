import React, { useEffect, useState } from "react";
import InputComponent from "~/components/common/InputComponent";
import { useForm } from "react-hook-form";
import HeaderLayout from "~/components/common/HeaderLayout";
import SelectComponent from "~/components/common/SelectComponent";

import { useRouter } from "next/router";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import {
  createNewAdminUser,
  updateAdminUser,
} from "~/service/api/administrator";
import toast from "react-hot-toast";
import checkicon from "~/assets/general/check-one.svg";
import DailogBox from "~/components/common/DailogBox";
import Image, { type StaticImageData } from "next/image";
import Button from "~/components/common/Button";

type FormData = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  roles: number;
  reEnterPassword: string;
  ipAddress?: string;
};

const CreateAdministrator = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>();
  const router = useRouter();
  const userId = router.query?.azureId as string;

  const [accessRoles] = useAsyncMasterStore("accessRoles");
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const { query } = router;

  const onSubmit = async (values: FormData) => {
    setLoading(true);

    const ipAddress = await fetch("https://api.ipify.org?format=json");
    const res = await ipAddress.json();

    if (res.ip) {
      values = { ipAddress: res.ip, ...values };
    }

    if (query?.from === "create") {
      const [response, err] = await createNewAdminUser(values);

      if (err) {
        toast.error("Failed to add admin user!!");
      }
      if (response?.success) {
        setOpenDialog(true);
      }
    } else {
      const id: string = Array.isArray(query?.azureId)
        ? query?.azureId[0] ?? ""
        : query?.azureId ?? "";

      const data = {
        azureId: id ?? "",
        ...values,
      };
      const [response, err] = await updateAdminUser(data);

      if (err) {
        toast.error("Failed to update admin user!!");
      }
      if (response?.success) {
        setOpenDialog(true);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (query.from === "edit") {
      setQueryFieldValue("firstname", query?.firstname);
      setQueryFieldValue("lastname", query?.lastname);
      setQueryFieldValue("email", query?.email);
      setQueryFieldValue("roles", query?.role);
    }
  }, [query]);

  type AllowedFieldNames =
    | "firstname"
    | "lastname"
    | "email"
    | "password"
    | "roles"
    | "reEnterPassword";

  const setQueryFieldValue = (
    fieldName: AllowedFieldNames,
    queryField: string | string[] | undefined,
  ) => {
    const value: string = Array.isArray(queryField)
      ? queryField[0] ?? ""
      : queryField ?? "";
    setValue(fieldName, value);
  };

  const password = watch("password");

  const isRequiredCondition = query.from === "create";

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">
          {query.from === "create"
            ? "Create administrators"
            : query.from === "edit"
              ? "Edit administrators"
              : ""}
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="my-4 flex flex-col gap-3"
      >
        <HeaderLayout
          name={
            query.from === "create"
              ? "Please enter the following to create a new admin"
              : query.from === "edit"
                ? "Please enter the following to edit a admin"
                : ""
          }
          enabled={"Enabled"}
        >
          <div className="grid grid-cols-3 gap-3">
            <InputComponent
              control={control}
              errors={errors}
              type="text"
              watch={watch}
              label="First name"
              required={true}
              name="firstname"
              rules={{ required: "First name is required" }}
            />

            <InputComponent
              control={control}
              errors={errors}
              required={true}
              label="Last name"
              name="lastname"
              rules={{ required: "Last name is required" }}
              type="text"
              watch={watch}
            />

            <InputComponent
              control={control}
              errors={errors}
              label="Email"
              required={true}
              name="email"
              rules={{ required: "Email is required" }}
              type="text"
              watch={watch}
            />

            <SelectComponent
              control={control}
              options={accessRoles}
              labelKey="displayName"
              valueKey="id"
              label="Role"
              required={true}
              name="roles"
              rules={{ required: "Role is required" }}
            />

            <InputComponent
              control={control}
              errors={errors}
              label="Password"
              required={true}
              name="password"
              rules={{
                ...(userId
                  ? {
                      validate: (value: string) => {
                        if (value) {
                          const hasSmallLetter = /[a-z]/.test(value);
                          const hasCapitalLetter = /[A-Z]/.test(value);
                          const hasNumber = /\d/.test(value);
                          const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(
                            value,
                          );

                          return (
                            (value.length >= 6 &&
                              hasSmallLetter &&
                              hasCapitalLetter &&
                              hasNumber &&
                              hasSymbol) ||
                            "Password should meet the specified criteria"
                          );
                        } else {
                          return true;
                        }
                      },
                    }
                  : {
                      required: "Password is required",
                      validate: (value: string) =>
                        value.length >= 8 ||
                        "Password should be at least 8 characters long",
                    }),
              }}
              type="password"
              watch={watch}
            />

            <InputComponent
              control={control}
              errors={errors}
              label="Re enter Password"
              required={true}
              name="reenterpassword"
              rules={{
                ...(userId
                  ? {
                      validate: {
                        matchesPreviousPassword: (value: string) => {
                          const { password } = watch();
                          if (password) {
                            return (
                              password === value || "Passwords do not match"
                            );
                          } else {
                            return true;
                          }
                        },
                      },
                    }
                  : {
                      required: "Confirmed Password is required",
                      validate: {
                        matchesPreviousPassword: (value: string) => {
                          const { password } = watch();
                          return password === value || "Passwords do not match";
                        },
                      },
                    }),
              }}
              type="password"
              watch={watch}
            />
          </div>

          <p className=" ml-auto w-fit break-all text-xs font-normal text-black">
            <span className=" font-bold">Password Criteria:</span> Should
            contain at least one Capital Letter, one Small Letter, one Number &
            one Symbol
          </p>
        </HeaderLayout>

        <div className="flex w-full justify-end gap-4 px-3">
          <Button
            title={
              query.from === "create"
                ? "Create admin"
                : query.from === "edit"
                  ? "Edit admin"
                  : ""
            }
            type="submit"
            className="btn-solid"
            loading={loading}
          />
        </div>
      </form>
      <DailogBox
        maxWidth={"xs"}
        open={openDialog}
        handleClose={() => void router.push(`/administration/administrators`)}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            {userId
              ? "Details updated successfully"
              : "Admin User created successfully"}
          </h1>
          <p>
            {userId
              ? "The admin user details was successfully updated"
              : "The new admin user creation was successfull"}
          </p>

          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={() => void router.push(`/administration/administrators`)}
          />
        </div>
      </DailogBox>
    </>
  );
};

export default CreateAdministrator;
