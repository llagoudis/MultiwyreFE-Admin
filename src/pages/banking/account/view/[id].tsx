import Button from "~/components/common/Button";
import Image, { type StaticImageData } from "next/image";
import AddPluse from "~/assets/general/Add_Plus.svg";
import React, { useEffect, useState } from "react";
import HeaderLayout from "~/components/common/HeaderLayout";
import { Box } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import MuiButton from "~/components/common/Button";
import { useRouter } from "next/router";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import { fetchAccountById } from "~/service/ApiRequests";
import { formatDate, formatDateTime } from "~/common/functions";
import Link from "next/link";
// import InputComponent from "~/components/common/InputComponent";
// import { useForm } from "react-hook-form";
// import SelectComponent from "~/components/common/SelectComponent";
// import { BsPlus } from "react-icons/bs";

type accountBody = {
  Details: {
    Client: string;
    Holder: string;
    Number: string;
    Name: string;
    Type: string;
    Primary: string;
    Status: string;
    "Status changed by": string;
    "Created at": string;
    "Activated By": string;
    "Fee activated at": string;
    "Settlement at": string;
    "Automatic fee activation": string;
    Dormant: string;
    "Country code": string;
  };

  Provider: {
    "Provider name": string;
    "Provider currency": string;
    "Provider external ID": string;
    "Provider number": string | number;
    "Provider currencies": string;
  };
  ProviderAccNumber: {
    "Business type": string;
    "Account number": string;
    BIC: string;
    Currency: string;
  };
  Balance: {
    Currency: string;
    Current: string;
    Reserved: string;
    Available: string;
  };
};

// Input field

// type formData = {
//   from: string;
//   to: string;
//   format: string;
// };
// const formatTypes = [
//   { label: "PDF", value: "option1" },
//   { label: "Option 2", value: "option2" },
// ];

// type dataType = {
//   id: string;
//   BusinessType: string;
//   accountNumber: string;
//   bic: string;
//   currency: string;
// };

const AccountView = () => {
  type TableRow = { row: TransactionDetails };
  const router = useRouter();
  const accountNumber = Array.isArray(router.query.id) ? "" : router.query.id;
  const [account, setAccount] = useState<Account>();

  function returnAmount(row: any) {
    if (row.operationType === 5) {
      if (row?.assetId === account?.assetId) {
        return `-${Math.max(Number(row.TransactionFee?.debitedAmount), 0)}`;
      } else {
        return `+${Math.max(Number(row.TransactionFee?.creditedAmount), 0)}`;
      }
    } else if (row.operationType === 2) {
      return `-${Math.max(Number(row.TransactionFee?.amount), 0)}`;
    } else if (row.operationType === 1) {
      return `+${Math.max(Number(row.TransactionFee?.amount), 0)}`;
    }
    return "---";
  }

  // trasaction column data
  const transactionColums = [
    {
      minWidth: 300,
      field: "transactionId",
      headerName: "ID",
    },
    {
      minWidth: 200,
      field: "amount",
      headerName: "Amount",
      valueGetter: ({ row }: TableRow) => {
        return returnAmount(row);
      },
      renderCell: ({ row }: TableRow) => {
        return (
          <p>
            {returnAmount(row)}
            {/* {row?.assetId === account?.assetId
              ? `-${Math.max(Number(row.TransactionFee?.debitedAmount), 0)}`
              : `+${Math.max(Number(row.TransactionFee?.creditedAmount), 0)}`} */}
          </p>
        );
      },
    },
    {
      minWidth: 400,
      field: "description",
      headerName: "Description",
      valueGetter: ({ row }: TableRow) => {
        const newDescription = row?.note.split("_");
        const splitByDash = newDescription[1]?.split("-").join(" Order - ");
        return splitByDash;
      },
      renderCell: ({ row }: TableRow) => {
        const newDescription = row?.note.split("_");
        const splitByDash = newDescription[1]?.split("-").join(" Order - ");
        return <p>{splitByDash ?? "---"}</p>;
      },
    },
    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "details",
    //   headerName: "Details",
    // },
    {
      flex: 1,

      minWidth: 200,
      field: "operation",
      headerName: "Type",
      valueGetter: ({ row }: TableRow) => {
        return row?.operation;
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{row?.operation ?? "---"}</p>;
      },
    },

    {
      flex: 1,
      minWidth: 200,
      field: "status",
      headerName: "Status",
    },

    {
      flex: 1,

      minWidth: 200,
      field: "createdAt",
      headerName: "Date",
      valueGetter: ({ row }: TableRow) => {
        return formatDate(row?.createdAt);
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{formatDate(row?.createdAt) ?? "---"}</p>;
      },
    },
  ];

  const [transactions, setTransactions] = useState<TransactionDetails[]>();

  const AccountDetails: accountBody = {
    Details: {
      Client: `${account?.User?.firstname ?? ""} ${
        account?.User?.lastname ?? ""
      }`,
      Holder: `${account?.User?.firstname ?? ""} ${
        account?.User?.lastname ?? ""
      }`,
      Number: account?.accountNumber ?? "",
      Name: "--",
      Type: account?.assetId ?? "",
      Primary: "--",
      Status: "--",
      "Status changed by": "--",
      "Created at": formatDateTime(account?.User?.createdAt) ?? "-",
      "Activated By": "",
      "Fee activated at": formatDateTime(account?.feeActivatedAt) ?? "-",
      "Settlement at": "",
      "Automatic fee activation": "--",
      Dormant: "--",
      "Country code": account?.User?.countryCode ?? "",
    },

    Provider: {
      "Provider name": "FIREBLOCKS",
      "Provider currency": account?.assetId ?? "",
      "Provider external ID": "--",
      "Provider number": account?.provider ?? 0,
      "Provider currencies": "--",
    },

    ProviderAccNumber: {
      "Business type": "--",
      "Account number": "--",
      BIC: "--",
      Currency: "",
    },
    Balance: {
      Currency: account?.assetId ?? "",
      Current: account?.balance ?? "",
      Reserved: "--",
      Available: "--",
    },
  };

  const onNavigation = (path: string, data?: KeyString) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  const fetchAccount = async () => {
    const [res, error]: APIResult<Account> = await ApiHandler(
      fetchAccountById,
      accountNumber,
    );

    if (error) {
      toast.error("Failed to load accounts");
    }

    if (res?.success && res?.body) {
      setAccount(res.body);

      if (res.body.TransactionDetails.length > 0) {
        setTransactions(res.body.TransactionDetails ?? []);
      }
    }
  };

  useEffect(() => {
    if (accountNumber) void fetchAccount();
  }, [accountNumber]);

  return (
    <div className="">
      <div className=" flex items-center justify-between py-4">
        <div>
          <p className=" text-2xl font-bold text-[#1E293B]">View accounts</p>
        </div>
        <div className=" flex items-center gap-4">
          <p
            className="cursor-pointer text-[#64748B]"
            onClick={() => {
              onNavigation("/banking/accounts/addAccount", {
                from: "edit",
              });
            }}
          >
            Edit
          </p>

          <MuiButton
            onClick={() => {
              onNavigation("/banking/accounts/addAccount", {
                from: "create",
              });
            }}
            className="btn-solid"
            title="Add new"
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
                  {key === "Client" ? (
                    <Link
                      href={`/banking/individuals/view/${account?.userId}`}
                      className="text-blue-600 underline"
                    >
                      {value}
                    </Link>
                  ) : (
                    <p className=" py-2">{value}</p>
                  )}
                </div>
              ))}
            </HeaderLayout>
          </div>
        </div>
        {/* column 2 */}
        <div className="flex flex-col gap-4">
          {/* Provider account number */}
          <HeaderLayout name="Provider account number">
            {Object.entries(AccountDetails.ProviderAccNumber).map(
              ([key, value], i) => (
                <div key={i} className=" grid grid-cols-2 ">
                  <p className=" py-2">{key}</p>
                  <p className=" py-2">{value}</p>
                </div>
              ),
            )}
          </HeaderLayout>
          {/* Balances */}
          <HeaderLayout name="Balances">
            {Object.entries(AccountDetails.Balance).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>
          {/* Provider */}
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
      {/* column 5 */}
      <div className="mt-4">
        <div className="w-full border border-[#00000030] ">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="subHeader">Transactions</h2>
          </div>
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              storageName={"view_transactions"}
              rows={transactions ?? []}
              columns={transactionColums}
              hideFooterPagination={true}
            />
          </Box>
        </div>
      </div>

      <div className=" my-4 text-right">
        <Button
          title="Cancel"
          className="btn-outlined"
          onClick={() => {
            router.back();
          }}
        ></Button>
      </div>
    </div>
  );
};

export default AccountView;
