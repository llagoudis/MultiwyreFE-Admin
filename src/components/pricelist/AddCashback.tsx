import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import {
  cashbackOperationTypeList,
  currencyList,
  paymentMethod,
  statuslist,
} from "~/data/country";

type propType = {
  onClose: () => void;
};

type formData = {
  name: string;
  email: string;
  template1: string;
  template2: string;
  template3: string;

  type: string;
  countryCode: string;
  number: string;
  issuedBy: string;
  issuedDate: string;
  validUntil: string;
  state: string;
};

const beneficiary_type = [
  { label: "Person", value: "person" },
  { label: "Company", value: "company" },
];

const AddCashback = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<formData>();

  const onSubmit = (values: formData) => {
    if (values) {
      // console.log(values);
    }
  };

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="my-4">
        <div>
          <div className="grid grid-cols-2 gap-5">
            <HeaderLayout name={"Details"}>
              <div className="grid grid-cols-2 gap-4">
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Price list"
                  required={true}
                  name="price_list"
                  rules={{ required: "Public id is required" }}
                  type="text"
                  watch={watch}
                />

                <InputComponent
                  control={control}
                  errors={errors}
                  label="Name"
                  required={true}
                  name="Name"
                  rules={{ required: "Name is required" }}
                  type="text"
                  watch={watch}
                />

                <SelectComponent
                  control={control}
                  options={statuslist}
                  label="Status"
                  required={true}
                  name="Status"
                  rules={{ required: "Status is required" }}
                />
                <SelectComponent
                  control={control}
                  options={cashbackOperationTypeList}
                  label="Operation type"
                  name="operation_type"
                  rules={{ required: "Operation type is required" }}
                />

                <SelectComponent
                  control={control}
                  options={beneficiary_type}
                  label="Beneficiary type"
                  name="beneficiary_type"
                  rules={{ required: "Beneficiary type is required" }}
                />
                <SelectComponent
                  control={control}
                  options={paymentMethod}
                  label="Payment method"
                  name="payment_method"
                  rules={{ required: "Payment method is required" }}
                />

                <InputComponent
                  control={control}
                  errors={errors}
                  label="Valid from"
                  name="valid_from"
                  rules={{ required: "Valid from is required" }}
                  type="date"
                  watch={watch}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Valid to"
                  name="valid_to"
                  rules={{ required: "Valid to is required" }}
                  type="date"
                  watch={watch}
                />
              </div>
            </HeaderLayout>
            <HeaderLayout name={"Amounts"}>
              <div className="grid grid-cols-2 gap-4">
                <SelectComponent
                  control={control}
                  options={currencyList}
                  label="Currency"
                  required={true}
                  name="currency"
                  rules={{ required: "Currency is required" }}
                />
                <InputComponent
                  control={control}
                  type="text"
                  watch={watch}
                  required={true}
                  errors={errors}
                  label="Percent"
                  name="percentage"
                  rules={{ required: "Percent is required" }}
                />
              </div>
            </HeaderLayout>
          </div>
          <div></div>
        </div>

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <Button
            title="Back"
            onClick={() => {
              props.onClose();
            }}
            className=" btn-outlined"
          ></Button>
          <Button
            title="Create"
            type="submit"
            className=" btn-solid"
            onClick={handleChange}
          ></Button>
        </div>
      </form>
    </>
  );
};

export default AddCashback;
