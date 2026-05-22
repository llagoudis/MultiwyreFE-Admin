import React from "react";
import Button from "~/components/common/Button";
import HeaderLayout from "../common/HeaderLayout";
import { usePriceStore } from "~/store";
import { formatDate } from "~/common/functions";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";

type propType = {
  onClose: () => void;
  fxMarkupDetails: FXMarkup;
};

type companyProp = {
  Details: {
    key: string;
    label: string;
    value: string;
  }[];
  Amounts: {
    key: string;
    label: string;
    value: string;
  }[];
};

const ViewAddFxMarkupFees: React.FC<propType> = ({
  onClose,
  fxMarkupDetails,
}) => {
  const [assets] = useAsyncMasterStore("assets");

  const pricelist: PriceList = usePriceStore();

  const CompanyDetails: companyProp = {
    Details: [
      {
        key: "priceList",
        label: "Price list",
        value: pricelist.name,
      },
      {
        key: "name",
        label: "Name",
        value: fxMarkupDetails.name,
      },
      {
        key: "status",
        label: "Status",
        value: fxMarkupDetails.status ? "Active" : "Inactive",
      },
      {
        key: "operationType",
        label: "Operation type",
        value: "Currency conversion",
      },
      {
        key: "validFrom",
        label: "Valid from",
        value: formatDate(fxMarkupDetails.validFrom),
      },
      {
        key: "validTo",
        label: "Valid to",
        value: formatDate(fxMarkupDetails.validTo),
      },
    ],
    Amounts: [
      {
        key: "fromCurrencyId",
        label: "From currency",
        value: assets.find(
          (asset) => asset.fireblockAssetId === fxMarkupDetails.fromCurrencyId,
        )?.name,
      },
      {
        key: "toCurrencyId",
        label: "To currency",
        value: assets.find(
          (asset) => asset.fireblockAssetId === fxMarkupDetails.toCurrencyId,
        )?.name,
      },
      {
        key: "percent",
        label: "Percent",
        value: `${fxMarkupDetails.percent}%`,
      },
    ],
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <HeaderLayout name="Details">
            {CompanyDetails.Details.map(({ value, label }, i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className="py-2">{label}</p>
                <p className="py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
        </div>
        <div className="flex flex-col gap-4">
          <HeaderLayout name="Amounts">
            {CompanyDetails.Amounts.map(({ value, label }, i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className="py-2">{label}</p>
                <p className="py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
        </div>
      </div>
      <div className="mt-8 flex w-full justify-end gap-4 px-3">
        <Button
          title="Back"
          onClick={() => {
            onClose();
          }}
          className="btn-outlined"
        ></Button>
      </div>
    </>
  );
};

export default ViewAddFxMarkupFees;
