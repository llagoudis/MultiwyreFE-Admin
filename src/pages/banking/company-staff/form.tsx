import React, { useEffect, useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useCompanyStore } from "~/store";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllCompanies,
  getAllUsers,
  addCompanyStaff,
  getStaffById,
  updateCompanyStaff,
} from "~/service/api";
import Image, { type StaticImageData } from "next/image";
import HeaderLayout from "~/components/common/HeaderLayout";
import SelectComponent from "~/components/common/SelectComponent";
import Button from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import { staffRoles } from "~/data/country";

interface propType {
  onClose: () => void;
  from: string;
}

const AddStaff: FC<propType> = () => {
  const router = useRouter();
  const company: CompanyDetailsType = useCompanyStore();

  const redirectFrom = router.query.from as string;
  const associationId = router.query.id as string;

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<{
    companies: User[];
    persons: User[];
  }>({
    companies: [],
    persons: [],
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    reset,
  } = useForm<StaffFormType>();

  const showSuccess = () => {
    setOpen((prev) => !prev);
  };

  const onConfirmClose = () => {
    router.back();
  };

  const onSubmit = async (data: StaffFormType) => {
    const [res] = associationId
      ? await updateCompanyStaff({ ...data, id: associationId })
      : await addCompanyStaff(data);

    if (res?.success) {
      if (
        redirectFrom === "company" &&
        data.companyProfileId == company.company.id
      ) {
        useCompanyStore.setState((prev) => {
          const nextState = { ...prev };

          if (associationId) {
            const idx = nextState.company.UserCompanyAssociations.findIndex(
              (item) => item.id === parseInt(associationId),
            );
            nextState.company.UserCompanyAssociations[idx] = res.body;
          } else {
            nextState.company.UserCompanyAssociations = [
              res.body,
              ...nextState.company.UserCompanyAssociations,
            ];
          }
          return nextState;
        });
      }
      showSuccess();
    }
  };

  useEffect(() => {
    if (redirectFrom === "company") {
      sessionStorage.setItem("companiesActiveTab", "3");
    }

    const fetchStaffData = async () => {
      if (associationId) {
        const [res] = await getStaffById(associationId);
        if (res?.success) {
          const { User, roles, owner } = res.body;
          reset({
            companyProfileId: User?.azureId,
            userId: owner?.azureId,
            roles: roles ?? "",
          });
        } else {
          toast.error("Failed to fetch data");
        }
      }
    };

    void fetchStaffData();
  }, [redirectFrom, associationId, reset]);

  useEffect(() => {
    void Promise.all([getAllCompanies(true), getAllUsers()]).then(
      ([[companies], [users]]) => {
        const companyUsersList: User[] =
          users?.body
            .filter(
              (item) =>
                item?.userType === "COMPANY" &&
                item?.isUserVerified === "APPROVED",
            )
            .sort((a, b) => {
              const firstnameA = a.firstname.toUpperCase();
              const firstnameB = b.firstname.toUpperCase();
              if (firstnameA < firstnameB) {
                return -1;
              }
              if (firstnameA > firstnameB) {
                return 1;
              }
              return 0;
            }) ?? [];

        const individualUsersList: User[] =
          users?.body
            .filter(
              (item) =>
                item?.userType !== "COMPANY" &&
                item?.isUserVerified === "APPROVED",
            )
            .sort((a, b) => {
              const firstnameA = a.firstname.toUpperCase();
              const firstnameB = b.firstname.toUpperCase();
              if (firstnameA < firstnameB) {
                return -1;
              }
              if (firstnameA > firstnameB) {
                return 1;
              }
              return 0;
            }) ?? [];

        if (users) {
          setOptions((prev) => ({
            ...prev,
            companies: companyUsersList ?? [],
            persons: individualUsersList ?? [],
          }));
        }
      },
    );
  }, []);

  return (
    <div className="mt-4">
      <Toaster />
      <div>
        <p className=" text-2xl font-bold text-[#1E293B]">
          {associationId ? "Edit company staff" : "Create company staff"}
        </p>
      </div>
      <DailogBox maxWidth={"xs"} open={open} handleClose={onConfirmClose}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            Staff {associationId ? "updated" : "created"} successfully
          </h1>
          <p>
            {`Company staff has been
            ${associationId ? "updated" : "created"} successfully`}
          </p>
          <Button
            onClick={onConfirmClose}
            className="btn-solid w-full"
            title="Close"
          />
        </div>
      </DailogBox>

      <br />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="my-4 flex flex-col gap-3"
      >
        <HeaderLayout
          name={
            associationId
              ? "Edit a company staff"
              : "Create a new company staff"
          }
        >
          <div className="flex justify-between gap-5">
            <SelectComponent
              control={control}
              required={true}
              label="Company"
              name="companyProfileId"
              valueKey="azureId"
              getOptionLabel={(option) =>
                `${option.firstname} ${option.lastname}`
              }
              options={options.companies}
              rules={{ required: "Company is required" }}
            />

            <SelectComponent
              control={control}
              required={true}
              label="Person"
              name="userId"
              valueKey="azureId"
              getOptionLabel={(option) =>
                `${option.firstname} ${option.lastname}`
              }
              options={options.persons}
              rules={{ required: "Person is required" }}
            />

            <SelectComponent
              control={control}
              options={staffRoles}
              label="Permissions*"
              name="roles"
              rules={{ required: "Permission is required" }}
            />
          </div>
        </HeaderLayout>

        <div className="mt-8 flex w-full justify-end gap-4 px-3">
          <Button
            title="Back"
            type="button"
            onClick={() => {
              router.back();
            }}
            className="btn-outlined"
          />
          <Button
            title={"Submit"}
            type="submit"
            className="btn-solid"
            loading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
};

export default AddStaff;
