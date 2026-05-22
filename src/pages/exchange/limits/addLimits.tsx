import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import {
  createExchangeLimit,
  getAllExchangeLimitById,
  updateExchangeLimit,
} from "~/service/api/exchangeLimits";

const providerList = [
  { label: "Internal", value: 1 },
  { label: "SEPA Manual", value: 2 },
  { label: "SWIFT Manual", value: 3 },
  { label: "SEPA Clear Junction", value: 4 },
  { label: "SWIFT Clear Junction", value: 5 },
  { label: "SEPA Clear Bank", value: 6 },
  { label: "SWIFT Clear Bank", value: 7 },
  { label: "Card", value: 8 },
  { label: "Local", value: 9 },
  { label: "Local Manual FS", value: 10 },
  { label: "Local Manual CHAPS", value: 11 },
  { label: "Local Manual BACS", value: 12 },
  { label: "Target 2", value: 13 },
  { label: "Fireblocks", value: 14 },
  { label: "Wallet", value: 15 },
  { label: "Crypto", value: 16 },
  { label: "Intercash", value: 17 },
];

const AddLimits = () => {
  const router = useRouter();

  const exchangeLimitId = router?.query?.id;
  //=========== Form Controllers =================
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<any>();

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (values: any) => {
    if (values.providerId !== 14) {
      toast.error("Only Fireblocks provider is available");
    } else {
      const requestBody = { ...values, status: values.status === "Active" };
      setLoading(true);

      try {
        const [data] = exchangeLimitId
          ? await updateExchangeLimit(requestBody)
          : await createExchangeLimit(requestBody);

        if (data?.success) {
          void router.push("/exchange/limits");
        }
      } catch (error) {
        // Handle the error, you might want to log it or show an error message
        console.error("Error occurred:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  const [assets] = useAsyncMasterStore("assets");

  const getExchangeLimit = async () => {
    const [data] = await getAllExchangeLimitById({ id: exchangeLimitId });

    if (data?.success) {
      const newData: any = data?.body;
      newData.status = newData.status ? "Active" : "Disabled";
      reset(newData);
    }
  };

  useEffect(() => {
    if (exchangeLimitId) {
      void getExchangeLimit();
    }
  }, [exchangeLimitId]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className=" flex items-center justify-between py-4">
          <div>
            <p className=" text-2xl font-bold text-[#1E293B]">Exchange</p>
          </div>
        </div>

        <HeaderLayout
          name={
            exchangeLimitId ? "Edit Exchange Limit" : "Create Exchange Limit"
          }
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
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
                  router.back();
                }}
              ></Button>
              <Button
                title="Submit"
                type="submit"
                className="btn-solid"
                onClick={handleChange}
                loading={loading}
              ></Button>
            </div>
          </form>
        </HeaderLayout>
      </div>
    </>
  );
};

export default AddLimits;
