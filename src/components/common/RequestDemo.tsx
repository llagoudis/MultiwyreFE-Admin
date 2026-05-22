import { Dialog, DialogContent, TextareaAutosize } from "@mui/material";
import React, { useState, useMemo } from "react";
import InputComponent from "./InputComponent";
import SelectComponent from "./SelectComponent";
import { Controller, useForm } from "react-hook-form";
import MuiButton from "./Button";
import Image, { type StaticImageData } from "next/image";
import closeicon from "../../assets/general/dialogclose.svg";
import DailogBox from "./DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Button from "~/components/common/Button";
import { SendRequestNewMail } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type prop = {
  open: boolean;
  handleClose: () => void;
  userEmail?: string;
  companyMail?: string;
};

type formData = {
  email: string;
  select_template: string;
  message: string;
};

const RequestDemo: React.FC<prop> = ({
  open,
  handleClose,
  userEmail,
  companyMail,
}) => {
  const [openSuccess, setOpenSuccess] = useState(false);
  const initialValue =
    "Please attach a scanned copy or clear photograph of a government-issued document, such as a utility bill, rental agreement, or official letter, clearly displaying your name and current residential address. This information will be treated with utmost confidentiality and solely used for verification purposes.";

  const [emailValue, setEmailValue] = useState(initialValue);
  // dropdown
  const selectTemplate = [{ label: "Document request 1", value: "template1" }];

  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    [],
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<formData>();

  const onSubmit = (values: formData) => {
    if (values) {
      handleClose();
    }
  };

  async function SendRequestfn() {
    const requestNewData = {
      toEmail: userEmail ? userEmail : companyMail,

      mailBody: emailValue,
    };

    const [data, error] = await ApiHandler(SendRequestNewMail, requestNewData);
    if (data?.success) {
      toast.success("Mail sent Successfully");
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DailogBox
        maxWidth={"xs"}
        open={openSuccess}
        handleClose={() => {
          setOpenSuccess(false);
          handleClose();
        }}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">Email sent</h1>
          <p>Email for document request was successfully sent to {userEmail}</p>

          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={() => {
              setOpenSuccess(false);
            }}
          ></Button>
        </div>
      </DailogBox>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <div className="flex items-center justify-between">
            <p className="pageHeader">Document request</p>
            <Image
              onClick={handleClose}
              src={closeicon as StaticImageData}
              alt=""
              className="cursor-pointer"
            />
          </div>
          <div>
            <InputComponent
              control={control}
              errors={errors}
              label="Email"
              name="email"
              type="email"
              value={userEmail ? userEmail : companyMail}
              watch={watch}
            />
            <SelectComponent
              control={control}
              options={selectTemplate}
              label="Select template"
              required={true}
              name="select_template"
            />
            {/* <div className=" max-w-full">
              <p className="subText mb-1">Email body</p>
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <TextareaAutosize
                    {...field}
                    minRows={10}
                    style={{ width: "100%", resize: "none" }}
                    className="rounded border p-4"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                  />
                )}
              />
              <p className="text-sm text-red-500">{errors?.message?.message}</p>
            </div> */}

            <ReactQuill
              theme="snow"
              value={emailValue}
              onChange={setEmailValue}
            />
          </div>
        </DialogContent>

        <div className=" px-6 py-5 text-right">
          <MuiButton
            onClick={() => {
              void SendRequestfn();
            }}
            type="submit"
            className="btn-solid"
            title="Send email"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default RequestDemo;
