import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchReportEcomTransactionsTF } from "~/service/ApiRequests";
import { getTodayAndLast10thDate } from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import EcomReportTabsLayout from "~/components/EcomReportTabsLayout";

interface filterType {
  label: string;
  name: string;
}

interface TotalFeesArray {
  note: string;
  OperationType: number;
  id: number;
  feeType?: string;
  provider?: string;
  direction?: string;
  assetId?: string;
  volume: number;
  toAddress?: string;
  totalAmount?: number;

  earnedAmount: number;
  transactiontype?: string;
  destinationAssetId?: string;
}

type TableRow = { row: TotalFeesArray };

const AllTransactions = () => {
  const [calculatedRows, setCalculatedRows] = useState<TotalFeesArray[]>([]);
  const [loading, setLoading] = useState(false);
  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: EcomTransactionDetails[];
    }> = await ApiHandler(fetchReportEcomTransactionsTF, data);
    setLoading(false);

    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      console.log("res.body?.data: ", res.body?.data.length);
      const totalAmounts: TotalFeesArray[] = [];

      res.body?.data.forEach((transaction) => {
        const {
          assetId,
          OperationType,
          transactiontype,
          networkFee,
          fxmarkUp,
          note,
        } = transaction;

        // Use the OperationType.displayName to define the feeType
        const feeType =
          transactiontype === 1 && note === "EXTERNAL_TO_PROJECT"
            ? OperationType?.displayName
            : transactiontype === 1
              ? "Network Fees"
              : OperationType?.displayName;

        const fees = networkFee ? parseFloat(networkFee ?? 0) : 0;
        const fxMarkupValue = fxmarkUp ? parseFloat(fxmarkUp ?? 0) : 0;

        // Find the matching entry based on assetId, transactiontype, and OperationType
        const currentEntry = totalAmounts.find((entry) => {
          return (
            entry.assetId === assetId &&
            entry.transactiontype === transactiontype &&
            entry.OperationType === OperationType?.id &&
            entry.feeType === feeType // Use feeType based on the transaction type
          );
        });

        if (currentEntry) {
          currentEntry.earnedAmount += fees;
          currentEntry.volume += 1;
          currentEntry.OperationType = OperationType?.id;
        } else {
          totalAmounts.push({
            id: totalAmounts.length + 1,
            feeType,
            assetId,
            volume: 1,
            earnedAmount: fees,
            transactiontype,
            OperationType: OperationType?.id,
            note,
          });
        }

        // Handle FxMarkup and ensure its volume matches Network Fees volume
        if (transactiontype === 1 && note != "EXTERNAL_TO_PROJECT") {
          const fxMarkupEntry = totalAmounts.find(
            (entry) =>
              entry.assetId === assetId &&
              entry.transactiontype === transactiontype &&
              entry.feeType === "FxMarkup" &&
              entry.OperationType === OperationType?.id,
          );

          if (fxMarkupEntry) {
            fxMarkupEntry.earnedAmount += fxMarkupValue;
            fxMarkupEntry.volume += 1;
          } else {
            // Ensure the volume starts as 1 to match Network Fees
            totalAmounts.push({
              id: totalAmounts.length + 1,
              feeType: "FxMarkup",
              assetId,
              volume: 1, // Start with 1 since there's a matching network fee transaction
              earnedAmount: fxMarkupValue,
              transactiontype,
              OperationType: OperationType?.id,
              note,
            });
          }
        }
      });

      // Sort the data and assign unique IDs
      const sortedAmounts = totalAmounts
        .sort((a, b) => {
          if (a.OperationType !== b.OperationType) {
            return a.OperationType - b.OperationType;
          }
          if (
            a.note === "EXTERNAL_TO_PROJECT" &&
            b.note !== "EXTERNAL_TO_PROJECT"
          ) {
            return 1;
          }
          if (
            b.note === "EXTERNAL_TO_PROJECT" &&
            a.note !== "EXTERNAL_TO_PROJECT"
          ) {
            return -1;
          }
          return 0;
        })
        .map((item, index) => ({
          ...item,
          id: index + 1,
        }));

      setCalculatedRows(sortedAmounts);
    }
  };

  // columns
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "feeType", headerName: "FEE TYPE", width: 200, flex: 1 },

    {
      flex: 1,
      field: "assetId",
      headerName: "CURRENCY",
      width: 200,
      valueGetter: ({ row }: TableRow) => row?.assetId,

      renderCell: ({ row }: TableRow) => (
        <p>{row.assetId ? row?.assetId : row?.assetId}</p>
      ),
    },

    {
      flex: 1,
      minWidth: 150,
      field: "feecount",
      valueGetter: ({ row }: TableRow) => row?.volume ?? "---",
      headerName: "FEE COUNT",
      renderCell: ({ row }: TableRow) => <p>{row?.volume ?? "---"}</p>,
    },

    {
      minWidth: 200,
      field: "earnedAmount",
      headerName: "TOTAL AMOUNT",
      valueGetter: ({ row }: TableRow) => row?.earnedAmount.toFixed(6) ?? "---",
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.earnedAmount.toFixed(6) ?? "---"} `}</p>
      ),
    },
  ];

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10000000000,
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
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        slotProps={{
          toolbar: { csvOptions: { fileName: "Total Fees Report" } },
        }}
        pageSizeOptions={[25, 50, 100]}
      />
    </EcomReportTabsLayout>
  );
};

export default AllTransactions;
