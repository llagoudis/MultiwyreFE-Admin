import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";

import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchSweepTransactions } from "~/service/ApiRequests";
import Link from "next/link";
import {
  ExportCsv,
  formatDateTime,
  getStatusColor,
  getTodayAndLast10thDate,
} from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import StatusText from "~/components/common/StatusText";

type TableRow = { row: TransactionDetails };

const AllTransactions = () => {
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
      field: "note",
      headerName: "NOTE",
      hidden: true,
      minWidth: 250,
    },
    {
      field: "sourceAddress",
      headerName: "SENDER ACCOUNT",
      hidden: true,
      minWidth: 350,
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.sourceAddress ? row?.sourceAddress : "---"} `}</span>
      ),
    },
    {
      field: "destinationAddress",
      minWidth: 350,
      headerName: "RECEIVER ACCOUNT",
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.destinationAddress ? row?.destinationAddress : "---"} `}</span>
      ),
    },

    {
      minWidth: 300,
      field: "transactionId",
      headerName: "TRANSACTION ID",
      renderCell: ({ row }: TableRow) => (
        <span
          style={{ whiteSpace: "normal", wordBreak: "break-all" }}
        >{`${row?.txHash ? row?.txHash : "---"} `}</span>
      ),
    },

    {
      minWidth: 300,
      field: "status",
      headerName: "STATUS",
      renderCell: ({ row }: TableRow) => {
        const color = getStatusColor(row?.status ?? "");
        return (
          <StatusText color={color}>{String(row?.status) || ""}</StatusText>
        );
      },
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

    {
      minWidth: 200,
      field: "amount",
      headerName: "AMOUNT",
      valueGetter: ({ row }: TableRow) => row?.TransactionFee?.amount,
      renderCell: ({ row }: TableRow) => {
        return <span>{row?.TransactionFee?.amount ?? ""}</span>;
      },
    },

    {
      minWidth: 200,
      field: "isSweepNotified",
      headerName: "NOTIFIED",
      renderCell: ({ row }: TableRow) => {
        return <span>{row?.isSweepNotified ? "Yes" : "No"}</span>;
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
    amount: undefined,
    transactionId: undefined,
    destinationAddress: undefined,
    isSweepNotified: undefined,
    status: undefined,
  });

  const {
    clientName,
    assetId,
    sourceAddress,
    transactionId,
    operation,
    destinationAddress,
    id,
    amount,
    isSweepNotified,
    status,
  } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchSweepTransactions, data);

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
      note: "COMMISSION_TRANSACTION",
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (id) paramsQuery.id = id;
    if (clientName) paramsQuery.clientName = clientName;
    if (assetId) paramsQuery.assetId = assetId;
    if (operation) paramsQuery.operation = operation;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (amount) paramsQuery.amount = amount;
    if (isSweepNotified)
      paramsQuery.isSweepNotified =
        (isSweepNotified as string).toLowerCase() === "yes" ? true : false;
    if (transactionId) paramsQuery.transactionId = transactionId;
    if (destinationAddress) paramsQuery.destinationAddress = destinationAddress;
    if (status) paramsQuery.status = status;

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
    assetId,
    id,
    sort,
    transactionId,
    isSweepNotified,
    destinationAddress,
    status,
    amount,
  ]);

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
      note: "COMMISSION_TRANSACTION",
    };

    if (id) paramsQuery.id = id;
    if (clientName) paramsQuery.clientName = clientName;
    if (assetId) paramsQuery.currencyPair = assetId;
    if (operation) paramsQuery.operation = operation;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (isSweepNotified)
      paramsQuery.isSweepNotified =
        (isSweepNotified as string).toLowerCase() === "yes" ? true : false;
    if (transactionId) paramsQuery.transactionId = transactionId;
    if (destinationAddress) paramsQuery.destinationAddress = destinationAddress;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchSweepTransactions, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      const { id, createdAt, transactionId, assetId } = row;
      reportHeaderval.push({
        ID: id,
        "DATE AND TIME": formatDateTime(createdAt),
        "CLIENT NAME": `${row?.User?.firstname} ${" "} ${row?.User?.lastname}`,
        NOTE: "COMMISSION_TRANSACTION",
        "SENDER ACCOUNT": row?.sourceAddress,
        "RECEIVER ACCOUNT": row?.destinationAddress,
        "TRANSACTION ID": row?.txHash,
        STATUS: row?.status,
        CURRENCY: `${assetId} ${row?.destinationAssetId ? "-" : ""} ${
          row?.destinationAssetId ?? ""
        }`,
        AMOUNT: row?.TransactionFee?.amount,
        NOTIFIED: row?.isSweepNotified ? "Yes" : "No",
      });
    });

    void ExportCsv(reportHeaderval, "Transactions Report");
  }

  function handleClear() {
    setState({
      id: undefined,
      clientName: undefined,
      operation: undefined,
      sourceAddress: undefined,
      amount: undefined,
      transactionId: undefined,
      destinationAddress: undefined,
      assetId: undefined,
      isSweepNotified: undefined,
      status: undefined,
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
    <>
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
        storageName={"sweepTransactions"}
        onSortModelChange={onSortChange}
        pageSizeOptions={[10]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />
    </>
  );
};

export default AllTransactions;
