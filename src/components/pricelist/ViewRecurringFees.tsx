import React, { useState } from "react";
import Button from "~/components/common/Button";
import HeaderLayout from "../common/HeaderLayout";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { usePriceStore } from "~/store";
import { formatDate } from "~/common/functions";

type propType = {
  onClose: () => void;
  recurringFees: RecurringFees;
  openAdd: string;
};

type RecurringFeesDetails = {
  Details: {
    key: string;
    label: string;
    value: string;
  }[];
  Amounts: {
    key: string;
    label: string;
    value: string | number;
  }[];
};
// Start ViewRecurringFees
const ViewRecurringFees = ({
  onClose,
  recurringFees,
  openAdd: openScreen,
}: propType) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [assets] = useAsyncMasterStore("assets");

  const pricelist: PriceList = usePriceStore();
  const RecurringFeesDetails: RecurringFeesDetails = {
    Details: [
      {
        key: "priceList",
        label: "Price list",
        value: pricelist.name,
      },
      {
        key: "name",
        label: "Name",
        value: recurringFees.name,
      },
      {
        key: "status",
        label: "Status",
        value: recurringFees.status ? "Active" : "Inactive",
      },
      {
        key: "operationType",
        label: "Operation type",
        value: recurringFees.OperationType?.displayName ?? "",
      },
      {
        key: "validFrom",
        label: "Valid from",
        value: formatDate(recurringFees.validFrom),
      },
      {
        key: "validTo",
        label: "Valid to",
        value: formatDate(recurringFees.validTo),
      },
    ],
    Amounts: [
      {
        key: "currencyId",
        label: "Currency",
        value: assets.find(
          (asset) => asset.fireblockAssetId === recurringFees.currencyId,
        )?.name,
      },
      {
        key: "percent",
        label: "Percent",
        value: `${recurringFees.percentage}%`,
      },
      {
        key: "fixedFee",
        label: "Fixed Fee",
        value: recurringFees.fixedFee,
      },
    ],
  };

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <HeaderLayout name="Details">
            {RecurringFeesDetails.Details.map(({ value, label }, i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{label}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
        </div>
        <div className="flex flex-col gap-4">
          <HeaderLayout name="Amounts">
            {RecurringFeesDetails.Amounts.map(({ value, label }, i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{label}</p>
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
            onClose();
          }}
          className=" btn-outlined"
        ></Button>
        {openScreen !== "view" && (
          <Button
            className=" btn-solid"
            title="Create"
            type="submit"
            onClick={handleChange}
          ></Button>
        )}
      </div>
    </>
  );
};

export default ViewRecurringFees;
