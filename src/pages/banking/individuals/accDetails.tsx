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
import Link from "next/link";
import MuiButton from "~/components/common/Button";

type companyProp = {
  Details: {
    ID: number;
    Client: string;
    Holder: string;
    Number: string;
    Name: string;
    Type: string;
    Primary: boolean;
    Status: number;
    StatusChangedBy: string;
    CreatedAt: string;
    ActivatedBy: string;
    FeeActivatedAt: string;
    SettlementAt: string;
    StateReason: string;
    AutomaticFeeAcgtivation: string;
    Dormant: boolean;
    CountryCode: string;
  };

  Provider: {
    ProviderName: string;
    ProviderCurrency: string;
    ProviderExternalID: string;
    ProviderNumber: string;
    ProviderCurrencies: string;
  };
};

const AccountDetails: companyProp = {
  Details: {
    ID: 121212121,
    Client: "78235182753",
    Holder: "Amar",
    Number: "sdsdsdsd",
    Name: "Hegde",
    Type: "12.07.2023",
    Primary: true,
    Status: 1234,
    StatusChangedBy: "Not Verified",
    CreatedAt: "Not Identification",
    ActivatedBy: "Other services",
    FeeActivatedAt: "Others",
    SettlementAt: "Shareholder",
    StateReason: " ",
    AutomaticFeeAcgtivation: "12.07.2023 12:00:00pm UTC",
    Dormant: false,
    CountryCode: "12.07.2023 12:00:00pm UTC",
  },

  Provider: {
    ProviderName: "None",
    ProviderCurrency: "EUR",
    ProviderExternalID: "",
    ProviderNumber: "",
    ProviderCurrencies: "EUR",
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
  //===============
  return (
    <div className="">
      <div className=" flex items-center justify-between py-4">
        <div>
          <p className=" text-2xl font-bold text-[#1E293B]">View Company</p>
        </div>
        <div className=" flex items-center gap-4">
          <p className="text-[#64748B]">Edit</p>

          <Link href={"/banking/companies/addAccount"}>
            <Button className="btn-solid" title="Add new">
              <Image src={AddPluse as StaticImageData} alt="Add new button" />
            </Button>
          </Link>
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
                <MuiButton
                  title="Download"
                  className="btn-outlined"
                  type="submit"
                />
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
            <h2 className="subText">Document</h2>
            <Button className="btn-solid" title="Add New">
              <BsPlus size={20} />
            </Button>
          </div>
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              storageName="individuals_document"
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
            <h2 className="subText">Balances</h2>
          </div>
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              storageName={"individuals_balances1"}
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
            <h2 className="subText">Balances</h2>
          </div>
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              rows={row3}
              storageName={"individuals_balances2"}
              columns={column3}
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default AccDetails;
