import React, { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import HeaderLayout from "~/components/common/HeaderLayout";
import SelectComponent from "~/components/common/SelectComponent";
import Button from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";
import MuiButton from "~/components/common/Button";

type companyStaff = {
  company: string;
  person: string;
  permissions: string;
};

type propType = {
  onClose: (value?: string) => void;
  from: string;
};

const permissions = [
  { label: "Admin", value: "ex_user,ex_admin" },
  { label: "Viewer", value: "ex_user,ex_viewer" },
];

const AddStaff = (props: propType) => {
  // opening dailog box
  const [open, setOpen] = useState(false);

  const { handleSubmit, control } = useForm<companyStaff>();

  const onSubmit = () => {
    // console.log();
  };

  const companyList = [
    { label: "Company 1", value: "1" },
    { label: "Company 2", value: "2" },
    { label: "Company 3", value: "3" },
  ];

  const personList = [
    { label: "Person 1", value: "1" },
    { label: "Person 2", value: "2" },
    { label: "Person 3", value: "3" },
  ];

  const handleChange = () => {
    setOpen(!open);
  };

  return (
    <Fragment>
      <DailogBox maxWidth={"xs"} open={open} handleClose={handleChange}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            Staff created successfully
          </h1>
          <p>Company staff with the name “XYZ” has been created successfully</p>
          <Button className="w-full text-white" title="Close"></Button>
        </div>
      </DailogBox>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 my-4">
        <HeaderLayout
          name={` ${
            props?.from === "create"
              ? "Create a new Company Staff"
              : "Edit a new Company Staff"
          } `}
          enabled={"Enabled"}
        >
          <div className="flex justify-between gap-5">
            <SelectComponent
              control={control}
              options={companyList}
              label="Company"
              required={true}
              name="company"
              rules={{ required: "Company is required" }}
            />

            <SelectComponent
              control={control}
              label="Person"
              name="person"
              options={personList}
              rules={{ required: "Person is required" }}
            />

            <SelectComponent
              control={control}
              options={permissions}
              label="Permissions"
              name="permissions"
              rules={{ required: "Permission is required" }}
            />
          </div>
        </HeaderLayout>

        <div className="flex w-full justify-end gap-4 px-3">
          <MuiButton
            title="Back"
            onClick={() => {
              props.onClose();
            }}
            className=" btn-outlined"
          ></MuiButton>
          <MuiButton
            title="Create Staff"
            type="submit"
            className="btn-solid"
            onClick={handleChange}
          ></MuiButton>
        </div>
      </form>
    </Fragment>
  );
};

export default AddStaff;
