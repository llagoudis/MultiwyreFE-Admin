import React, { useEffect, useState } from "react";
import {
  ClickAwayListener,
  Fade,
  Paper,
  Popper,
  TextField,
} from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import FilterBtn from "~/assets/general/sortlines.svg";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchReportEcomTransactions } from "~/service/ApiRequests";
import Link from "next/link";
import {
  formatDate,
  formatDateTime,
  getTodayAndLast10thDate,
} from "~/common/functions";
import ReportTabsLayout from "~/components/ReportTabsLayout";
import MuiButton from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import EcomReportTabsLayout from "~/components/EcomReportTabsLayout";

interface filterType {
  label: string;
  name: string;
}

interface TotalFeesArray {
  id: number;
  feeType: string;
  provider: string;
  direction: string;
  assetId: string;
  transactiontype: string;
  volume: number;
  totalAmount: number;
  earnedAmount: number;
  operationType?: string;
  toAddress?: string;
}

type TableRow = { row: EcomTransactionDetails };

const AllTransactions = () => {
  // filters
  const filters: filterType[] = [
    { label: "ID", name: "id" },
    { label: "Date and time", name: "date_and_time" },
    { label: "Sender account", name: "sender_account" },
    { label: "Reciever account", name: "reciever_account" },
    { label: "Transaction type", name: "transaction_type" },
    { label: "Transaction Id", name: "transaction_id" },
    { label: "Transaction fee", name: "transaction_fee" },
    { label: "Currency", name: "currency" },
    { label: "Credited amount", name: "credited_amount" },
    { label: "Debited amount", name: "debited_amount" },
    { label: "Rate", name: "rate" },
    { label: "Alert", name: "alert" },
  ];

  // checked items
  const [checkedItems, setCheckedItems] = React.useState<string[]>([
    "id",
    "date_and_time",
    "sender_account",
    "reciever_account",
    "transaction_type",
    "transaction_id",
    "transaction_fee",
    "currency",
    "credited_amount",
    "debited_amount",
    "rate",
    "alert",
  ]);

  // mui popper position
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const [open, setOpen] = React.useState(false);

  // popper handle change function
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((open) => !open);
  };

  // popper open and close
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  // Function to handle checkbox state changes
  const handleCheckboxChange = (itemName: string) => {
    if (checkedItems.includes(itemName)) {
      setCheckedItems(checkedItems.filter((item) => item !== itemName));
    } else {
      setCheckedItems([...checkedItems, itemName]);
    }
  };

  const [calculatedRows, setCalculatedRows] = useState<
    EcomTransactionDetails[]
  >([]);
  const [loading, setLoading] = useState(false);
  const getReports = async (data: FilterType) => {
    //
    setLoading(true);
    const [res, error]: APIResult<{
      data: EcomTransactionDetails[];
    }> = await ApiHandler(fetchReportEcomTransactions, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      const totalAmounts = res.body?.data;
      console.log("totalAmounts", totalAmounts);
      setCalculatedRows(totalAmounts);
      // const totalAmounts: TotalFeesArray[] = [];
      // res.body?.data.forEach((transaction, index) => {
      //   const {
      //     assetId,
      //     fee,
      //     toAddress,
      //     OperationType,
      //     transactiontype,
      //     amount,
      //   } = transaction;
      //   const toCalcAmount = parseFloat(amount) ? parseFloat(amount) : 0;
      //   const feeType = OperationType?.displayName ?? "";
      //   const direction = OperationType?.displayName ?? "";
      //   const provider =
      //     transactiontype === "EXCHANGE" ? "KRAKEN" : "xchange-360";
      //   const fees = fee ? parseFloat(fee ?? 0) : 0;

      // // Check if assetId already exists in the array
      // const existingEntry = totalAmounts.find(
      //   (entry) =>
      //     entry.assetId === assetId &&
      //     entry.transactiontype === transactiontype,
      // );

      // if (existingEntry) {
      //   // If assetId already exists, add the amount to the existing entry
      //   existingEntry.totalAmount += toCalcAmount;
      //   existingEntry.earnedAmount += fees;
      //   existingEntry.volume += 1;
      // } else {
      //   // If assetId doesn't exist, create a new entry and push it to the array
      // totalAmounts.push({
      //   id: index,
      //   transactiontype,
      //   assetId,
      //   toAddress,
      //   provider,
      //   totalAmount: toCalcAmount,
      //   feeType,
      //   direction,
      //   earnedAmount: fees,
      //   volume: 1,
      // });
      // }
      // });
    }
  };

  // columns
  const columns = [
    {
      field: "createdAt",
      headerName: "CREATED AT",
      valueGetter: ({ row }: TableRow) => formatDateTime(row?.createdAt),
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: TableRow) => (
        <span>{formatDateTime(row?.createdAt)}</span>
      ),
    },
    {
      field: "operation",
      headerName: "FEE TYPE",
      valueGetter: ({ row }: TableRow) => row?.OperationType?.displayName,
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: TableRow) => (
        <span>{row?.OperationType?.displayName}</span>
      ),
    },
    {
      field: "clientName",
      valueGetter: ({ row }: TableRow) => row?.Merchant?.User?.firstname,
      headerName: "CLIENT NAME",
      flex: 1,
      minWidth: 200,

      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/individuals/view/${row?.Merchant?.User?.azureId}`}
          className="text-blue-600 underline"
        >
          {row?.Merchant?.User?.firstname ?? ""}
        </Link>
      ),
    },
    {
      flex: 1,
      field: "fromAddress",
      headerName: "ACCOUNT",
      minWidth: 400,
      renderCell: ({ row }: TableRow) => (
        <span>{row?.fromAddress || "--"}</span>
      ),
    },

    {
      flex: 1,
      minWidth: 300,
      field: "transactionHash",
      headerName: "TRANSACTION ID",
      renderCell: ({ row }: TableRow) => (
        // <Link
        //   href={`/banking/transactions/view/${row?.transactionId}`}
        //   className="text-blue-600 underline"
        // >
        <span style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
          {row?.transactionHash || "--"}
        </span>
        // </Link>
      ),
    },

    // {
    //   flex: 1,
    //   minWidth: 200,
    //   field: "fx_provider_id",
    //   headerName: "FX PROVIDER ID",
    //   renderCell: ({}: TableRow) => <span> --</span>,
    // },

    // {
    //   flex: 1,
    //   minWidth: 100,
    //   field: "alert",
    //   headerName: "ALERT",
    //   renderCell: ({}: TableRow) => <span> --</span>,
    // },

    {
      flex: 1,
      minWidth: 200,
      valueGetter: ({ row }: TableRow) => row?.amount,

      field: "charged_amount",
      headerName: "TOTAL FEES",
      renderCell: ({ row }: TableRow) => <span>{row?.amount ?? "--"}</span>,
    },

    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "assetId",
    //   headerName: "CURRENCY",
    //   renderCell: ({ row }: TableRow) => (
    //     <span>{TestCoinName(row?.assetId) || "--"}</span>
    //   ),
    // },

    {
      flex: 1,
      minWidth: 230,
      valueGetter: ({ row }: TableRow) => {
        return row?.transactiontype === "Currency Conversion"
          ? `${row?.assetId ?? ""}`
          : `${row?.assetId ?? ""} `;
      },
      field: "assetId",
      headerName: "CURRENCY PAIR",
      renderCell: ({ row }: TableRow) => (
        <span>
          {Number(row?.transactiontype) === 5
            ? `${row?.assetId ?? ""}`
            : `${row?.assetId ?? ""}`}
        </span>
      ),
    },

    {
      flex: 1,
      minWidth: 200,
      field: "debitedAmount",
      headerName: "DEBIT AMOUNT",
      valueGetter: ({ row }: TableRow) => {
        row.debitedAmount ?? "--";
      },
      renderCell: ({ row }: TableRow) => (
        <span>{row.debitedAmount ?? "--"}</span>
      ),
    },
    {
      flex: 1,
      minWidth: 200,
      field: "creditedAmount",
      headerName: "CREDIT AMOUNT",
      valueGetter: ({ row }: TableRow) => {
        row.creditedAmount ?? "--";
      },
      renderCell: ({ row }: TableRow) => (
        <span>{row.creditedAmount ?? "--"}</span>
      ),
    },

    {
      flex: 1,
      minWidth: 250,
      field: "rate",
      headerName: "RATE",
      renderCell: ({ row }: TableRow) => <span>-</span>,
      // valueGetter: ({ row }: TableRow) => row?.TransactionFee?.rate,
      // headerName: "PROVIDER RATE",
      // renderCell: ({ row }: TableRow) => <span>{row?.TransactionFee?.rate}</span>,
    },

    {
      flex: 1,
      minWidth: 150,
      field: "clientRate",
      headerName: "CLIENT RATE",
      renderCell: ({ row }: TableRow) => <span>-</span>,
      // valueGetter: ({ row }: TableRow) => row?.TransactionFee?.clientRate,
      // headerName: "CLIENT RATE",
      // renderCell: ({ row }: TableRow) => (
      //   <span>{row?.TransactionFee?.clientRate || "--"}</span>
      // ),
    },

    // {
    //   flex: 1,
    //   minWidth: 250,
    //   field: "fxMarkUp",
    //   headerName: "FX MARKUP FEES",
    //   renderCell: ({ row }: TableRow) => <span>{row?.fxmarkUp ?? "--"}</span>,
    //   // valueGetter: ({ row }: TableRow) => <span>{calculateFxMarkupFees(row)}</span>,
    // },

    // {
    //   flex: 1,
    //   minWidth: 250,
    //   field: "transactionFee",
    //   headerName: "TRANSACTION FEE",
    //   renderCell: ({ row }: TableRow) => <span>{row?.networkFee ?? "--"}</span>,
    //   // valueGetter: ({ row }: TableRow) => {
    //   //   return Number(row?.TransactionFee?.transactionFee);
    //   // },

    //   // renderCell: ({ row }: TableRow) => (
    //   //   <span>{Number(row?.TransactionFee?.transactionFee)}</span>
    //   // ),
    // },

    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "exchangeFee",
    //   headerName: "EXCHANGE FEE",
    //   renderCell: ({ row }: TableRow) => <span>-</span>,
    //   // valueGetter: ({ row }: TableRow) => {
    //   //   return Number(row?.TransactionFee?.exchangeFee);
    //   // },

    //   // renderCell: ({ row }: TableRow) => (
    //   //   <span>{Number(row?.TransactionFee?.exchangeFee)}</span>
    //   // ),
    // },
  ];

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 1000,
    page: 0,
  });

  const { todayDate, last10thDate } = getTodayAndLast10thDate();

  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };
    void getReports(paramsQuery);
  }, [fromDate, toDate]);

  function handleChangeStartDate(e: any) {
    setFromDate(e.target.value);
  }

  function handleChangeEndDate(e: any) {
    setToDate(e.target.value);
  }
  return (
    <EcomReportTabsLayout>
      {/* filters  */}
      <div className=" grid grid-cols-5 gap-5 bg-[#E2E8F080] px-3 py-2">
        <div className="flex w-full flex-col">
          <label htmlFor="filter_id">Start Date</label>
          <TextField
            id="filter_id"
            variant="outlined"
            className=" bg-white"
            size="small"
            onChange={handleChangeStartDate}
            value={fromDate}
            type="date"
          />
        </div>

        <div className="flex w-full flex-col">
          <label htmlFor="filter_id">End Date</label>
          <TextField
            id="filter_id"
            variant="outlined"
            className=" bg-white"
            size="small"
            onChange={handleChangeEndDate}
            value={toDate}
            type="date"
          />
        </div>
      </div>

      {/* table component  */}
      <MuiDataGrid
        rows={calculatedRows}
        columns={columns}
        loading={loading}
        storageName="Fees"
        // paginationModel={pagination}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
          sorting: {
            sortModel: [{ field: "id", sort: "desc" }],
          },
        }}
        slotProps={{
          toolbar: { csvOptions: { fileName: "Total Fees Report" } },
        }}
        // rowCount={500}
        pageSizeOptions={[25, 50, 100]}
      />
    </EcomReportTabsLayout>
  );
};

export default AllTransactions;
