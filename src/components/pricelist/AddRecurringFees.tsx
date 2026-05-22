import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { periodList, statuslist } from "~/data/country";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import {
  createRecurringFees,
  updateRecurringFees,
} from "~/service/api/pricelists";
import { useGlobalStore, usePriceStore } from "~/store";

type propType = {
  onClose: () => void;
  recurringFees: RecurringFees;
  openAdd: string;
};

const AddRecurringFees = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<RecurringFees>();

  const [operationTypeList] = useAsyncMasterStore("operationType");
  const [assets] = useAsyncMasterStore("assets");
  const filteredAssets = assets.filter(
    (asset) => asset.fireblockAssetId !== "USD",
  );
  const [operationTypeArray] = useAsyncMasterStore("operationType");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: RecurringFees) => {
    const openAdd = props.openAdd;
    setLoading(true);
    const {
      currencyId,
      fixedFee,
      name,
      percentage,
      period,
      status,
      validFrom,
      validTo,
      operationType,
      priceListId,
    } = values;

    const requestBody = {
      currencyId,
      fixedFee,
      name,
      percentage,
      period,
      status: status === "active",
      validFrom,
      validTo,
      operationType,
      priceListId: priceList.id,
    };
    await (
      openAdd === "edit"
        ? updateRecurringFees({ ...requestBody, id: values.id })
        : createRecurringFees(requestBody)
    ).then(([res]) => {
      setLoading(false);
      if (res?.success) {
        res?.message && toast.success(res?.message);
        const OperationType = operationTypeArray?.find(
          (obj) => obj.id === values.operationType,
        );
        if (openAdd === "addNew") {
          usePriceStore.setState((prev) => {
            return {
              ...prev,
              RecurringFees: [
                { ...res.body, OperationType },
                ...(prev?.RecurringFees ?? []),
              ],
            };
          });
        } else {
          usePriceStore.setState((prev) => {
            const newRecurringFees = [...(prev.RecurringFees ?? [])];
            newRecurringFees.splice(
              newRecurringFees.findIndex((obj: any) => obj.id === values.id),
              1,
            );
            return {
              ...prev,
              RecurringFees: [
                { ...res.body, OperationType },
                ...newRecurringFees,
              ],
            };
          });
        }
        props.onClose();
      }
    });
  };

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  const priceList = useGlobalStore((state) => state.pricelist);

  useEffect(() => {
    reset({
      ...props.recurringFees,
      status: props.recurringFees.status ? "active" : "inactive",
    });
  }, [props]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="my-4">
        <div>
          <div className="grid grid-cols-2 gap-5">
            <HeaderLayout name={"Details"}>
              <div className="grid grid-cols-2 gap-4">
                <div className=" col-span-2">
                  <InputComponent
                    control={control}
                    errors={errors}
                    label="Price list"
                    value={priceList.name}
                    name="priceListName"
                    disabled
                    type="text"
                    watch={watch}
                  />
                </div>
                <div className=" col-span-2">
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
                </div>

                <SelectComponent
                  control={control}
                  options={statuslist}
                  label="Status"
                  required={true}
                  name="status"
                  rules={{ required: "Status is required" }}
                />
                {/* <SelectComponent
                  control={control}
                  options={operationTypeList?.map((val: any) => ({
                    value: val.id,
                    label: val.displayName,
                  }))}
                  required={true}
                  label="Operation type"
                  name="operationType"
                  rules={{ required: "Operation type is required" }}
                /> */}
                <div className=" col-span-2">
                  <SelectComponent
                    control={control}
                    required={true}
                    options={periodList}
                    label="Period"
                    name="period"
                    rules={{ required: "Period is required" }}
                  />
                </div>

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
              <div className="grid gap-5">
                <SelectComponent
                  control={control}
                  options={filteredAssets?.map((val: any) => ({
                    value: val.fireblockAssetId,
                    label: val.name,
                  }))}
                  label="Currency"
                  name="currencyId"
                  rules={{ required: "Currency is required" }}
                />

                <InputComponent
                  control={control}
                  errors={errors}
                  label="Fixed fee"
                  required={true}
                  name="fixedFee"
                  rules={{ required: "Fixed fee is required" }}
                  type="number"
                  watch={watch}
                />
                {/* <InputComponent
                  control={control}
                  errors={errors}
                  label="Percentage"
                  required={true}
                  name="percentage"
                  rules={{ required: "Percentage is required" }}
                  type="number"
                  watch={watch}
                /> */}
                {/* <p className=" text-sm font-normal">
                  Percentage fee works only on annual fee operation types
                </p> */}
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
            loading={loading}
          ></Button>
        </div>
      </form>
    </>
  );
};

export default AddRecurringFees;
