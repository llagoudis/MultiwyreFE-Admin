import React, { useEffect, useState } from "react";
// import {
//   ClickAwayListener,
//   Fade,
//   Paper,
//   Popper,
//   TextField,
// } from "@mui/material";
// import Image, { type StaticImageData } from "next/image";
// import FilterBtn from "~/assets/general/sortlines.svg";
// import MuiButton from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import ReportTabsLayout from "~/components/ReportTabsLayout";
import { ApiHandler } from "~/service/UtilService";
import { fetchReportTransactions } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { TextField } from "@mui/material";
import { getTodayAndLast10thDate } from "~/common/functions";

// interface filterType {
//   label: string;
//   name: string;
// }

interface filterdArray {
  id: number;
  assetId: string;
  incomingTotal: number;
  OutgoingTotal: number;

  totalFee: number;
}

const CurrencyTurnover = () => {
  // // filters
  // const filters: filterType[] = [
  //   { label: "ID", name: "id" },
  //   { label: "Currency", name: "currency" },
  //   { label: "Incoming Amount", name: "incoming_amount" },
  //   { label: "Outgoing Amount", name: "outgoing_amount" },
  //   { label: "Fee", name: "fee" },
  // ];

  // // checked items
  // const [checkedItems, setCheckedItems] = React.useState<string[]>([
  //   "id",
  //   "currency",
  //   "incoming_amount",
  //   "outgoing_amount",
  //   "fee",
  // ]);

  // // mui popper position
  // const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
  //   null,
  // );

  // const [open, setOpen] = React.useState(false);

  // // popper handle change function
  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget);
  //   setOpen((open) => !open);
  // };

  // // popper open and close
  // const handleClose = () => {
  //   setAnchorEl(null);
  //   setOpen(false);
  // };

  // // Function to handle checkbox state changes
  // const handleCheckboxChange = (itemName: string) => {
  //   if (checkedItems.includes(itemName)) {
  //     setCheckedItems(checkedItems.filter((item) => item !== itemName));
  //   } else {
  //     setCheckedItems([...checkedItems, itemName]);
  //   }
  // };
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 1000,
    page: 0,
  });

  const [calculatedRows, setCalculatedRows] = useState<filterdArray[]>([]);

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{ data: TransactionDetails[] }> =
      await ApiHandler(fetchReportTransactions, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }
    if (res?.success && res.body?.data) {
      const totalAmounts: filterdArray[] = [];
      res.body?.data.forEach((transaction, index) => {
        const { assetId, TransactionFee, operationType } = transaction;
        const amount = parseFloat(TransactionFee?.amount ?? 0);

        const fees = TransactionFee?.feeValue
          ? parseFloat(TransactionFee?.feeValue ?? 0)
          : 0;

        // Check if assetId already exists in the array
        const existingEntry = totalAmounts.find(
          (entry) => entry.assetId === assetId,
        );

        // console.log({ existingEntry, amount, operationType });

        if (existingEntry) {
          if (Number(operationType) === 1) {
            existingEntry.incomingTotal = existingEntry.incomingTotal + amount;
          } else if (Number(operationType) === 2) {
            existingEntry.OutgoingTotal += amount;
          }

          existingEntry.totalFee += fees;
        } else {
          // If assetId doesn't exist, create a new entry and push it to the array
          totalAmounts.push({
            id: index,
            assetId,
            incomingTotal: Number(operationType) === 1 ? amount : 0,
            OutgoingTotal: Number(operationType) === 2 ? amount : 0,
            totalFee: fees,
          });
        }
      });

      // console.log({ totalAmounts });

      setCalculatedRows(totalAmounts);
    }
  };

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

  // columns
  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "assetId",
      headerName: "CURRENCY",
      flex: 1,
    },
    {
      field: "incomingTotal",
      headerName: "INCOMING AMOUNT",
      flex: 1,
    },
    {
      flex: 1,
      field: "OutgoingTotal",
      headerName: "OUTGOING AMOUNT",
    },

    {
      flex: 1,
      minWidth: 100,
      field: "totalFee",
      headerName: "FEE",
    },
  ];

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
        storageName="CurrencyTurnover"
        rows={calculatedRows}
        columns={columns}
        loading={loading}
        slotProps={{
          toolbar: { csvOptions: { fileName: "Currency Turnover Report" } },
        }}
      />
    </ReportTabsLayout>
  );
};

export default CurrencyTurnover;
