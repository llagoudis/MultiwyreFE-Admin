import React, { useState } from "react";
import InputComponent from "~/components/common/InputComponent";
import { Controller, useForm } from "react-hook-form";
import HeaderLayout from "~/components/common/HeaderLayout";
import SelectComponent from "~/components/common/SelectComponent";
import Button from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";
import { BsPlus } from "react-icons/bs";
import MuiButton from "~/components/common/Button";
import Header from "~/components/common/Header";
import { documentType } from "~/data/country";

type formType = {
  document_type: string;
  file: any;
};

type propType = {
  onClose: () => void;
};

const AddCounterParties = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<formType>();

  const onSubmit = () => {
    // console.log();
  };

  // opening dailog box
  const [open, setOpen] = useState(false);

  const handleChange = () => {
    setOpen(!open);
  };

  return (
    <>
      <DailogBox maxWidth={"xs"} open={open} handleClose={handleChange}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            New legal document was created
          </h1>
          <p>New legal document with name XYZ was created successfully</p>
          <MuiButton className="btn-solid w-full" title="Close"></MuiButton>
        </div>
      </DailogBox>

      <form className="flex flex-col gap-3 my-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="py-4">
          <Header head={"Add new Counter parties"} />
        </div>
        <div className="border-slte-200 flex flex-col gap-3 border">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">Document</h2>
            <Controller
              name="file"
              control={control}
              render={({ field }) => (
                <>
                  <Button
                    onClick={() => {
                      document.getElementById("fileInput")?.click();
                    }}
                    className="btn-solid"
                    title="Upload file"
                  >
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(e.target.files?.[0] ?? null);
                      }}
                      accept="image/*"
                    ></input>
                    <BsPlus size={20} />
                  </Button>
                </>
              )}
            />
          </div>

          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              <SelectComponent
                control={control}
                options={documentType}
                label="Document Type*"
                name="type"
                rules={{ required: "Document type is required" }}
              />
              <InputComponent
                control={control}
                errors={errors}
                label="Description"
                name="description"
                type="text"
              />
              <InputComponent
                control={control}
                errors={errors}
                label="Added date"
                name="added_date"
                type="date"
              />
              <InputComponent
                control={control}
                errors={errors}
                label="Counterparty Name*"
                name="description"
                type="text"
              />
              <SelectComponent
                control={control}
                options={documentType}
                label="Industry*"
                name="type"
                rules={{ required: "Document type is required" }}
              />
            </div>
          </div>
        </div>

        <HeaderLayout name="Uploaded file"></HeaderLayout>

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <MuiButton
            title="Back"
            onClick={() => {
              props.onClose();
            }}
            className="btn-outlined"
          ></MuiButton>
          <MuiButton
            title="Create document"
            type="submit"
            className="btn-solid"
            onClick={handleChange}
          ></MuiButton>
        </div>
      </form>
    </>
  );
};

export default AddCounterParties;
