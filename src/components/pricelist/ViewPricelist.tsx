import React, { useEffect, useState } from "react";
import Button from "~/components/common/Button";
import HeaderLayout from "../common/HeaderLayout";

type propType = {
  onClose: () => void;
};

type companyProp = {
  Details: {
    "Price list": string;
    Name: string;
    Status: string;
    "Operation type": string;
    "Beneficiary type": string;
    "Beneficiary bank country group": string;
    "Account provider": string;
    "Payment method": string;
    "Transfer provider": string;
    "Valid from": string;
    "Valid to": string;
  };
  Amounts: {
    Currency: string;
    Percent: number;
    "Fixed fee": number;
    "Minimum fee": number;
    "Maximum fee": number;
  };
};

const CompanyDetails: companyProp = {
  Details: {
    "Price list": "External crypto company",
    Name: "External crypto company",
    Status: "Active",
    "Operation type": "Outgoing transfer ",
    "Beneficiary type": "",
    "Beneficiary bank country group": "-",
    "Account provider": "-",
    "Payment method": "Any payment method",
    "Transfer provider": "-",
    "Valid from": "-",
    "Valid to": "-",
  },
  Amounts: {
    Currency: "USTD",
    Percent: 2,
    "Fixed fee": 10,
    "Minimum fee": 0,
    "Maximum fee": 0,
  },
};
// Start ViewPricelist
const ViewPricelist = (props: propType) => {
  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          {/* <HeaderLayout name="Details">
            {Object.entries(CompanyDetails.Details).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout> */}
        </div>
        <div className="flex flex-col gap-4">
          <HeaderLayout name="Amounts">
            {Object.entries(CompanyDetails.Amounts).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
        </div>
      </div>
      <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
        <Button
          title="Back"
          onClick={() => {
            props.onClose();
          }}
          className=" btn-outlined"
        ></Button>
        <Button
          className=" btn-solid"
          title="Create"
          type="submit"
          onClick={handleChange}
        ></Button>
      </div>
    </>
  );
};

export default ViewPricelist;
