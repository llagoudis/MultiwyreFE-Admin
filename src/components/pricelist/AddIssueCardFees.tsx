import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import {
  cardTypeList,
  currencyList,
  issuedCardOperationList,
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

// dropdown
const businessTypes = [
  { label: "Template 1", value: "template1" },
  { label: "Template 2", value: "template2" },
];

const AddIssueCardFees = (props: propType) => {
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
                  name="Name"
                  type="text"
                  rules={{ required: "Name is required" }}
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
                  options={cardTypeList}
                  label="Card type"
                  name="card_type"
                  rules={{ required: "Card type is required" }}
                />
                <SelectComponent
                  control={control}
                  options={businessTypes}
                  label="Card scheme"
                  name="card_scheme"
                  rules={{
                    required: "Card scheme is required",
                  }}
                />
                <SelectComponent
                  control={control}
                  options={issuedCardOperationList}
                  label="Operations"
                  name="operations"
                  required={true}
                  rules={{ required: "Operations is required" }}
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
              <div className="grid grid-cols-2 gap-5">
                <SelectComponent
                  control={control}
                  options={currencyList}
                  label="Currency"
                  name="currency"
                  rules={{ required: "Currency is required" }}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Fixed fee"
                  required={true}
                  name="fixed_fee"
                  rules={{ required: "Fixed fee is required" }}
                  type="text"
                  watch={watch}
                />
                <div>
                  <InputComponent
                    control={control}
                    errors={errors}
                    label="Minimum fee"
                    required={true}
                    name="minimum_fee"
                    rules={{ required: "Minimum fee is required" }}
                    type="text"
                    watch={watch}
                  />
                  <p className=" text-xs font-normal">
                    Not applicable for current operations type
                  </p>
                </div>
                <div>
                  <InputComponent
                    control={control}
                    errors={errors}
                    label="Maximum fee"
                    required={true}
                    name="maximum_fee"
                    rules={{ required: "Maximum fee is required" }}
                    type="text"
                    watch={watch}
                  />
                  <p className=" text-xs font-normal">
                    Not applicable for current operations type
                  </p>
                </div>
                <div className=" col-span-2">
                  <InputComponent
                    control={control}
                    errors={errors}
                    label="Percent"
                    required={true}
                    name="percent"
                    rules={{ required: "Percent* is required" }}
                    type="text"
                    watch={watch}
                  />
                </div>
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

export default AddIssueCardFees;
