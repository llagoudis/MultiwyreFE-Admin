import React, { useState } from "react";
import InputComponent from "~/components/common/InputComponent";
import { Controller, useForm } from "react-hook-form";
import HeaderLayout from "~/components/common/HeaderLayout";
import Button from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";
import { InputAdornment, TextField, TextareaAutosize } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Header from "~/components/common/Header";

type companyStaff = {
  text: string;
  email: string;
  administrators: string;
};

type propType = {
  onClose: () => void;
};

const AddNotes = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<companyStaff>();

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
          <div>
            <h2 className="mb-1 text-2xl font-semibold text-black">
              Notes creation successfull
            </h2>
            <p>New notes files was created successfully</p>
          </div>
          <Button className="btn-solid w-full" title="Close"></Button>
        </div>
      </DailogBox>
      <Header head={"Add new notes"} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="my-4 flex flex-col gap-3"
      >
        <HeaderLayout name={"Please add the information below"}>
          <div className=" max-w-full">
            <label htmlFor={"text"} className="mb-1 block text-[#1F1F1F]">
              Text
            </label>

            <Controller
              name={"text"}
              control={control}
              rules={{ required: "Text is required" }}
              render={({ field }) => (
                <div>
                  <TextareaAutosize
                    className="rounded border"
                    minRows={10}
                    style={{ width: "100%", resize: "none" }}
                    {...field}
                  />
                  <p className="text-sm text-red-500">{errors.text?.message}</p>
                </div>
              )}
            />
          </div>

          <div className="flex justify-between gap-5">
            <div className="mt-3 w-full">
              <label htmlFor={"email"} className="mb-1 block text-[#1F1F1F]">
                Email
              </label>
              <Controller
                name={"email"}
                control={control}
                rules={{ required: "Email is required" }}
                render={({ field }) => (
                  <div>
                    <TextField
                      size="small"
                      className="rounded border"
                      minRows={10}
                      style={{ width: "100%", resize: "none" }}
                      {...field}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <AddCircleIcon className="cursor-pointer text-black" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <p className="text-sm text-red-500">
                      {errors.email?.message}
                    </p>
                  </div>
                )}
              />
            </div>

            <InputComponent
              control={control}
              errors={errors}
              label="Notify Administrators"
              name="person"
              rules={{ required: "Notify Administrators is required" }}
              type="text"
              watch={watch}
            />
          </div>
        </HeaderLayout>

        <div className="flex w-full justify-end gap-4 px-3">
          <Button
            title="Back"
            onClick={() => {
              props.onClose();
            }}
            className="btn-outlined"
          ></Button>
          <Button
            title="Create"
            type="submit"
            className="btn-solid"
            onClick={handleChange}
          ></Button>
        </div>
      </form>
    </>
  );
};

export default AddNotes;
