import React, { useEffect } from "react";
import DailogBox from "../common/DailogBox";
import SelectComponent from "../common/SelectComponent";
import { useForm } from "react-hook-form";
import InputComponent from "../common/InputComponent";
import MuiButton from "../common/Button";
import { useState } from "react";
import { createThreshold, updateThreshold } from "~/service/api/limits";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";

type propType = {
  open: boolean;
  handleChange: () => void;
  thresholdData: any;
  allThresholdData: any;
};

type formData = {
  limitsId: string;
  thresholdType: string;
  transferDirection: string;
  amount: string;
  currency: string;
  period: string;
  periodCount: string;
  affectsSingleTransaction: boolean;
};

const AddThreshold = ({
  open,
  handleChange,
  thresholdData,
  allThresholdData,
}: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<formData>();

  const router = useRouter();
  const id = router.query.id as any;
  const [first, setfirst] = useState();
  const [assets] = useAsyncMasterStore("assets");
  const [actionTypes] = useAsyncMasterStore("actionTypes");
  const [periodTypes] = useAsyncMasterStore("periodTypes");
  const [thresholdTypes] = useAsyncMasterStore("thresholdTypes");
  const [transferDirection] = useAsyncMasterStore("transferDirection");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setfirst(id);
  }, [id]);

  useEffect(() => {
    if (!thresholdData) {
      reset();
    } else {
      reset(thresholdData);
    }
  }, [thresholdData, reset]);

  const thresholdType = watch("thresholdType");
  console.log("thresholdType", thresholdType);

  if (thresholdType === "FXTransactionAmount") {
    console.log("Entred FXTransactionAmount if statement");
  }

  // const validateCurrencySelection = (currency: any) => {
  //   if (!thresholdType) return true;
  //   const isDuplicate = allThresholdData.some(
  //     (threshold: any) =>
  //       threshold.thresholdType === thresholdType &&
  //       threshold.currency === currency,
  //   );
  //   return isDuplicate
  //     ? "Currency already used with this threshold type"
  //     : true;
  // };

  const onSubmit = async (formValues: formData) => {
    setLoading(true);
    try {
      if (thresholdData) {
        await updateThreshold(formValues);
        toast.success("Threshold updated successfully");
        setLoading(false);
        reset();
        void router.push("../limits");
      } else {
        await createThreshold({ ...formValues, limitsId: first });
        toast.success("Threshold saved successfully");
        setLoading(false);
        reset();
        // handleChange();
        void router.push("../limits");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error saving Threshold");
      console.error("Error saving Threshold:", error);
    }
  };

  return (
    <DailogBox open={open} handleClose={handleChange} maxWidth="lg">
      <div className="mx-auto max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <p className=" mb-4 text-2xl font-bold text-[#1E293B] ">
              Add Threshold
            </p>
          </div>
          <div className=" grid grid-cols-2 gap-3">
            <SelectComponent
              control={control}
              options={thresholdTypes}
              valueKey="name"
              labelKey="displayName"
              label="Threshold type"
              required={true}
              name="thresholdType"
              rules={{ required: "Threshold type is required" }}
            />

            {thresholdType !== "FXTransactionAmount" && (
              <SelectComponent
                control={control}
                options={transferDirection}
                valueKey="id"
                labelKey="displayName"
                label="Transfer direction"
                required={true}
                name="transferDirection"
                rules={{ required: "Transfer direction is required" }}
              />
            )}

            <InputComponent
              control={control}
              errors={errors}
              label="Amount"
              required={true}
              name="amount"
              rules={{ required: "Amount is required" }}
              type="text"
            />

            <SelectComponent
              control={control}
              options={assets}
              required={true}
              valueKey="fireblockAssetId"
              labelKey="name"
              label="Currency"
              name="currency"
              rules={{
                required: "Currency is required",
                // validate: validateCurrencySelection,
              }}
            />

            <SelectComponent
              control={control}
              options={periodTypes}
              required={true}
              valueKey="name"
              labelKey="displayName"
              label="Period"
              name="period"
              rules={{ required: "Period is required" }}
            />

            <InputComponent
              control={control}
              errors={errors}
              label="Period count"
              required={true}
              name="periodCount"
              rules={{ required: "Period count is required" }}
              type="text"
            />
          </div>

          <div className="m-auto flex w-full max-w-4xl flex-col">
            <SelectComponent
              control={control}
              options={actionTypes}
              required={true}
              valueKey="name"
              labelKey="displayName"
              label="Action type"
              name="actionTypes"
              rules={{ required: "Action type is required" }}
            />

            {/* <div>
              <label>
                <input type="checkbox" name="affectsSingleTransaction" />
                &nbsp; Affects only a single transaction
              </label>
            </div> */}

            <div className="flex w-full justify-end gap-4">
              <MuiButton
                title={
                  thresholdData ? "Update Threashold" : "Create Threashold"
                }
                type="submit"
                className="btn-solid"
                loading={loading}
              ></MuiButton>
            </div>
          </div>
        </form>
      </div>
    </DailogBox>
  );
};

export default AddThreshold;
