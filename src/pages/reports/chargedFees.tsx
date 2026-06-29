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
import MuiDataGrid from "~/components/common/MuiDataGrid";
import MuiButton from "~/components/common/Button";
import ReportTabsLayout from "~/components/ReportTabsLayout";
import { ApiHandler } from "~/service/UtilService";
import {
  fetchChargedFees,
  fetchReportTransactions,
} from "~/service/ApiRequests";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ExportCsv,
  TestCoinName,
  formatDate,
  formatDateTime,
  getTodayAndLast10thDate,
} from "~/common/functions";
import { Button, TextField } from "@mui/material";
import {
  GridFilterModel,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

// interface filterType {
//   label: string;
//   name: string;
// }
type TableRow = { row: TransactionDetails };
const ChargedFees = () => {
  // // filters
  // const filters: filterType[] = [
  //   { label: "ID", name: "id" },
  //   { label: "Fee Type", name: "fee_type" },
  //   { label: "Client name", name: "client_name" },
  //   { label: "Accout", name: "account" },
  //   { label: "Transaction ID", name: "transaction_id" },
  //   { label: "Fx Provider Id", name: "fx_provider_id" },
  //   { label: "Alert", name: "alert" },
  //   { label: "Charged Amount", name: "charged_amount" },
  //   { label: "Currency", name: "currency" },
  //   { label: "Currency Pair", name: "currency_pair" },
  //   { label: "Exchange Amount", name: "exchange_amount" },
  //   { label: "Provider Rate", name: "provider_rate" },
  //   { label: "Client Rate", name: "client_rate" },
  //   { label: "FX Markup", name: "fx_markup" },
  // ];

  // // checked items
  // const [checkedItems, setCheckedItems] = React.useState<string[]>([
  //   "id",
  //   "fee_type",
  //   "client_name",
  //   "account",
  //   "transaction_id",
  //   "fx_provider_id",
  //   "alert",
  //   "charged_amount",
  //   "currency",
  //   "currency_pair",
  //   "exchange_amount",
  //   "provider_rate",
  //   "client_rate",
  //   "fx_markup",
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
  const [chargedFees, setChargedFees] = useState<TransactionDetails[]>([]);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const [state, setState] = React.useState({
    clientName: undefined,
    sourceAddress: undefined,
    assetId: undefined,
    transactionId: undefined,
    operation: undefined,
    alert: undefined,
    debitedAmount: undefined,
    creditedAmount: undefined,
    transactionFee: undefined,
    exchangeFee: undefined,
    fxMarkUp: undefined,
    rate: undefined,
    clientRate: undefined,
  });

  const {
    clientName,
    assetId,
    sourceAddress,
    transactionId,
    operation,
    alert,
    debitedAmount,
    creditedAmount,
    transactionFee,
    exchangeFee,
    fxMarkUp,
    rate,
    clientRate,
  } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchChargedFees, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      const filterdReports = res.body?.data?.filter((item) => {
        return Number(item?.TransactionFee?.feeValue) > 0;
      });
      setPageCount(res?.body?.pagination?.totalItems);

      setChargedFees(filterdReports);
    }
  };

  const { todayDate, last10thDate } = getTodayAndLast10thDate();

  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);
  const [sort, setSort] = useState({
    field: "",
    sort: "",
  });
  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (clientName) paramsQuery.clientName = clientName;
    if (assetId) paramsQuery.currencyPair = assetId;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (transactionId) paramsQuery.transactionId = transactionId;
    if (operation) paramsQuery.operation = operation;
    if (debitedAmount) paramsQuery.debitedAmount = debitedAmount;
    if (creditedAmount) paramsQuery.creditedAmount = creditedAmount;
    if (transactionFee) paramsQuery.transactionFee = transactionFee;
    if (alert) paramsQuery.alert = alert;
    if (exchangeFee) paramsQuery.exchangeFee = exchangeFee;
    if (fxMarkUp) paramsQuery.fxMarkUp = fxMarkUp;
    if (rate) paramsQuery.rate = rate;
    if (clientRate) paramsQuery.clientRate = clientRate;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    void getReports(paramsQuery);
  }, [
    pagination,
    fromDate,
    toDate,
    clientName,
    assetId,
    sourceAddress,
    operation,
    debitedAmount,
    creditedAmount,
    transactionFee,
    alert,
    exchangeFee,
    fxMarkUp,
    rate,
    clientRate,
    transactionId,
    sort,
  ]);

  const calculateTotalFees = (row: TransactionDetails) => {
    const clientRate = Number(row?.TransactionFee?.clientRate) ?? 0;
    const rate = Number(row?.TransactionFee?.rate) ?? 0;
    const fxMarkUp = Number(row?.TransactionFee?.fxMarkUp) ?? 0;
    const exchangeAmount = Number(row?.TransactionFee?.amount);

    const adjustedClientRate =
      rate === 0 ? clientRate * (1 - fxMarkUp / 100) : clientRate;
    const finalFxMarkUp = Math.abs(
      (adjustedClientRate - rate) * exchangeAmount,
    );

    const transactionFee = Number(row?.TransactionFee?.transactionFee) || 0;
    const exchangeFee = Number(row?.TransactionFee?.exchangeFee) || 0;

    return transactionFee + finalFxMarkUp + exchangeFee;
  };

  const calculateFxMarkupFees = (row: TransactionDetails) => {
    const clientRate = Number(row?.TransactionFee?.clientRate) ?? 0;
    const rate = Number(row?.TransactionFee?.rate) ?? 0;
    const fxMarkUp = Number(row?.TransactionFee?.fxMarkUp) ?? 0;
    const exchangeAmount = Number(row?.TransactionFee?.amount);

    const adjustedClientRate =
      rate === 0 ? clientRate * (1 - fxMarkUp / 100) : clientRate;

    return Math.abs((adjustedClientRate - rate) * exchangeAmount);
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
      valueGetter: ({ row }: TableRow) =>
        row?.User?.firstname + " " + row?.User?.lastname,
      headerName: "CLIENT NAME",
      flex: 1,
      minWidth: 200,

      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/individuals/view/${row?.User?.azureId}`}
          className="text-blue-600 underline"
        >
          {`${row?.User?.firstname ?? ""} ${row?.User?.lastname ?? ""}`}
        </Link>
      ),
    },
    {
      flex: 1,
      field: "sourceAddress",
      headerName: "ACCOUNT",
      minWidth: 400,
      renderCell: ({ row }: TableRow) => (
        <span>{row?.sourceAddress || "--"}</span>
      ),
    },

    {
      flex: 1,
      minWidth: 300,
      field: "transactionId",
      headerName: "TRANSACTION ID",
      renderCell: ({ row }: TableRow) => (
        <span style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
          {row?.txHash || "--"}
        </span>
      ),
    },

    {
      flex: 1,
      minWidth: 200,
      field: "fx_provider_id",
      headerName: "FX PROVIDER ID",
      renderCell: ({}: TableRow) => <span> --</span>,
    },


    {
      flex: 1,
      minWidth: 200,
      valueGetter: ({ row }: TableRow) => calculateTotalFees(row),

      field: "charged_amount",
      headerName: "TOTAL FEES",
      renderCell: ({ row }: TableRow) => <span>{calculateTotalFees(row)}</span>,
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
        return row?.operationType === "Currency Conversion"
          ? `${row?.assetId ?? ""} - ${row?.destinationAssetId ?? ""}`
          : `${row?.assetId ?? ""} - ${row?.assetId ?? ""}`;
      },
      field: "assetId",
      headerName: "CURRENCY PAIR",
      renderCell: ({ row }: TableRow) => (
        <span>
          {Number(row?.operationType) === 5
            ? `${row?.assetId ?? ""} - ${row?.destinationAssetId ?? ""}`
            : `${row?.assetId ?? ""}`}
        </span>
      ),
    },

    {
      flex: 1,
      minWidth: 200,
      field: "debitedAmount",
      valueGetter: ({ row }: TableRow) => {
        return Number(row?.operationType) === 5
          ? `${row?.TransactionFee?.debitedAmount}`
          : Number(row?.operationType) === 2
            ? `${row?.TransactionFee.amount}`
            : "--";
      },

      headerName: "DEBIT AMOUNT",
      renderCell: ({ row }: TableRow) => (
        <span>
          {Number(row?.operationType) === 5
            ? `${row?.TransactionFee?.debitedAmount}`
            : Number(row?.operationType) === 2
              ? `${row?.TransactionFee.amount}`
              : "--"}
        </span>
      ),
    },
    {
      flex: 1,
      minWidth: 200,
      field: "creditedAmount",
      valueGetter: ({ row }: TableRow) => {
        return Number(row?.operationType) === 5
          ? `${row?.TransactionFee?.creditedAmount}`
          : Number(row?.operationType) === 1
            ? `${row?.TransactionFee.amount}`
            : "--";
      },

      headerName: "CREDIT AMOUNT",
      renderCell: ({ row }: TableRow) => (
        <span>
          {Number(row?.operationType) === 5
            ? `${row?.TransactionFee?.creditedAmount}`
            : Number(row?.operationType) === 1
              ? `${row?.TransactionFee.amount}`
              : "--"}
        </span>
      ),
    },

    {
      flex: 1,
      minWidth: 250,
      field: "rate",
      valueGetter: ({ row }: TableRow) => row?.TransactionFee?.rate,
      headerName: "PROVIDER RATE",
      renderCell: ({ row }: TableRow) => (
        <span>{row?.TransactionFee?.rate}</span>
      ),
    },

    {
      flex: 1,
      minWidth: 150,
      field: "clientRate",
      valueGetter: ({ row }: TableRow) => row?.TransactionFee?.clientRate,
      headerName: "CLIENT RATE",
      renderCell: ({ row }: TableRow) => (
        <span>{row?.TransactionFee?.clientRate || "--"}</span>
      ),
    },

    {
      flex: 1,
      minWidth: 250,
      field: "fxMarkUp",
      headerName: "FX MARKUP FEES",
      valueGetter: ({ row }: TableRow) => (
        <span>{calculateFxMarkupFees(row)}</span>
      ),
      renderCell: ({ row }: TableRow) => (
        <span>{calculateFxMarkupFees(row)}</span>
      ),
    },

    {
      flex: 1,
      minWidth: 150,
      field: "transactionFee",
      headerName: "Transaction Fee",

      // Corrected valueGetter
      valueGetter: ({ row }: TableRow) =>
        Number(row?.operationType) === 5
          ? Number(row?.TransactionFee?.transactionFee)
          : Number(row?.TransactionFee?.feeValue),

      // Corrected renderCell
      renderCell: ({ row }: TableRow) => (
        <span>
          {Number(row?.operationType) === 5
            ? Number(row?.TransactionFee?.transactionFee)
            : Number(row?.TransactionFee?.feeValue)}
        </span>
      ),
    },

    {
      flex: 1,
      minWidth: 150,
      field: "exchangeFee",
      headerName: "Exchange Fee",
      valueGetter: ({ row }: TableRow) => {
        return Number(row?.TransactionFee?.exchangeFee);
      },

      renderCell: ({ row }: TableRow) => (
        <span>{Number(row?.TransactionFee?.exchangeFee)}</span>
      ),
    },
  ];

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort({ field: "", sort: "" });
    }
  }, []);

  const onFilterChange = React.useCallback(
    (filterModel: any) => {
      setState((prevState) => ({
        ...prevState,
        [filterModel?.items[0]?.field]: filterModel?.items[0]?.value,
      }));
    },
    [setState],
  );

  function handleChangeStartDate(e: any) {
    setFromDate(e.target.value);
  }

  function handleChangeEndDate(e: any) {
    setToDate(e.target.value);
  }

  function handleClear() {
    setSort({ field: "", sort: "" });

    setState({
      clientName: undefined,
      sourceAddress: undefined,
      assetId: undefined,
      transactionId: undefined,
      operation: undefined,
      alert: undefined,
      debitedAmount: undefined,
      creditedAmount: undefined,
      transactionFee: undefined,
      exchangeFee: undefined,
      fxMarkUp: undefined,
      rate: undefined,
      clientRate: undefined,
    });
  }

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (clientName) paramsQuery.clientName = clientName;
    if (assetId) paramsQuery.currencyPair = assetId;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (transactionId) paramsQuery.transactionId = transactionId;
    if (operation) paramsQuery.operation = operation;
    if (debitedAmount) paramsQuery.debitedAmount = debitedAmount;
    if (creditedAmount) paramsQuery.creditedAmount = creditedAmount;
    if (transactionFee) paramsQuery.transactionFee = transactionFee;
    if (alert) paramsQuery.alert = alert;
    if (exchangeFee) paramsQuery.exchangeFee = exchangeFee;
    if (fxMarkUp) paramsQuery.fxMarkUp = fxMarkUp;
    if (rate) paramsQuery.rate = rate;
    if (clientRate) paramsQuery.clientRate = clientRate;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchChargedFees, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      const { id, createdAt, alert, assetId } = row;
      reportHeaderval.push({
        ID: id,
        "DATE AND TIME": formatDateTime(createdAt),
        "FEE TYPE": row?.OperationType?.displayName,
        "CLIENT NAME": `${row?.User?.firstname} ${" "} ${row?.User?.lastname}`,
        "SOURCE ADDRESS": row?.sourceAddress,
        ALERT: alert,
        "TOTAL FEES": calculateTotalFees(row),
        "TRANSACTION ID": row?.txHash,
        CURRENCY: TestCoinName(assetId),
        "CURRENCY PAIR":
          Number(row?.operationType) === 5
            ? `${TestCoinName(row?.assetId) ?? ""} - ${
                TestCoinName(row?.destinationAssetId) ?? ""
              }`
            : `${TestCoinName(row?.assetId) ?? ""} - ${
                TestCoinName(row?.assetId) ?? ""
              }`,
        "DEBIT AMOUNT":
          Number(row?.operationType) === 5
            ? `${row?.TransactionFee?.debitedAmount}`
            : Number(row?.operationType) === 2
              ? `${row?.TransactionFee.amount}`
              : "--",
        "CREDIT AMOUNT":
          Number(row?.operationType) === 5
            ? `${row?.TransactionFee?.creditedAmount}`
            : Number(row?.operationType) === 1
              ? `${row?.TransactionFee.amount}`
              : "--",
        "PROVIDER RATE": row?.TransactionFee?.rate,
        "CLIENT RATE": row?.TransactionFee?.clientRate,
        "FX MARKUP FEES": calculateFxMarkupFees(row),
        "TRANSACTION FEE":
          Number(row?.operationType) === 5
            ? Number(row?.TransactionFee?.transactionFee)
            : Number(row?.TransactionFee?.feeValue),
        "EXCHANGE FEE": Number(row?.TransactionFee?.exchangeFee),
      });
    });

    void ExportCsv(reportHeaderval, "Charged Fees");
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button size="small" onClick={handleExport}>
          Export
        </Button>
        <Button size="small" onClick={handleClear}>
          Clear
        </Button>
      </GridToolbarContainer>
    );
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

      {/* filters  */}

      {/* table component  */}
      <MuiDataGrid
        rows={chargedFees}
        columns={columns}
        loading={loading}
        rowCount={pageCount}
        slots={{
          toolbar: CustomToolbar,
        }}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        onFilterModelChange={onFilterChange}
        storageName={"Balances"}
        onSortModelChange={onSortChange}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />
    </ReportTabsLayout>
  );
};

export default ChargedFees;
