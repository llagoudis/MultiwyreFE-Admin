import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { currencyList, paymentMethod, providerList } from "~/data/country";
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
  status: string;
  currencyId: string;
  limitListId: number | string;
  limitListName: string;
};

type propType = {
  onClose: () => void;
  exchangeLimits?: ExchangeLimits;
  onSubmit: (values: any) => void;
  openAdd: string;
  limitList: Limits;
  loading: boolean;
};

const AddExchangeLimits = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>();

  const [operationTypeList] = useAsyncMasterStore("operationType");
  const [assets] = useAsyncMasterStore("assets");

  const onSubmit = (values: FormData) => {
    if (values) {
      const requestBody = { ...values, status: values.status === "Active" };

      props.onSubmit(requestBody);
    }
  };

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  useEffect(() => {
    return reset({
      ...props?.exchangeLimits,
      limitListName: props?.limitList?.name,
      limitListId: props?.limitList?.id,
      status: props?.exchangeLimits?.status ? "Active" : "Disabled",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  return (
    <>
      <HeaderLayout name={"Details"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              <InputComponent
                control={control}
                errors={errors}
                label="Limit Name"
                required={true}
                name="limitListName"
                rules={{ required: "Limit Name is required" }}
                type="text"
                watch={watch}
                disabled={true}
              />

              <SelectComponent
                control={control}
                options={providerList}
                label="Provider"
                required={true}
                name="providerId"
                rules={{ required: "Provider is required" }}
              />

              <SelectComponent
                control={control}
                options={[...assets, { name: "Euro", label: "EUR" }]}
                label="Currency"
                valueKey="fireblockAssetId"
                labelKey="name"
                required={true}
                name="currencyId"
                rules={{ required: "Currency is required" }}
              />

              <InputComponent
                control={control}
                errors={errors}
                required={true}
                label="Amount"
                name="amount"
                rules={{ required: "Amount is required" }}
                type="number"
                watch={watch}
              />

              <SelectComponent
                control={control}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Disabled", value: "Disabled" },
                ]}
                label="Status"
                required={true}
                name="status"
                rules={{ required: "Status is required" }}
              />

              <SelectComponent
                control={control}
                options={[
                  { label: "Min", value: "MIN" },
                  { label: "Max", value: "MAX" },
                ]}
                label="Exchange limit type"
                required={true}
                name="exchangeLimit"
                rules={{ required: "Exchange Limit is required" }}
              />

              <SelectComponent
                control={control}
                options={[
                  { label: "OTC Trade", value: "OTC_TRADE" },
                  { label: "Trade", value: "TRADE" },
                  { label: "Withdrawal", value: "WITHDRAWAL" },
                ]}
                label="Limit type"
                required={true}
                name="exchangeType"
                rules={{ required: "Limit type is required" }}
              />
            </div>
          </div>

          <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
            <Button
              title="Cancel"
              className="btn-outlined"
              onClick={() => {
                props.onClose();
              }}
            ></Button>
            <Button
              title="Submit"
              type="submit"
              className="btn-solid"
              onClick={handleChange}
              loading={props.loading}
            ></Button>
          </div>
        </form>
      </HeaderLayout>
    </>
  );
};

export default AddExchangeLimits;
