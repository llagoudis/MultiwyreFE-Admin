import React, { useState } from "react";
import Button from "~/components/common/Button";
import HeaderLayout from "../common/HeaderLayout";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { usePriceStore } from "~/store";
import { formatDate } from "~/common/functions";

type propType = {
  onClose: () => void;
  transferFees: TransferFees;
  openAdd: string;
};

type TransferFeesDetails = {
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
// Start ViewTransferFee
const ViewTransferFee = ({
  onClose,
  transferFees,
  openAdd: openScreen,
}: propType) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [assets] = useAsyncMasterStore("assets");

  const pricelist: PriceList = usePriceStore();
  const TransferFeesDetails: TransferFeesDetails = {
    Details: [
      {
        key: "priceList",
        label: "Price list",
        value: pricelist.name,
      },
      {
        key: "name",
        label: "Name",
        value: transferFees.name,
      },
      {
        key: "status",
        label: "Status",
        value: transferFees.status ? "Active" : "Inactive",
      },
      {
        key: "operationType",
        label: "Operation type",
        value: transferFees.OperationType?.displayName ?? "",
      },
      {
        key: "validFrom",
        label: "Valid from",
        value: formatDate(transferFees.validFrom),
      },
      {
        key: "validTo",
        label: "Valid to",
        value: formatDate(transferFees.validTo),
      },
    ],
    Amounts: [
      {
        key: "currencyId",
        label: "Currency",
        value: assets.find(
          (asset) => asset.fireblockAssetId === transferFees.currencyId,
        )?.name,
      },
      {
        key: "percent",
        label: "Percent",
        value: `${transferFees.percent}%`,
      },
      {
        key: "fixedFee",
        label: "Fixed Fee",
        value: transferFees.fixedFee,
      },
      // {
      //   key: "minimumFee",
      //   label: "Minimum Fee",
      //   value: transferFees.minimumFee,
      // },
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
            {TransferFeesDetails.Details.map(({ value, label }, i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{label}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
        </div>
        <div className="flex flex-col gap-4">
          <HeaderLayout name="Amounts">
            {TransferFeesDetails.Amounts.map(({ value, label }, i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{label}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
        </div>
      </div>
      <div className="mt-8 flex w-full justify-end gap-4 px-3 mb-4 ">
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

export default ViewTransferFee;
