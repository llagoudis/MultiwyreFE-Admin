import React, { useState } from "react";
import Button from "~/components/common/Button";
import HeaderLayout from "../common/HeaderLayout";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { useLimitStore, usePriceStore } from "~/store";
import { formatDate } from "~/common/functions";

type propType = {
  onClose: () => void;
  exchangeLimits?: ExchangeLimits;
  openAdd: string;
};

type TransferFeesDetails = {
  Details: {
    key: string;
    label: string;
    value?: string;
  }[];
  Amounts: {
    key: string;
    label: string;
    value?: string | number;
  }[];
};
// Start ViewExchangeLimits
const ViewExchangeLimits = ({
  onClose,
  exchangeLimits,
  openAdd: openScreen,
}: propType) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [assets] = useAsyncMasterStore("assets");

  const limitList: Limits = useLimitStore();
  const TransferFeesDetails: TransferFeesDetails = {
    Details: [
      {
        key: "limitList",
        label: "Limit Name",
        value: limitList.name,
      },

      {
        key: "status",
        label: "Status",
        value: exchangeLimits?.status ? "Active" : "Inactive",
      },

      {
        key: "exchangeType",
        label: "Exchange Type",
        value: exchangeLimits?.exchangeType,
      },
    ],
    Amounts: [
      {
        key: "amount",
        label: "Amount ",
        value: exchangeLimits?.amount,
      },
      {
        key: "currencyId",
        label: "Currency",
        value: assets.find(
          (asset) => asset.fireblockAssetId === exchangeLimits?.currencyId,
        )?.name,
      },

      {
        key: "exchangeLimit",
        label: "Exchange Limit",
        value: exchangeLimits?.exchangeLimit,
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
      <div className="mb-4 mt-8 flex w-full justify-end gap-4 px-3 ">
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

export default ViewExchangeLimits;
