import Button from "~/components/common/Button";
import Image, { type StaticImageData } from "next/image";
import AddPluse from "~/assets/general/Add_Plus.svg";
import React from "react";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import { useForm } from "react-hook-form";
import SelectComponent from "~/components/common/SelectComponent";
import { Box } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { BsPlus } from "react-icons/bs";
import MuiButton from "~/components/common/Button";
import { useRouter } from "next/router";

type companyProp = {
  Details: {
    Client: string;
    Holder: string;
    Number: number;
    Name: string;
    Type: string;
    Primary: string;
    Status: string;
    "Status changed by": string;
    "Created at": string;
    "Activated by": string;
    "Fee activated at": string;
    "Settlement at": string;
    "Automatic fee acgtivation": string;
    Dormant: string;
    "Country code": string;
  };

  Provider: {
    "Provider name": string;
    "Provider currency": string;
    "Provider external ID": string;
    "Provider number": string;
    "Provider currencies": string;
  };
};

const AccountDetails: companyProp = {
  Details: {
    Client: "Name",
    Holder: "Amar",
    Number: 78235182753,
    Name: "Primary account",
    Type: "Standard",
    Primary: "yes",
    Status: "New",
    "Status changed by": "",
    "Created at": "23.087.2023 07:38:00 PM",
    "Activated by": "",
    "Fee activated at": "",
    "Settlement at": "",
    "Automatic fee acgtivation": "Disabled",
    Dormant: "No",
    "Country code": "",
  },

  Provider: {
    "Provider name": "None",
    "Provider currency": "EUR",
    "Provider external ID": "",
    "Provider number": "",
    "Provider currencies": "EUR",
  },
};

// Input field

type formData = {
  from: string;
  to: string;
  format: string;
};
const formatTypes = [
  { label: "PDF", value: "option1" },
  { label: "Option 2", value: "option2" },
];

type dataType = {
  id: string;
  BusinessType?: string;
  accountNumber?: string;
  bic?: string;
  currency?: string;
  current?: string;
  ceserved?: string;
  available?: string;
  amount?: string;
  description?: string;
  details?: string;
  type?: string;
  status?: string;
  date?: string;
};

const AccDetails = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<formData>();

  const onSubmit = (values: formData) => {
    if (values) {
      console.log(values);
    }
  };

  // Table data
  const rows: dataType[] = [
    {
      id: "",
      BusinessType: "",
      bic: "",
      accountNumber: "",
      currency: "",
    },
  ];
  const row2: dataType[] = [
    {
      id: "",
      currency: "",
      current: "",
      ceserved: "",
      available: "",
    },
  ];
  const row3: dataType[] = [
    {
      id: "12312313",
      amount: "12313",
      description: "Test",
      details: "Details",
      type: "Something",
      status: "Activated",
      date: "27.08.2023",
    },
    {
      id: "12312313",
      amount: "12313",
      description: "Test",
      details: "Details",
      type: "Something",
      status: "Activated",
      date: "27.08.2023",
    },
  ];
  const columns = [
    {
      flex: 1,
      minWidth: 180,
      field: "BusinessType",
      headerName: "Business Type",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "accountNumber",
      headerName: "Account Number",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "bic",
      headerName: "BIC",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "currency",
      headerName: "Currency",
    },
  ];
  const column2 = [
    {
      flex: 1,
      minWidth: 180,
      field: "currency",
      headerName: "Currency",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "current",
      headerName: "Current",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "ceserved",
      headerName: "Ceserved",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "available",
      headerName: "Available",
    },
  ];
  const column3 = [
    {
      flex: 1,
      minWidth: 180,
      field: "amount",
      headerName: "Amount",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "description",
      headerName: "Description",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "details",
      headerName: "Details",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "type",
      headerName: "Type",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "status",
      headerName: "Status",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "date",
      headerName: "Date",
    },
  ];

  const router = useRouter();

  // page Navigation
  const onNavigation = (path: string) => {
    void router.push(path);
  };

  return (
    <div className="">
      <div className=" flex items-center justify-between pb-4 ">
        <div>
          <p className=" text-2xl font-bold text-[#1E293B]">View Company</p>
        </div>
        <div className=" flex items-center gap-4">
          <p className="text-[#64748B]">Edit</p>

          <MuiButton
            onClick={() => {
              onNavigation("/banking/companies/addAccount");
            }}
            title="Add new"
            className="btn-solid"
          >
            <Image src={AddPluse as StaticImageData} alt="Add new button" />
          </MuiButton>
        </div>
      </div>
      <div className=" grid grid-cols-2 gap-4">
        <div>
          {/* column 1 */}
          <div className="flex flex-col gap-4">
            {/* Details */}
            <HeaderLayout name="Details">
              {Object.entries(AccountDetails.Details).map(([key, value], i) => (
                <div key={i} className=" grid grid-cols-2 ">
                  <p className=" py-2">{key}</p>
                  <p className=" py-2">{value}</p>
                </div>
              ))}
            </HeaderLayout>
          </div>
        </div>
        {/* column 2 */}
        <div className="flex flex-col gap-4">
          {/* Accounts */}
          <HeaderLayout name="Statement">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Form*"
                  name="form"
                  rules={{ required: "From date is required" }}
                  type="date"
                  watch={watch}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="To*"
                  name="to"
                  rules={{ required: "To date is required" }}
                  type="date"
                  watch={watch}
                />
                <SelectComponent
                  control={control}
                  options={formatTypes}
                  label="Format*"
                  name="business_type"
                  rules={{ required: "Business type is required" }}
                />
                <Button title="Download" type="submit" />
              </div>
            </form>
          </HeaderLayout>
          {/* Settings */}
          <HeaderLayout name="Provider">
            {Object.entries(AccountDetails.Provider).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
        </div>
      </div>
      {/* column 3 */}
      <div className="mt-4">
        <div className="w-full border border-[#00000030] ">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">Document</h2>
            <MuiButton className="btn-solid" title="Add New">
              <BsPlus size={20} />
            </MuiButton>
          </div>
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              hideFooterPagination={true}
              storageName={"company_document"}
              rows={rows}
              columns={columns}
            />
          </Box>
        </div>
      </div>
      {/* column 4 */}
      <div className="mt-4">
        <div className="w-full border border-[#00000030] ">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">Balances</h2>
          </div>
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              hideFooterPagination={true}
              storageName={"company_balances2"}
              rows={row2}
              columns={column2}
            />
          </Box>
        </div>
      </div>
      {/* column 5 */}
      <div className="mt-4">
        <div className="w-full border border-[#00000030] ">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">Balances</h2>
          </div>
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              storageName={"company_balances1"}
              hideFooterPagination={true}
              rows={row3}
              columns={column3}
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default AccDetails;
