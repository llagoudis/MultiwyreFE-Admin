import React, { useState, Fragment, type FC, useMemo } from "react";
import HeaderLayout from "../../../../components/common/HeaderLayout";
import MuiSelect from "../../../../components/MuiSelect";
import { useRouter } from "next/router";
import Button from "~/components/common/Button";
import Header from "../../../../components/common/Header";
import { formatDate } from "~/common/functions";
import { usePriceStore } from "~/store";

const Details: FC<CommonPricelistProps> = ({ data }) => {
  const pricelist: PriceList = usePriceStore();
  const router = useRouter();

  const feesArray = [
    { TransferFees: pricelist.TransferFees },
    { recurringFees: pricelist.RecurringFees },
    { fxmarkup: pricelist.FxMarkupFees },
  ];

  const options = [
    {
      value: "add_new",
      label: "Add new",
    },
    {
      value: "edit",
      label: "Edit",
    },
    {
      value: "delete",
      label: "Delete",
    },
    {
      value: "terminated",
      label: "Terminated",
    },
    {
      value: "dormanted",
      label: "Dormanted",
    },
  ];

  const CompanyDetails: DetailsBody = useMemo(
    () => ({
      Details: {
        "Source price list": data.name ?? "",
        "Client type": data.clientType ?? "",
        Status: "-",
        Standard: data.standard ? "Yes" : "No",
        "External fee enabled": data.externalFeeEnabled ? "Yes" : "No",
        "Created At": formatDate(data.createdAt),
      },
      clients: {
        "Outgoing Transfers": "-",
        "Created At": "-",
      },
      Fees: feesArray,
    }),
    [data],
  );

  console.log("CompanyDetails", CompanyDetails);
  const [filter, setFilter] = useState("");

  const handleChange = async (event: { target: { value: string } }) => {
    setFilter(event.target.value);

    try {
      if (event.target.value === "Add new") {
        await router.push("/banking/price-list/price-list-form");
      } else if (event.target.value === "Edit") {
        await router.push(`/banking/price-list/price-list-form?id=${data.id}`);
      }
    } catch (error) {
      console.error("Error navigating to the route:", error);
    }
  };

  return (
    <Fragment>
      <div className="flex items-center justify-between py-4">
        <Header head="Details" />
        <div className=" w-fit">
          <MuiSelect
            placeHolder="Actions"
            options={options}
            placeHolderColor="#000000"
            value={filter}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className=" grid grid-cols-2 gap-4">
        <div className=" col-span-2"></div>
        <div>
          <div className="flex flex-col gap-4">
            {/* Details */}
            <HeaderLayout name="Details">
              {Object.entries(CompanyDetails.Details).map(([key, value], i) => (
                <div key={i} className=" grid grid-cols-2 ">
                  <p className=" py-2 font-semibold">{key}</p>
                  <p className=" py-2 font-semibold">{value}</p>
                </div>
              ))}
            </HeaderLayout>
            <HeaderLayout name="Clients">
              {Object.entries(CompanyDetails.clients).map(([key, value], i) => (
                <div key={i} className=" grid grid-cols-2 ">
                  <p className=" py-2 font-semibold">{key}</p>
                  <p className=" py-2 font-semibold">{value}</p>
                </div>
              ))}
            </HeaderLayout>
            <HeaderLayout name="Cashback"></HeaderLayout>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {/* Fees */}
          <HeaderLayout name="Fees">
            {CompanyDetails?.Fees?.map((item, i) => (
              <div key={i}>
                {item.TransferFees && (
                  <div>
                    {item.TransferFees.map(
                      (feesGroup: any, groupIndex: any, arr: any[]) => (
                        <div key={groupIndex} className="">
                          {!arr[groupIndex - 1] ||
                          arr[groupIndex - 1]?.OperationType?.displayName !==
                            feesGroup?.OperationType?.displayName ? (
                            <p className="py-2 font-semibold">
                              {feesGroup?.OperationType?.displayName}
                            </p>
                          ) : null}

                          <div className="mb-1 grid grid-cols-3">
                            <p className=" py-[3px]">
                              ({feesGroup.currencyId})
                            </p>
                            <p className="py-[3px] text-center">
                              {feesGroup.fixedFee}
                            </p>
                            <p className="py-[3px] text-center">
                              {feesGroup.percent}%
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {item.recurringFees && (
                  <div>
                    <p className="py-2 font-semibold">Recurring</p>
                    {item.recurringFees.map(
                      (feesGroup: any, groupIndex: any, arr: any[]) => (
                        <div key={groupIndex} className="">
                          {!arr[groupIndex - 1] ||
                          arr[groupIndex - 1]?.OperationType?.displayName !==
                            feesGroup?.OperationType?.displayName ? (
                            <p>
                              {/* {feesGroup?.OperationType?.displayName} */}
                            </p>
                          ) : null}

                          <div className="mb-1 grid grid-cols-3">
                            <p className="py-[3px]">({feesGroup.currencyId})</p>
                            <p className="py-[3px] text-center">
                              {feesGroup.fixedFee}
                            </p>
                            {/* <p className="text-center">{feesGroup.percent}%</p> */}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {item.fxmarkup && (
                  <div>
                    <p className="py-2 font-semibold">FX markup</p>
                    {item.fxmarkup.map(
                      (feesGroup: any, groupIndex: any, arr: any[]) => (
                        <div key={groupIndex} className="">
                          {!arr[groupIndex - 1] ||
                          arr[groupIndex - 1]?.OperationType?.displayName !==
                            feesGroup?.OperationType?.displayName ? (
                            <p className="py-2 font-semibold">
                              {feesGroup?.OperationType?.displayName}
                            </p>
                          ) : null}

                          <div className="mb-1 grid grid-cols-2">
                            <p className="py-[3px]">
                              ({feesGroup.fromCurrencyId}-
                              {feesGroup.toCurrencyId})
                            </p>
                            <p className="py-[3px] text-center">
                              {feesGroup.percent}%
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}
          </HeaderLayout>
        </div>
      </div>
    </Fragment>
  );
};

export default Details;
