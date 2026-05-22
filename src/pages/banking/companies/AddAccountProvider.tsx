import React, { Fragment, useState } from "react";
import InputComponent from "~/components/common/InputComponent";
import { useForm } from "react-hook-form";
import HeaderLayout from "~/components/common/HeaderLayout";
import SelectComponent from "~/components/common/SelectComponent";
import Button from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";
import { BsPlus } from "react-icons/bs";
import MuiButton from "~/components/common/Button";
import { providerList } from "~/data/country";
import Header from "~/components/common/Header";

type companyStaff = {
  company: string;
  person: string;
  permissions: string;
};

const permissions = [
  { label: "Company 1", value: "company1" },
  { label: "Company 2", value: "company2" },
];

const AddAccountProvider = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<companyStaff>();

  const onSubmit = () => {
    console.log("SUBMIT");
  };

  // opening dailog box
  const [open, setOpen] = useState(false);

  const handleChange = () => {
    setOpen(!open);
  };

  return (
    <Fragment>
      <DailogBox maxWidth={"xs"} open={open} handleClose={handleChange}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            Staff created successfully
          </h1>
          <p>Company staff with the name “XYZ” has been created successfully</p>
          <MuiButton className="btn-solid " title="Close"></MuiButton>
        </div>
      </DailogBox>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 my-4">
        <div className="py-4">
          <Header head={"Add account provider configurations"} />
        </div>
        <HeaderLayout name={"Fill the details below"} enabled={"Enabled"}>
          <div className="grid grid-cols-3 gap-3">
            <SelectComponent
              control={control}
              options={permissions}
              label="Company"
              required={true}
              name="company"
              rules={{ required: "Company is required" }}
            />

            <SelectComponent
              control={control}
              options={providerList}
              required={true}
              label="Provider Name"
              name="provider"
              rules={{ required: "Provider is required" }}
            />

            <InputComponent
              control={control}
              errors={errors}
              label="Name"
              required={true}
              name="name"
              rules={{ required: "Name is required" }}
              type="text"
              watch={watch}
            />

            <InputComponent
              control={control}
              errors={errors}
              label="Value"
              required={true}
              name="value"
              rules={{ required: "Value is required" }}
              type="text"
              watch={watch}
            />
          </div>
        </HeaderLayout>

        <div className="flex w-full justify-end gap-4 px-3">
          <Button title="Back" className="btn-outlined"></Button>
          <Button
            title="Create account provider configuration"
            type="submit"
            className="btn-solid"
          >
            <BsPlus size={20} />
          </Button>
        </div>
      </form>
    </Fragment>
  );
};

export default AddAccountProvider;
