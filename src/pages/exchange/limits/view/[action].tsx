import React, { useMemo, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Button from "~/components/common/Button";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { clientTypeList } from "~/data/country";
import { useMasterStore } from "~/store";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { createLimitList, updateLimitList } from "~/service/api/exchangeLimits";

type checkbox = {
  label: string;
  id: string;
  onChange(value: boolean): void;
  value: boolean;
};

function Checkbox({ label, id, onChange, value = false }: checkbox) {
  return (
    <div className="flex w-fit gap-2">
      <input
        className="scale-150a accent-black"
        type="checkbox"
        id={id}
        onChange={(e) => onChange(e.target.checked)}
        checked={value}
      />
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

const Limitform = () => {
  const router = useRouter();
  const [limitList] = useAsyncMasterStore("limitList");
  console.log("limitList: ", limitList);
  const updateLimitListState = useMasterStore((state) => state.updateLimitList);

  const form = useMemo(() => {
    const id = router.query.id as string;

    if (id) {
      const foundList: Limits = limitList.find((item) => item.id == id);
      return foundList;
    }
    return undefined;
  }, [limitList, router.query.id]);

  const { action } = router.query;
  console.log("action__: ", action);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<Limits>({
    values: form,
  });

  const [successPopup, setSuccessPopup] = useState(false);

  const toggleSuccessPopup = () => {
    setSuccessPopup((prev) => !prev);
  };

  const onSubmit = async (formValues: Limits) => {
    await (
      form?.id
        ? updateLimitList(form?.id, formValues)
        : createLimitList(formValues)
    ).then(([res]) => {
      if (res?.success) {
        updateLimitListState(res.body, !!form?.id);
        toggleSuccessPopup();
      }
    });
  };

  return (
    <div>
      <DailogBox
        maxWidth={"xs"}
        open={successPopup}
        handleClose={toggleSuccessPopup}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h2 className="text-2xl font-semibold text-black">
            {`Limit list ${form?.id ? "updated" : "created"}`}
          </h2>
          <p>{`Limit list was ${
            form?.id ? "updated" : "created"
          } successfully`}</p>
          <Button
            className="btn-solid w-full text-white"
            title="Close"
            onClick={() => router.back()}
          />
        </div>
      </DailogBox>
      <div>
        <div className="flex items-center justify-between pb-8 pt-4">
          <p className=" text-2xl font-bold text-[#1E293B]">
            {form ? "Edit Limit List" : "Add Limit List"}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="my-4">
        <div className="w-full border border-[#00000030] ">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">
              {form ? "Edit Limit List" : "Add Limit list"}
            </h2>
            {/* <div className="flex gap-4">
              <Checkbox
                label="Standard"
                id="Standard"
                onChange={onStandardChange}
                value={isStandard}
              />
              <Checkbox
                label="External fee enabled"
                id="ExternalFeeEnabled"
                onChange={onExternalFeeChange}
                value={externalFeeEnabled}
              />
            </div> */}
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              <InputComponent
                control={control}
                label="Name"
                name="name"
                rules={{ required: "Name is required" }}
                type="text"
              />
              <SelectComponent
                control={control}
                required={true}
                options={clientTypeList}
                label="Client type"
                name="clientType"
                rules={{ required: "Client type is required" }}
              />

              <InputComponent
                control={control}
                label="Company type"
                name="companyType"
                rules={{ required: "Company type is required" }}
                type="text"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <Button
            title="Back"
            className="btn-outlined"
            onClick={() => {
              router.back();
            }}
          />
          <Button
            title="Save changes"
            type="submit"
            className="btn-solid"
            loading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
};

export default Limitform;
