import React, { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "~/components/common/Button";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { currencyList, holderList, providerList } from "~/data/country";

type propType = {
  onClose: (value?: string) => void;
  from: string;
};

type formData = {
  name: string;
  email: string;
  template1: string;
  template2: string;
  template3: string;

  Holder: string;
  Number: string;
  Name: string;
  Type: string;
  ProviderName: string;
  ProviderCurrency: string;
  ProviderNumber: string;
  FeeActivatedAt: string;
};
// filter options
// const filters: filterType[] = [
//   { label: "ID", name: "id" },
//   { label: "Holder", name: "Type" },
//   { label: "Number", name: "State" },
//   { label: "Name", name: "File" },
//   { label: "Type", name: "CountryCode" },
//   { label: "ProviderName", name: "Number" },
//   { label: "ProviderCurrency", name: "IssuedBy" },
//   { label: "ProviderNumber", name: "IssuedDate" },
//   { label: "FeeActivatedAt", name: "ValidUntil" },
// ];
// dropdown
const selectTemplate = [
  { label: "Template 1", value: "template1" },
  { label: "Template 2", value: "template2" },
];

const AddAccount = (props: propType) => {
  //=========== Form Controllers =================
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<formData>();

  const onSubmit = (values: formData) => {
    if (values) {
      console.log(values);
    }
  };

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="my-4">
          <div className="mt-4 w-full border border-[#00000030]">
            <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
              <h2 className="font-medium text-black">
                {props?.from === "create"
                  ? "Please add the information below"
                  : "Please edit the information below"}
              </h2>
            </div>
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <SelectComponent
                  control={control}
                  options={holderList}
                  required={true}
                  label="Holder"
                  name="Holder"
                  rules={{ required: "Holder is required" }}
                />

                <InputComponent
                  control={control}
                  required={true}
                  errors={errors}
                  label="Number"
                  name="number"
                  rules={{ required: "Number is required" }}
                  type="number"
                  watch={watch}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Name"
                  required={true}
                  name="Name"
                  rules={{ required: "Name required" }}
                  type="text"
                  watch={watch}
                />
                <SelectComponent
                  control={control}
                  options={selectTemplate}
                  label="Type"
                  required={true}
                  name="Type"
                  rules={{ required: "Type is required" }}
                />
                <SelectComponent
                  control={control}
                  options={providerList}
                  label="Provider name"
                  name="ProviderName"
                  rules={{ required: "Provider Name is required" }}
                />
                <SelectComponent
                  control={control}
                  options={currencyList}
                  label="Provider currency"
                  name="ProviderCurrency"
                  rules={{ required: "Provider Currency is required" }}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Provider number"
                  required={true}
                  name="ProviderNumber"
                  rules={{ required: "Provider Number is required" }}
                  type="text"
                  watch={watch}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Fee activated at"
                  name="FeeActivatedAt"
                  rules={{ required: "Fee Activated At is required" }}
                  type="date"
                  watch={watch}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
            <Button
              title="Back"
              onClick={() => {
                props.onClose("");
              }}
              className="btn-outlined"
            ></Button>
            <Button
              title={
                props?.from === "create" ? "Create Account" : "Save Changes"
              }
              type="submit"
              className="btn-solid"
              onClick={handleChange}
            ></Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddAccount;
