import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";

import { businessTypes, clientTypeList, statuslist } from "~/data/country";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import {
  createLimits,
  updateLimits,
  getLimitsById,
} from "~/service/api/limits";

const AddLimits = () => {
  const router = useRouter();
  const [verificationLevel] = useAsyncMasterStore("verificationLevel");
  const [formData, setFormData] = useState<Limits | null>();
  const [loading, setLoading] = useState(false);

  const id = router.query.id as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getLimitsById(id);
        setFormData(data[0]?.body);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        // Handle error
        console.error("Error fetching data:", error);
      }
    };

    if (id) {
      void fetchData();
    }
  }, [id]);

  const defaultValues = formData ? formData : undefined;

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<Limits>({ defaultValues });

  useEffect(() => {
    if (formData) {
      const {
        clientVerificationLevel,
        clientType,
        personType,
        name,
        description,
        status,
      } = formData;
      reset({
        clientVerificationLevel: clientVerificationLevel,
        clientType: clientType,
        personType: personType,
        name: name,
        description: description,
        status: status,
      });
    }
  }, [formData, reset]);

  const onSubmit = async (formValues: Limits) => {
    try {
      await (id ? updateLimits(id, formValues) : createLimits(formValues));
      toast.success("Limits saved successfully");
      void router.push("../limits");
    } catch (error) {
      toast.error("Error saving limits");
      console.error("Error saving limits:", error);
    }
  };
  const handleBack = () => {
    void router.push("../limits");
  };
  return (
    <>
      <div>
        <div className=" flex items-center justify-between py-4">
          <div>
            <p className=" text-2xl font-bold text-[#1E293B]">Limits</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <HeaderLayout name={id ? "Update Limit" : "Create Limit"}>
            <div className="grid grid-cols-3 gap-3">
              <SelectComponent
                control={control}
                options={verificationLevel}
                valueKey="id"
                labelKey="displayName"
                label="Client verification level"
                required={true}
                name="clientVerificationLevel"
                rules={{ required: "Client verification level is required" }}
              />

              <SelectComponent
                control={control}
                options={clientTypeList}
                required={true}
                label="Client type"
                name="clientType"
                rules={{ required: "Client type is required" }}
              />

              <SelectComponent
                control={control}
                options={businessTypes}
                label="Person type"
                name="personType"
                required={true}
                rules={{ required: "Person type is required" }}
              />

              <InputComponent
                control={control}
                errors={errors}
                label="Name"
                required={true}
                name="name"
                rules={{ required: "Name is required" }}
                watch={watch}
                type="text"
              />

              <InputComponent
                control={control}
                errors={errors}
                label="Description"
                required={true}
                name="description"
                rules={{ required: "Description is required" }}
                watch={watch}
                type="text"
              />

              <SelectComponent
                control={control}
                options={statuslist}
                label="Status"
                name="status"
                rules={{ required: "Status is required" }}
              />
            </div>
          </HeaderLayout>

          <div className="flex w-full justify-end gap-4 px-3">
            <Button
              title="Back"
              type="button"
              className="btn-solid"
              onClick={handleBack}
            ></Button>
            <Button
              title={id ? "Update Limit" : "Create Limit"}
              type="submit"
              className="btn-solid"
              loading={isSubmitting}
              // onClick={handleChange}
            ></Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddLimits;
