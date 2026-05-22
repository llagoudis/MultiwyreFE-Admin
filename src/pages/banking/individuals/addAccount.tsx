import React, { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "~/components/common/Button";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { currencyList, holderList, providerList } from "~/data/country";

type propType = {
  onClose: () => void;
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

// Type
const selectType = [
  { label: "Standard ", value: "Standard " },
  { label: "Finance", value: "Finance" },
  { label: "Crypto", value: "Crypto" },
  { label: "Driving license", value: "Driving license" },
  {
    label: "Company registration certificate",
    value: "Company registration certificate",
  },
  { label: "Utility Bill", value: "Utility Bill" },
  { label: "Power of atteorney", value: "Power of atteorney" },
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

  const onInvalid = () => {
    // console.log(data);
  };

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  return (
    <div>
      <div className=" flex items-center justify-between py-4">
        <div>
          <p className=" text-2xl font-bold text-[#1E293B]">
            {props?.from === "create" ? "Add accounts" : "Edit Accounts"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="mt-4 w-full border border-[#00000030]">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">
              Please add the information below
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
                errors={errors}
                label="Number"
                required={true}
                name="number"
                rules={{ required: "Number is required" }}
                type="text"
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
                options={selectType}
                required={true}
                label="Type"
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
            title="Cancel"
            onClick={() => {
              props.onClose();
            }}
            className="btn-outlined"
          ></Button>
          <Button
            title={props?.from === "create" ? "Create account" : "Save changes"}
            type="submit"
            className="btn-solid"
            onClick={handleChange}
          ></Button>
        </div>
      </form>
    </div>
  );
};

export default AddAccount;
