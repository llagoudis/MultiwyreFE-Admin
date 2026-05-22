import { Snackbar, TextareaAutosize } from "@mui/material";
import Button from "~/components/common/Button";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Header from "~/components/common/Header";
import InputComponent from "~/components/common/InputComponent";
import Copy from "~/assets/general/copyicon.svg";
import Image, { type StaticImageData } from "next/image";
import MuiButton from "~/components/common/Button";
import checkicon from "~/assets/general/check-one.svg";

import DailogBox from "~/components/common/DailogBox";
import SelectComponent from "~/components/common/SelectComponent";
type propType = {
  onClose: () => void;
  from: string;
};
type formData = {
  email: string;
  select_template: string;
  message: string;
};
const notificationTrigger = [
  { label: "OTC Trade", value: "1" },
  { label: "Password reset", value: "2" },
];
const AddTemplate = (props: propType) => {
  const [open, setOpen] = useState(false);

  const handleClick = (value: string) => {
    setOpen(true);
    navigator.clipboard
      .writeText(value)
      .then(() => {
        // Clipboard operation succeeded
      })
      .catch((error) => {
        // Handle the error
        console.error("Clipboard operation failed:", error);
      });
  };

  const {
    control,
    formState: { errors },
    watch,
  } = useForm<formData>();

  const staticVariables = [
    {
      type: "##FNAME##",
    },
    {
      type: "##LNAME##",
    },
    {
      type: "##DATE##",
    },
    {
      type: "##VAR1##",
    },
    {
      type: "##VAR2##",
    },
  ];

  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="mt-4">
      <DailogBox
        maxWidth={"xs"}
        open={openDialog}
        handleClose={() => {
          setOpenDialog(false);
        }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h2 className="subText">
            {props?.from === "create"
              ? "Template created successfully"
              : "Template updated successfully"}
          </h2>
          <p>
            {" "}
            {props?.from === "create"
              ? "New template was created successfully"
              : "Template contents updated successfully"}
          </p>
          <Button
            className="btn-solid w-full text-white"
            title="Close"
            onClick={() => {
              setOpenDialog(false);
            }}
          ></Button>
        </div>
      </DailogBox>

      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setOpen(false)}
        autoHideDuration={1000}
        message="Copied to clipboard"
      />
      <Header
        head={
          props?.from === "create" ? "Add new template" : "Edit new template"
        }
      />
      <div className="flex justify-between ">
        <div className=" w-[60%]">
          <InputComponent
            control={control}
            errors={errors}
            label="Notification name"
            name="notification_name"
            placeholder="Subject"
            type="text"
            watch={watch}
          />

          <div className=" max-w-full">
            <Controller
              rules={{ required: "Email message is required" }}
              name="message"
              control={control}
              render={({ field }) => (
                <TextareaAutosize
                  {...field}
                  minRows={13}
                  style={{ width: "100%", resize: "none" }}
                  className="rounded border border-[#c4c4c4] p-2"
                  placeholder="Type ypur message here"
                />
              )}
            />
            <p className="text-sm text-red-500">{errors?.message?.message}</p>
          </div>

          <SelectComponent
            control={control}
            options={notificationTrigger}
            required={true}
            label="Notification trigger"
            name="notification_trigger"
            rules={{ required: "Notification trigger list is required" }}
          />
        </div>
        <div className=" w-[30%] bg-white p-4 shadow-md">
          <p className=" mb-6 text-lg font-bold">Static variables</p>
          <div className=" flex w-full flex-col gap-4">
            {staticVariables.map((item, i) => {
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (item.type) {
                      handleClick(item.type);
                    }
                  }}
                  className="flex cursor-pointer justify-between rounded border border-[#C2C2C2DB] p-4"
                >
                  <p className=" text-center text-sm font-semibold text-[#C3922E]">
                    {item.type}
                  </p>
                  <Image
                    onClick={() => {
                      if (item.type) {
                        handleClick(item.type);
                      }
                    }}
                    className=" cursor-pointer"
                    src={Copy as StaticImageData}
                    alt=""
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-2">
        <Button
          title="Cancel"
          onClick={() => {
            props.onClose();
          }}
          className="btn-outlined"
        ></Button>
        <MuiButton
          onClick={() => {
            setOpenDialog(true);
          }}
          title={props?.from === "create" ? "Create template" : "Save template"}
          className=" btn-solid"
        />
      </div>
    </div>
  );
};

export default AddTemplate;
