import React, { useEffect, useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { useRouter } from "next/router";
import { ApiHandler } from "~/service/UtilService";
import { fetchReportTransactions } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import {
  ExportCsv,
  TestCoinName,
  formatDateTime,
  getTodayAndLast10thDate,
} from "~/common/functions";
import Link from "next/link";
import {
  GridActionsCellItem,
  GridFilterModel,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

export interface currencyType {
  id: number;
  name: string;
}

interface filterType {
  label: string;
  name: string;
}
type TableRow = { row: TransactionDetails };

// filter options
const filters: filterType[] = [
  { label: "Transaction ID", name: "id" },
  { label: "Debt Amount", name: "debit_amount" },
  { label: "Currency", name: "currency" },
  { label: "Credit Amount", name: "credit_amount" },
  { label: "Rate", name: "rate" },
  { label: "Type", name: "type" },
  { label: "Status", name: "status" },
  { label: "Created ay", name: "created_at" },
  { label: "Processed at", name: "processed_at" },
];

const Orders = () => {
  // router
  const router = useRouter();
  const [orders, setOrders] = useState<TransactionDetails[]>([]);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setTableLoading] = useState(false);
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);

  const getReports = async (data: FilterType) => {
    setTableLoading(true);

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchReportTransactions, data);
    setTableLoading(false);

    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      setOrders(res.body?.data);
      setPageCount(res?.body?.pagination?.totalItems);
    }
  };

  const [state, setState] = React.useState({
    clientName: undefined,
    transactionId: undefined,
    clientId: undefined,
    assetId: undefined,
    debitedAmount: undefined,
    creditedAmount: undefined,
    orderType: undefined,
    rate: undefined,
    status: undefined,
  });

  const [sort, setSort] = useState({
    field: "",
    sort: "",
  });

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort({ field: "", sort: "" });
    }
  }, []);

  const {
    clientName,
    transactionId,
    clientId,
    assetId,
    debitedAmount,
    creditedAmount,
    orderType,
    rate,
    status,
  } = state;

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      operation: "EXCHANGE",
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (clientName) paramsQuery.clientName = clientName;
    if (transactionId) paramsQuery.transactionId = transactionId;
    if (clientId) paramsQuery.clientId = clientId;
    if (assetId) paramsQuery.assetId = assetId;
    if (debitedAmount) paramsQuery.debitedAmount = debitedAmount;
    if (creditedAmount) paramsQuery.creditedAmount = creditedAmount;
    if (orderType) paramsQuery.orderType = orderType;
    if (rate) paramsQuery.rate = rate;
    if (status) paramsQuery.status = status;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    void getReports(paramsQuery);
  }, [
    pagination,
    fromDate,
    toDate,
    clientName,
    transactionId,
    clientId,
    assetId,
    debitedAmount,
    orderType,
    creditedAmount,
    rate,
    sort,
    status,
  ]);

  const columns = [
    {
      field: "transactionId",
      headerName: "TRANSACTION ID",
      valueGetter: (params: { row: any }) => params?.row?.transactionId,

      width: 250,
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/exchange/orders/view/${row.transactionId}`}
          className="text-blue-600 underline"
        >
          {`${row.transactionId || ""}`}
        </Link>
      ),
    },

    {
      field: "clientId",
      headerName: "CLIENT ID",
      width: 100,
      valueGetter: (params: { row: any }) => params?.row?.User?.id,
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/individuals/view/${row?.User?.azureId}`}
          className="text-blue-600 underline"
        >
          {row?.User?.id}
        </Link>
      ),
    },

    {
      field: "clientName",
      minWidth: 200,
      headerName: "CLIENT NAME",
      flex: 1,
      valueGetter: ({ row }: TableRow) => {
        return `${row?.User?.firstname ?? ""} ${row.User?.lastname ?? ""}`;
      },
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/individuals/view/${row?.User?.azureId}`}
          className="text-blue-600 underline"
        >
          {`${row?.User?.firstname ?? ""} ${row.User?.lastname ?? ""}`}
        </Link>
      ),
    },
    {
      minWidth: 250,
      field: "assetId",
      headerName: "CURRENCY",
      valueGetter: ({ row }: TableRow) => {
        return `${row?.assetId || ""} - ${row?.destinationAssetId || ""}`;
      },
      flex: 1,
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.assetId || ""} - ${row?.destinationAssetId || ""}`}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "debitedAmount",
      valueGetter: ({ row }: TableRow) => row?.TransactionFee?.debitedAmount,

      headerName: "DEBIT AMOUNT",
      renderCell: ({ row }: TableRow) => (
        <p> {row?.TransactionFee?.debitedAmount} </p>
      ),
    },

    {
      flex: 1,
      minWidth: 150,
      field: "creditedAmount",
      headerName: "CREDIT AMOUNT",

      valueGetter: ({ row }: TableRow) => {
        return `${Number(row?.TransactionFee?.creditedAmount)}`;
      },
      renderCell: ({ row }: TableRow) => (
        <p>{`${Number(row?.TransactionFee?.creditedAmount)}`}</p>
      ),
    },

    {
      flex: 1,
      minWidth: 150,
      field: "rate",
      headerName: "PROVIDER RATE",
      valueGetter: ({ row }: TableRow) => row?.TransactionFee?.rate,

      renderCell: ({ row }: TableRow) => <p> {row?.TransactionFee?.rate} </p>,
    },

    {
      flex: 1,
      minWidth: 100,
      field: "orderType",
      headerName: "TYPE",
      renderCell: ({ row }: TableRow) => <p>{row?.orderType ?? "---"}</p>,
    },

    {
      flex: 1,
      minWidth: 150,
      field: "status",
      valueGetter: ({ row }: TableRow) => {
        const pendingStatuses = new Set([
          "PENDING_BLOCKCHAIN_CONFIRMATIONS",
          "SUBMITTED",
          "PENDING_AML_SCREENING",
          "PENDING_ENRICHMENT",
          "PENDING_AUTHORIZATION",
          "QUEUED",
          "PENDING_SIGNATURE",
          "PENDING_3RD_PARTY_MANUAL_APPROVAL",
          "PENDING_3RD_PARTY",
          "BROADCASTING",
          "CONFIRMING",
          "CANCELLING",
        ]);

        if (pendingStatuses.has(row?.status)) {
          return "PENDING";
        } else if (row?.status === "COMPLETED") {
          return "COMPLETED";
        } else {
          return String(row?.status) || "";
        }
      },
      headerName: "STATUS",
      renderCell: ({ row }: TableRow) => {
        const pendingStatuses = new Set([
          "PENDING_BLOCKCHAIN_CONFIRMATIONS",
          "SUBMITTED",
          "PENDING_AML_SCREENING",
          "PENDING_ENRICHMENT",
          "PENDING_AUTHORIZATION",
          "QUEUED",
          "PENDING_SIGNATURE",
          "PENDING_3RD_PARTY_MANUAL_APPROVAL",
          "PENDING_3RD_PARTY",
          "BROADCASTING",
          "CONFIRMING",
          "CANCELLING",
        ]);

        if (pendingStatuses.has(row?.status)) {
          return "PENDING";
        } else if (row?.status === "COMPLETED") {
          return "COMPLETED";
        } else {
          return String(row?.status) || "";
        }
      },
    },

    {
      flex: 1,
      minWidth: 200,
      field: "createdAt",
      headerName: "CREATED AT",
      valueGetter: (params: { row: any }) =>
        formatDateTime(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <a>{formatDateTime(row?.createdAt)}</a>
      ),
    },

    // {
    //   flex: 1,
    //   minWidth: 200,
    //   field: "processed_at",
    //   headerName: "PROCESSED AT",
    // },

    {
      field: "actions",
      type: "actions",
      // headerName: "ACTIONS",
      getActions: ({ row }: TableRow) => [
        <GridActionsCellItem
          key="view"
          label="View"
          showInMenu
          onClick={() => {
            onNavigation(`/exchange/orders/view/${row?.transactionId}`);
          }}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            // borderBottom: "1px solid #cdcdcd",
            width: "6rem",
            fontSize: "14px",
          }}
        />,
      ],
    },
  ];

  // page Navigation
  const onNavigation = (path: string) => {
    void router.push(path);
  };
  function handleChangeStartDate(e: any) {
    setFromDate(e.target.value);
  }

  function handleChangeEndDate(e: any) {
    setToDate(e.target.value);
  }

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
      operation: "EXCHANGE",
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (clientName) paramsQuery.clientName = clientName;
    if (transactionId) paramsQuery.transactionId = transactionId;
    if (clientId) paramsQuery.clientId = clientId;
    if (assetId) paramsQuery.clientId = assetId;
    if (debitedAmount) paramsQuery.debitedAmount = debitedAmount;
    if (creditedAmount) paramsQuery.creditedAmount = creditedAmount;
    if (orderType) paramsQuery.orderType = orderType;
    if (rate) paramsQuery.rate = rate;
    if (status) paramsQuery.status = status;
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
      const {
        id,
        createdAt,
        transactionId,
        assetId,
        destinationAssetId,
        orderType,
        status,
      } = row;
      reportHeaderval.push({
        ID: id,
        "TRANSACTION ID": transactionId,
        "CLIENT ID": row?.User?.id,
        "CLIENT NAME": `${row?.User?.firstname} ${" "} ${row?.User?.lastname}`,
        CURRENCY: `${assetId || ""} - ${destinationAssetId || ""}`,
        "DEBIT AMOUNT": row?.TransactionFee?.debitedAmount,
        "CREDIT AMOUNT": row?.TransactionFee?.creditedAmount,
        "PROVIDER RATE": row?.TransactionFee?.rate,
        TYPE: orderType,
        STATUS: status,
        "CREATED AT": formatDateTime(createdAt),
      });
    });

    void ExportCsv(reportHeaderval, "Orders");
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

  function handleClear() {
    setState({
      clientName: undefined,
      transactionId: undefined,
      clientId: undefined,
      assetId: undefined,
      debitedAmount: undefined,
      creditedAmount: undefined,
      orderType: undefined,
      rate: undefined,
      status: undefined,
    });
  }
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
    <div className="">
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
      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={orders}
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
        </Box>
      </div>
    </div>
  );
};

export default Orders;
