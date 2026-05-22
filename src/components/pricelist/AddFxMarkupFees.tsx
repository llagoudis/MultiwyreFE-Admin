import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { fxexamOperationTypeList } from "~/data/country";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { usePriceStore } from "~/store";

type propType = {
  onClose: () => void;
  fxMarkupDetails: FXMarkup;
  onSubmit: (values: any) => void;
  openAdd: string;
  loading: boolean;
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

  priceList: string;
  status: string;
  priceListId: string | number;
};

const statusList = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const AddFxMarkupFees = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<formData>();

  const pricelist: PriceList = usePriceStore();

  const [assets] = useAsyncMasterStore("assets");

  const filteredAssets = assets.filter(
    (asset) => asset.fireblockAssetId !== "USD",
  );

  const onSubmit = (values: formData) => {
    props.onSubmit(values);
  };

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  useEffect(() => {
    reset({
      ...props.fxMarkupDetails,
      priceList: pricelist.name,
      status: props.fxMarkupDetails.status ? "Active" : "Inactive",
      priceListId: pricelist.id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  return (
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
                name="priceList"
                type="text"
                watch={watch}
                disabled
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

              <SelectComponent
                control={control}
                options={statusList}
                label="Status"
                required={true}
                name="status"
                rules={{ required: "Status is required" }}
              />
              <SelectComponent
                control={control}
                options={fxexamOperationTypeList}
                label="Operation type"
                required={true}
                name="operationType"
                rules={{ required: "Operation type is required" }}
              />

              <InputComponent
                control={control}
                errors={errors}
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
                options={assets?.map((val: any) => ({
                  value: val.fireblockAssetId,
                  label: val.name,
                }))}
                required={true}
                label="From Currency"
                name="fromCurrencyId"
                rules={{ required: "From currency is required" }}
              />

              <SelectComponent
                control={control}
                required={true}
                options={filteredAssets?.map((val: any) => ({
                  value: val.fireblockAssetId,
                  label: val.name,
                }))}
                label="To Currency"
                name="toCurrencyId"
                rules={{ required: "To currency is required" }}
              />
              <div className=" col-span-2">
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
          title={props.openAdd === "edit" ? "Update" : "Create"}
          type="submit"
          className=" btn-solid"
          onClick={handleChange}
          loading={props.loading}
        ></Button>
      </div>
    </form>
  );
};

export default AddFxMarkupFees;
