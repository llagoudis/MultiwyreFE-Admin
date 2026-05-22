import React, { useState, Fragment, type FC, useMemo } from "react";
import HeaderLayout from "../../../../components/common/HeaderLayout";
import MuiSelect from "../../../../components/MuiSelect";
import { useRouter } from "next/router";
import Button from "~/components/common/Button";
import Header from "../../../../components/common/Header";
import { formatDate } from "~/common/functions";
import { useLimitStore } from "~/store";

interface CommonPricelistProps {
  data: Limits;
}

const Details: FC<CommonPricelistProps> = ({ data }) => {
  const limitList: Limits = useLimitStore();
  const router = useRouter();

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

  const CompanyDetails: LimitDetailsBody = useMemo(
    () => ({
      Details: {
        "Client type": data?.clientType ?? "",
        "Limit name": data?.name ?? "",
        "Created At": formatDate(data?.createdAt),
      },
      Limits: limitList?.ExchangeLimits ?? [],
    }),
    [data],
  );
  console.log("CompanyDetails: ", CompanyDetails);

  const [filter, setFilter] = useState("");
  const handleNavigate = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };
  const handleChange = async (event: { target: { value: string } }) => {
    setFilter(event.target.value);

    try {
      if (event.target.value === "Add new") {
        await router.push("/exchange/limits/view/addLimit");
      } else if (event.target.value === "Edit") {
        handleNavigate("/exchange/limits/view/editLimit", { id: data.id });
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
            <HeaderLayout name="Limit Details">
              {Object.entries(CompanyDetails.Details).map(([key, value], i) => (
                <div key={i} className=" grid grid-cols-2 ">
                  <p className=" py-2 font-semibold">{key}</p>
                  <p className=" py-2 font-semibold">{value}</p>
                </div>
              ))}
            </HeaderLayout>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <HeaderLayout name="Limits">
            {CompanyDetails?.Limits?.map((item, i) => (
              <div key={i}>
                <div className="mb-1 grid grid-cols-3">
                  <p className=" py-[3px]">({item.currencyId})</p>
                  <p className="py-[3px] text-center">{item.amount}</p>
                  {/* <p className="py-[3px] text-center">{item.}</p> */}
                </div>
              </div>
            ))}
          </HeaderLayout>
        </div>
      </div>
    </Fragment>
  );
};

export default Details;
