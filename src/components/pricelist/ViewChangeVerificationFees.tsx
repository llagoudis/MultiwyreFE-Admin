import React from "react";
import Button from "~/components/common/Button";
import HeaderLayout from "../common/HeaderLayout";

type propType = {
  onClose: () => void;
};

type companyProp = {
  Details: {
    "Price list": string;
    Name: string;
    "Operation type": string;
    "Verification level": string;
    "Valid from": string;
    "Valid to": string;
  };
  Amounts: {
    Currency: string;
    "Fixed fee": number;
  };
};

const CompanyDetails: companyProp = {
  Details: {
    "Price list": "External crypto company",
    Name: "External crypto company",
    "Operation type": "Outgoing transfer ",
    "Verification level": "",
    "Valid from": "12.March.2023",
    "Valid to": "12.March.2023",
  },
  Amounts: {
    Currency: "USTD",
    "Fixed fee": 10,
  },
};
// Start  ViewChangeVerificationFees
const ViewChangeVerificationFees = (props: propType) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <HeaderLayout name="Details">
            {Object.entries(CompanyDetails.Details).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
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
      </div>
    </>
  );
};

export default ViewChangeVerificationFees;
