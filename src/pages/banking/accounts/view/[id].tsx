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
import { formatDateTime } from "~/common/functions";
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
  const router = useRouter();
  const accountNumber = Array.isArray(router.query.id) ? "" : router.query.id;
  const [account, setAccount] = useState<Account>();
  const [transactions, setTransactions] = useState<TransactionDetails[]>();
  const [ecomTrxs, setEcomTrxs] = useState<EcomTransactions[]>();
  function returnAmount(row: any) {
    if (row.operationType === 5) {
      if (row?.assetId === account?.assetId) {
        const amount =
          Number(row?.TransactionFee?.debitedAmount) -
          Number(row?.TransactionFee.exchangeFee);
        return -Number(amount.toFixed(6));
      } else {
        return +Number(
          Math.max(Number(row.TransactionFee?.creditedAmount), 0).toFixed(6),
        );
      }
    } else if (row.operationType === 2) {
      return -Number(
        Math.max(Number(row.TransactionFee?.amount), 0).toFixed(6),
      );
    } else if (row.operationType === 1) {
      return +Number(
        Math.max(Number(row.TransactionFee?.amount), 0).toFixed(6),
      );
    } else if (row.note === "COMMISSION_TRANSACTION") {
      return -Number(
        Math.max(Number(row?.TransactionFee.amount), 0).toFixed(6),
      );
    }
    return "---";
  }

  function returnEcomAmount(row: any) {
    if (row.transactiontype === 2 || row.note === "COMMISSION_TRANSACTION") {
      const amount = Math.max(Number(row?.amount), 0);
      return -Number(amount.toFixed(6));
    } else if (
      row.note === "SWEEP_PROJECT" ||
      row.note === "EXTERNAL_TO_PROJECT"
    ) {
      const amount = Math.max(Number(row?.amount), 0);
      return +Number(amount.toFixed(6));
    } else {
      return "---";
    }
  }

  type TableRowProject = { row: TransactionDetails };
  type TableRowEcom = { row: EcomTransactions };

  const isAccountIsProject = account?.User?.userType === "PROJECT";

  type TableRow = TableRowProject | TableRowEcom;

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
        return <p>{returnAmount(row)}</p>;
      },
    },
    {
      minWidth: 400,
      field: "description",
      headerName: "Description",
      valueGetter: ({ row }: TableRow) => {
        let displayText = row?.note;
        if (row?.note?.includes("KRAKEN_")) {
          const newDescription = row.note.split("KRAKEN_");
          if (newDescription[1]) {
            displayText = newDescription[1].split("-").join(" Order - ");
          }
        }
        return displayText;
      },
      renderCell: ({ row }: TableRow) => {
        let displayText = row?.note;

        if (row?.note?.includes("KRAKEN_")) {
          const newDescription = row.note.split("KRAKEN_");
          if (newDescription[1]) {
            displayText = newDescription[1].split("-").join(" Order - ");
          }
        }
        return <p>{displayText}</p>;
      },
    },
    {
      flex: 1,
      minWidth: 200,
      field: "operation",
      headerName: "Type",
      valueGetter: ({ row }: TableRow) => {
        return row?.OperationType?.displayName;
      },
      renderCell: ({ row }: TableRow) => {
        return (
          <p>
            {row?.note === "COMMISSION_TRANSACTION"
              ? "Fee"
              : row?.OperationType?.displayName}
          </p>
        );
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
        return formatDateTime(row?.createdAt, true);
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{formatDateTime(row?.createdAt, true) ?? "---"}</p>;
      },
    },
  ];

  const ecomColumns = [
    {
      minWidth: 300,
      field: "transactionId",
      headerName: "ID",
    },
    {
      minWidth: 140,
      field: "amount",
      headerName: "Amount",
      valueGetter: ({ row }: TableRow) => {
        return returnEcomAmount(row);
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{returnEcomAmount(row)}</p>;
      },
    },
    {
      minWidth: 250,
      field: "note",
      headerName: "Description",
      // valueGetter: ({ row }: TableRow) => {
      //   let displayText = row?.note;
      //   if (row?.note.includes("KRAKEN_")) {
      //     const newDescription = row.note.split("KRAKEN_");
      //     if (newDescription[1]) {
      //       displayText = newDescription[1].split("-").join(" Order - ");
      //     }
      //   }
      //   return displayText;
      // },
      // renderCell: ({ row }: TableRow) => {
      //   let displayText = row?.note;

      //   if (row?.note.includes("KRAKEN_")) {
      //     const newDescription = row.note.split("KRAKEN_");
      //     if (newDescription[1]) {
      //       displayText = newDescription[1].split("-").join(" Order - ");
      //     }
      //   }
      //   return <p>{displayText}</p>;
      // },
    },
    {
      minWidth: 150,
      flex: 1,
      field: "transactiontype",
      headerName: "Type",
      valueGetter: ({ row }: TableRow) => {
        return row?.transactiontype === 2 ? "OUTGOING" : "INCOMING";
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{row?.transactiontype === 2 ? "OUTGOING" : "INCOMING"}</p>;
      },
    },

    {
      minWidth: 150,
      field: "status",
      flex: 1,

      headerName: "Status",
    },

    {
      minWidth: 200,
      flex: 1,

      field: "createdAt",
      headerName: "Date",
      valueGetter: ({ row }: TableRow) => {
        return formatDateTime(row?.createdAt, true);
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{formatDateTime(row?.createdAt, true) ?? "---"}</p>;
      },
    },
  ];

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
      "Created at": formatDateTime(account?.User?.createdAt, true) ?? "-",
      "Activated By": "",
      "Fee activated at": formatDateTime(account?.feeActivatedAt, true) ?? "-",
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

      if (res?.body?.User?.userType === "PROJECT") {
        const trxs = res?.body?.EcomTransactions;
        setEcomTrxs(trxs);
      } else {
        if (res?.body?.TransactionDetails?.length > 0) {
          const commissionTransactions = res.body.TransactionDetails.filter(
            (transaction) =>
              transaction.note === "COMMISSION_TRANSACTION" &&
              res.body?.assetId === transaction.assetId,
          );
          const otherTransactions = res.body.TransactionDetails.filter(
            (transaction) => transaction.note !== "COMMISSION_TRANSACTION",
          );

          const allTransactions = [
            ...commissionTransactions,
            ...otherTransactions,
          ];

          allTransactions.sort((a, b) => Number(b.id) - Number(a.id));

          setTransactions(allTransactions ?? []);
        }
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
              rows={isAccountIsProject ? ecomTrxs ?? [] : transactions ?? []}
              columns={isAccountIsProject ? ecomColumns : transactionColums}
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
