import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { currencyList, paymentMethod } from "~/data/country";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { usePriceStore } from "~/store";

// dropdown
const businessTypes = [
  { label: "Template 1", value: "template1" },
  { label: "Template 2", value: "template2" },
];

const statuslist = [
  { label: "Active ", value: "active" },
  { label: "Disabled", value: "inactive" },
];

type FormData = {
  name: string;
  operationType: number;
  status: string;
  validFrom: string;
  validTo: string;
  currencyId: string;
  percent: number;
  fixedFee: number;
  minimumFee: number | null;
  maximumFee: number | null;
  transferGroup: string;
  beneficiaryGroup: string;
  priceListId: number | string;
  priceListName: string;
};

type propType = {
  onClose: () => void;
  transferFees: TransferFees;
  onSubmit: (values: any) => void;
  openAdd: string;
  priceList: PriceList;
  loading: boolean;
};

const AddTransferFee = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>();

  const [operationTypeList] = useAsyncMasterStore("operationType");
  const [assets] = useAsyncMasterStore("assets");

  const filteredAssets = assets.filter(
    (asset) => asset.fireblockAssetId !== "USD",
  );

  const onSubmit = (values: FormData) => {
    const {
      name,
      operationType,
      status,
      validFrom,
      validTo,
      currencyId,
      percent,
      fixedFee,
      minimumFee,
      maximumFee,
      transferGroup,
      beneficiaryGroup,
    } = values;
    if (values) {
      const data = {
        name,
        priceListId: props.priceList?.id,
        operationType,
        status,
        validFrom,
        validTo,
        currencyId,
        percent: percent,
        fixedFee: fixedFee,
        minimumFee: minimumFee ? minimumFee : null,
        maximumFee: maximumFee ? maximumFee : null,
        transferGroup,
        beneficiaryGroup,
        paymentMethod: "crypto",
      };
      props.onSubmit(data);
    }
  };

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  useEffect(() => {
    return reset({
      ...props.transferFees,
      priceListName: props.priceList?.name,
      priceListId: props.priceList?.id,
      status: props.transferFees.status ? "active" : "inactive",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

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
                  name="priceListName"
                  rules={{ required: "Public id is required" }}
                  type="text"
                  watch={watch}
                  disabled={true}
                />

                <InputComponent
                  control={control}
                  errors={errors}
                  label="Name"
                  name="name"
                  type="text"
                  watch={watch}
                  rules={{ required: "Name is required" }}
                />

                <SelectComponent
                  control={control}
                  options={statuslist}
                  label="Status"
                  required={true}
                  name="status"
                  rules={{ required: "Status is required" }}
                />
                <SelectComponent
                  control={control}
                  options={operationTypeList}
                  required={true}
                  valueKey="id"
                  labelKey="displayName"
                  label="Operation type"
                  name="operationType"
                  rules={{ required: "Operation type is required" }}
                />
                <SelectComponent
                  control={control}
                  options={businessTypes}
                  label="Beneficiary bank country group"
                  name="beneficiaryBankCountryGroup"
                />
                <SelectComponent
                  control={control}
                  options={businessTypes}
                  label="Account provider"
                  name="accountProvider"
                />
                <SelectComponent
                  control={control}
                  options={paymentMethod}
                  label="Payment method"
                  name="paymentMethod"
                />
                <SelectComponent
                  control={control}
                  options={businessTypes}
                  label="Transfer provider"
                  name="transferProvider"
                />
                <InputComponent
                  control={control}
                  label="Valid from"
                  name="validFrom"
                  rules={{ required: "Valid from is required" }}
                  type="date"
                  watch={watch}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Valid to"
                  name="validTo"
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
                  options={filteredAssets}
                  label="Currency"
                  valueKey="fireblockAssetId"
                  labelKey="name"
                  name="currencyId"
                  rules={{ required: "Currency is required" }}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Percent"
                  required={true}
                  name="percent"
                  rules={{
                    required: "Percent is required",
                    validate: (value: string) => {
                      const intValue = parseInt(value, 10);

                      if (isNaN(intValue) || intValue < 0 || intValue > 100) {
                        return "Please enter a valid percentage between 0 and 100";
                      }
                      return true;
                    },
                  }}
                  type="number"
                  watch={watch}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Fixed fee"
                  required={true}
                  name="fixedFee"
                  rules={{
                    required: "Fixed fee is required",
                    validate: (value: any) => {
                      const maximumFee: any = watch("maximumFee");
                      if (
                        maximumFee !== 0 &&
                        maximumFee !== null &&
                        maximumFee !== "" &&
                        parseFloat(value) > maximumFee
                      ) {
                        return "Fixed fees cannot be more than maximum fees";
                      } else {
                        return true;
                      }
                    },
                  }}
                  type="number"
                  watch={watch}
                />
                <div className="flex flex-col">
                  <InputComponent
                    control={control}
                    errors={errors}
                    label="Minimum commissioned amount"
                    name="minimumFee"
                    type="number"
                    watch={watch}
                    bottomText={"minimum amount to charge fee from"}
                    rules={{
                      validate: (value: any) => {
                        const maximumFee: any = watch("maximumFee");
                        if (parseFloat(value) === 0) {
                          return "Minimum fee cannot be zero";
                        } else if (parseFloat(value) < 0) {
                          return "Minimum fee cannot be negative value";
                        } else if (parseFloat(value) == maximumFee) {
                          return "Minimum and maximum amount cannot be same";
                        } else if (parseFloat(value) > parseFloat(maximumFee)) {
                          return "Minimum fee cannot be greater than maximum fee";
                        } else if (
                          parseFloat(value) &&
                          (maximumFee === null || maximumFee === "")
                        ) {
                          return "Minimum fee cannot be greater than maximum fee";
                        } else {
                          return true;
                        }
                      },
                    }}
                  />
                </div>

                <InputComponent
                  control={control}
                  errors={errors}
                  label="Maximum commissioned amount"
                  name="maximumFee"
                  type="number"
                  watch={watch}
                  bottomText="Maximum amount to charge fee from"
                  rules={{
                    validate: (value: any) => {
                      if (parseFloat(value) === 0) {
                        return "Maximum fee cannot be zero";
                      } else if (parseFloat(value) === 0) {
                        return "Maximum fee cannot be negative value";
                      }
                    },
                  }}
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
            title={props.openAdd === "edit" ? "Update" : "Create"}
            type="submit"
            className=" btn-solid"
            onClick={handleChange}
            loading={props.loading}
          ></Button>
        </div>
      </form>
    </>
  );
};

export default AddTransferFee;
