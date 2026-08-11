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
import { fetchReportTransactions } from "~/service/ApiRequests";
import Link from "next/link";
import { formatDate, getTodayAndLast10thDate } from "~/common/functions";
import ReportTabsLayout from "~/components/ReportTabsLayout";
import MuiButton from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";

interface filterType {
  label: string;
  name: string;
}

interface filterdArray {
  id: number;
  feeType: string;
  provider: string;
  direction: string;
  assetId: string;
  volume: number;
  totalAmount: number;
  earnedAmount: number;
  operationType?: string;
  destinationAssetId: string;
}

type TableRow = { row: filterdArray };

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

  const [calculatedRows, setCalculatedRows] = useState<filterdArray[]>([]);
  const [loading, setLoading] = useState(false);
  const getReports = async (data: FilterType) => {
    //
    setLoading(true);
    const [res, error]: APIResult<{
      data: TransactionDetails[];
    }> = await ApiHandler(fetchReportTransactions, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      const totalAmounts: filterdArray[] = [];
      res.body?.data.forEach((transaction, index) => {
        const {
          assetId,
          TransactionFee,
          destinationAssetId,
          OperationType,
          operationType,
          operation,
        } = transaction;
        const amount = parseFloat(TransactionFee?.amount ?? 0);
        const feeType = OperationType?.displayName ?? "";
        const direction = OperationType?.displayName ?? "";
        const provider = operation === "EXCHANGE" ? "KRAKEN" : "FIREBLOCKS";
        const fees = TransactionFee?.feeValue
          ? parseFloat(TransactionFee?.feeValue ?? 0)
          : 0;

        // Check if assetId already exists in the array
        const existingEntry = totalAmounts.find(
          (entry) =>
            entry.assetId === assetId && entry.operationType === operationType,
        );

        if (existingEntry) {
          // If assetId already exists, add the amount to the existing entry
          existingEntry.totalAmount += amount;
          existingEntry.earnedAmount += fees;
          existingEntry.volume += 1;
        } else {
          // If assetId doesn't exist, create a new entry and push it to the array
          totalAmounts.push({
            id: index,
            operationType,
            assetId,
            destinationAssetId,
            provider,
            totalAmount: amount,
            feeType,
            direction,
            earnedAmount: fees,
            volume: 1,
          });
        }
      });

      setCalculatedRows(totalAmounts);
    }
  };

  // columns
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "feeType", headerName: "FEE TYPE", width: 200 },
    { field: "provider", headerName: "PROVIDER", width: 150 },
    { field: "direction", headerName: "DIRECTION", width: 150 },
    {
      field: "assetId",
      headerName: "CURRENCY",
      width: 200,
      valueGetter: ({ row }: TableRow) =>
        Number(row?.operationType) === 5 && row.destinationAssetId
          ? `${row?.assetId} - ${row.destinationAssetId}`
          : row?.assetId,

      renderCell: ({ row }: TableRow) => (
        <p>
          {Number(row?.operationType) === 5 && row.destinationAssetId
            ? `${row?.assetId} - ${row.destinationAssetId}`
            : row?.assetId}
        </p>
      ),
    },

    {
      minWidth: 150,
      field: "feecount",
      valueGetter: ({ row }: TableRow) => row?.volume ?? "---",
      headerName: "FEE COUNT",
      renderCell: ({ row }: TableRow) => <p>{row?.volume ?? "---"}</p>,
    },
    // { field: "volume", headerName: "VOLUME", width: 150 },
    { field: "totalAmount", headerName: "TOTAL AMOUNT", width: 200 },
    { field: "earnedAmount", headerName: "EARNED AMOUNT", width: 200 },

    {
      minWidth: 200,
      field: "debited_amount",
      headerName: "DEBITED AMOUNT",
      valueGetter: ({ row }: TableRow) =>
        row?.totalAmount
          ? Number(row?.totalAmount) - Number(row?.earnedAmount)
          : "---",
      renderCell: ({ row }: TableRow) => (
        <p>
          {`${
            row?.totalAmount
              ? Number(row?.totalAmount) - Number(row?.earnedAmount)
              : "---"
          } `}
        </p>
      ),
    },
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
    <ReportTabsLayout>
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
          // sorting: {
          //   sortModel: [{ field: "id", sort: "desc" }],
          // },
        }}
        slotProps={{
          toolbar: { csvOptions: { fileName: "Total Fees Report" } },
        }}
        // rowCount={500}
        pageSizeOptions={[25, 50, 100]}
      />
    </ReportTabsLayout>
  );
};

export default AllTransactions;
