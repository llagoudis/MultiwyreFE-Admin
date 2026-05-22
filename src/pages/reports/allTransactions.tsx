import React, { useEffect, useState } from "react";
import {
  Button,
  // ClickAwayListener,
  // Fade,
  // LinearProgress,
  // Paper,
  // Popper,
  TextField,
} from "@mui/material";
// import Image, { type StaticImageData } from "next/image";
// import FilterBtn from "~/assets/general/sortlines.svg";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchReportTransactions } from "~/service/ApiRequests";
import Link from "next/link";
import {
  ExportCsv,
  // NoDataFound,
  formatDateTime,
  getStatusColor,
  getTodayAndLast10thDate,
} from "~/common/functions";
import ReportTabsLayout from "~/components/ReportTabsLayout";
// import MuiButton from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  GridFilterModel,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import StatusText from "~/components/common/StatusText";
// import { GridToolbar } from "@mui/x-data-grid";

interface filterType {
  label: string;
  name: string;
}

type TableRow = { row: TransactionDetails };

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
    { label: "Status", name: "status" },
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
    "status",
    "alert",
  ]);

  // mui popper position
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
  // date

  const { todayDate, last10thDate } = getTodayAndLast10thDate();

  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);

  // columns
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      minWidth: 200,
      field: "createdAt",
      headerName: "DATE AND TIME",
      renderCell: ({ row }: TableRow) => (
        <span>{formatDateTime(row?.createdAt) ?? "---"}</span>
      ),
    },
    {
      minWidth: 250,
      field: "clientName",
      headerName: "CLIENT NAME",
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/individuals/view/${row?.User?.azureId}`}
          className="text-blue-600 underline"
        >{`${
          row?.User
            ? `${row?.User.firstname} ${" "} ${row?.User.lastname}`
            : "---"
        } `}</Link>
      ),
    },
    {
      field: "operation",
      headerName: "TRANSACTION TYPE",
      hidden: true,
      minWidth: 200,
      valueGetter: ({ row }: TableRow) => row?.OperationType?.displayName,
      renderCell: ({ row }: TableRow) => (
        <span>
          {`${
            row?.OperationType?.displayName
              ? row?.OperationType?.displayName
              : ""
          } `}
        </span>
      ),
    },
    {
      field: "sourceAddress",
      headerName: "SENDER ACCOUNT",
      hidden: true,
      minWidth: 320,
      renderCell: ({ row }: TableRow) => (
        <span
          style={{ whiteSpace: "normal", wordBreak: "break-all" }}
        >{`${row?.sourceAddress ? row?.sourceAddress : "---"} `}</span>
      ),
    },
    {
      field: "destinationAddress",
      minWidth: 320,
      headerName: "RECEIVER ACCOUNT",
      renderCell: ({ row }: TableRow) => (
        <span
          style={{ whiteSpace: "normal", wordBreak: "break-all" }}
        >{`${row?.destinationAddress ? row?.destinationAddress : "---"} `}</span>
      ),
    },

    {
      minWidth: 300,
      field: "txHash",
      headerName: "TRANSACTION ID",
      renderCell: ({ row }: TableRow) => (
        <span
          style={{ whiteSpace: "normal", wordBreak: "break-all" }}
        >{`${row?.txHash ? `${row?.txHash}` : "---"} `}</span>
      ),
    },

    {
      minWidth: 200,
      field: "feeValue",
      valueGetter: ({ row }: TableRow) => row?.TransactionFee?.feeValue,
      headerName: "TRANSACTION FEE",
      renderCell: ({ row }: TableRow) => (
        <span>
          {`${
            row?.TransactionFee?.feeValue
              ? row?.TransactionFee?.feeValue
              : "---"
          } `}
        </span>
      ),
    },

    {
      minWidth: 200,
      field: "assetId",
      headerName: "CURRENCY",
      valueGetter: ({ row }: TableRow) => {
        `${row?.assetId} ${row?.destinationAssetId ? "-" : ""} ${
          row?.destinationAssetId ?? ""
        } `;
      },
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.assetId} ${row?.destinationAssetId ? "-" : ""} ${
          row?.destinationAssetId ?? ""
        } `}</span>
      ),
    },

    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "feeCurrency",
    //   headerName: "CURRENCY",
    //   renderCell: ({ row }: TableRow) => {
    //     return <span>{row?.TransactionFee?.feeCurrency ?? "---"}</span>;
    //   },
    // },

    {
      minWidth: 200,
      field: "debitedAmount",
      headerName: "DEBITED AMOUNT",
      valueGetter: ({ row }: TableRow) =>
        row?.OperationType.id == 2
          ? row?.TransactionFee?.amount
          : row?.OperationType.id == 5
            ? row?.TransactionFee?.debitedAmount
            : "---",

      renderCell: ({ row }: TableRow) => {
        return (
          <span>
            {row?.OperationType.id == 2
              ? row?.TransactionFee?.amount
              : row?.OperationType.id == 5
                ? row?.TransactionFee?.debitedAmount
                : "---"}
          </span>
        );
      },
    },

    {
      minWidth: 200,
      field: "creditedAmount",
      headerName: "CREDITED AMOUNT",
      valueGetter: ({ row }: TableRow) =>
        row?.OperationType.id == 1
          ? row?.TransactionFee?.amount
          : row?.OperationType.id == 5
            ? row?.TransactionFee?.creditedAmount
            : "---",
      renderCell: ({ row }: TableRow) => (
        <span>
          {row?.OperationType.id == 1
            ? row?.TransactionFee?.amount
            : row?.OperationType.id == 5
              ? row?.TransactionFee?.creditedAmount
              : "---"}
        </span>
      ),
    },

    {
      minWidth: 200,
      field: "rate",
      headerName: "RATE",
      renderCell: ({ row }: TableRow) => {
        return <span>{row?.TransactionFee?.rate ?? "---"}</span>;
      },
    },
    {
      field: "status",
      headerName: "STATUS",
      hidden: true,
      minWidth: 170,
      valueGetter: ({ row }: TableRow) => row?.status,
      renderCell: ({ row }: TableRow) => {
        const color = getStatusColor(row?.status ?? "");
        return (
          <StatusText color={color}>{String(row?.status) || ""}</StatusText>
        );
      },
    },
  ];

  const [reports, setReports] = useState<TransactionDetails[]>([]);

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState({
    field: "",
    sort: "",
  });
  const [state, setState] = React.useState({
    id: undefined,
    clientName: undefined,
    assetId: undefined,
    operation: undefined,
    sourceAddress: undefined,
    debitedAmount: undefined,
    creditedAmount: undefined,
    rate: undefined,
    status: undefined,
    txHash: undefined,
    destinationAddress: undefined,
    feeValue: undefined,
  });

  const {
    clientName,
    assetId,
    sourceAddress,
    debitedAmount,
    creditedAmount,
    rate,
    status,
    txHash,
    operation,
    destinationAddress,
    feeValue,
    id,
  } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchReportTransactions, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      setPageCount(res?.body?.pagination?.totalItems);
      setReports(res.body?.data);
    }
  };

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      // operation: "TRANSFER",
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (id) paramsQuery.id = id;
    if (clientName) paramsQuery.clientName = clientName;
    if (assetId) paramsQuery.assetId = assetId;
    if (operation) paramsQuery.reportBankTtype = operation;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (debitedAmount) paramsQuery.debitedAmount = debitedAmount;
    if (creditedAmount) paramsQuery.creditedAmount = creditedAmount;
    if (feeValue) paramsQuery.feeValue = feeValue;
    if (rate) paramsQuery.rate = rate;
    if (status) paramsQuery.status = status;
    if (txHash) paramsQuery.txHash = txHash;
    if (destinationAddress) paramsQuery.destinationAddress = destinationAddress;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    void getReports(paramsQuery);
  }, [
    pagination,
    fromDate,
    toDate,
    clientName,
    assetId,
    operation,
    sourceAddress,
    debitedAmount,
    creditedAmount,
    rate,
    status,
    assetId,
    id,
    sort,
    txHash,
    feeValue,
    destinationAddress,
  ]);

  const handleColumnVisibilityChange = (columns: any) => {
    setColumns(columns);
    const columnsJSON = JSON.stringify(columns);
    localStorage.setItem("AllTransactions", columnsJSON);
  };

  const [col, setColumns] = useState<any>(null);
  useEffect(() => {
    const storedColumnsJSON = localStorage.getItem("AllTransactions");
    if (storedColumnsJSON) {
      const storedColumns = JSON.parse(storedColumnsJSON);
      setColumns(storedColumns);
    }
  }, []);

  function handleChangeStartDate(e: any) {
    setFromDate(e.target.value);
  }

  function handleChangeEndDate(e: any) {
    setToDate(e.target.value);
  }

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (id) paramsQuery.id = id;
    if (clientName) paramsQuery.clientName = clientName;
    if (assetId) paramsQuery.assetId = assetId;
    if (operation) paramsQuery.reportBankTtype = operation;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (debitedAmount) paramsQuery.debitedAmount = debitedAmount;
    if (creditedAmount) paramsQuery.creditedAmount = creditedAmount;
    if (feeValue) paramsQuery.feeValue = feeValue;
    if (rate) paramsQuery.rate = rate;
    if (status) paramsQuery.status = status;
    if (txHash) paramsQuery.txHash = txHash;
    if (destinationAddress) paramsQuery.destinationAddress = destinationAddress;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchReportTransactions, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      const { id, createdAt, assetId } = row;
      reportHeaderval.push({
        ID: id,
        "DATE AND TIME": formatDateTime(createdAt),
        "CLIENT NAME": `${row?.User?.firstname} ${" "} ${row?.User?.lastname}`,
        "TRANSACTION TYPE": row?.OperationType?.displayName,
        "SENDER ACCOUNT": row?.sourceAddress,
        "RECEIVER ACCOUNT": row?.destinationAddress,
        "TRANSACTION ID": row?.txHash,
        "TRANSACTION FEE": row?.TransactionFee?.feeValue,
        CURRENCY: `${assetId} ${row?.destinationAssetId ? "-" : ""} ${
          row?.destinationAssetId ?? ""
        }`,
        "DEBITED AMOUNT":
          row?.OperationType.id == 2
            ? row?.TransactionFee?.amount
            : row?.OperationType.id == 5
              ? row?.TransactionFee?.debitedAmount
              : "---",
        "CREDITED AMOUNT":
          row?.OperationType.id == 1
            ? row?.TransactionFee?.amount
            : row?.OperationType.id == 5
              ? row?.TransactionFee?.creditedAmount
              : "---",

        RATE: row?.TransactionFee?.rate,
        STATUS: row?.status,
      });
    });

    void ExportCsv(reportHeaderval, "Transactions Report");
  }

  function handleClear() {
    setState({
      id: undefined,
      clientName: undefined,
      feeValue: undefined,
      operation: undefined,
      sourceAddress: undefined,
      debitedAmount: undefined,
      creditedAmount: undefined,
      rate: undefined,
      status: undefined,
      txHash: undefined,
      destinationAddress: undefined,
      assetId: undefined,
    });
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
        rows={reports}
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
        storageName={"AllTransactions"}
        onSortModelChange={onSortChange}
        pageSizeOptions={[10]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />
    </ReportTabsLayout>
  );
};

export default AllTransactions;
