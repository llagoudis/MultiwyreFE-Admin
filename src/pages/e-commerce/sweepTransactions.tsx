import { Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

import {
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ExportCsv,
  formatDateTime,
  getStatusColor,
  getTodayAndLast10thDate,
} from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import StatusText from "~/components/common/StatusText";
import { fetchEcomSweepTransactions } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";

type TableRow = { row: EcomTransactionDetails };

const SweepTransactions = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();

  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);

  // columns
  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      minWidth: 200,
      field: "createdAt",
      headerName: "CREATED ON",
      renderCell: ({ row }: TableRow) => (
        <span>{formatDateTime(row?.createdAt) ?? "---"}</span>
      ),
    },
    {
      minWidth: 200,
      field: "firstname",
      headerName: "CLIENT NAME",
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/companies/view/${row?.Merchant?.User?.companyProfileId}`}
          className="text-blue-600 underline"
        >{`${
          row?.Merchant?.User
            ? `${row?.Merchant?.User.firstname} ${" "} ${row?.Merchant?.User.lastname}`
            : "---"
        } `}</Link>
      ),
    },
    {
      field: "merchantId",
      headerName: "MERCHANT",
      minWidth: 150,
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.Merchant?.projectName ? row?.Merchant?.projectName : "---"} `}</span>
      ),
    },

    {
      field: "widgetNumber",
      headerName: "UNIQUE ID",
      minWidth: 150,
    },

    {
      minWidth: 250,
      field: "note",
      headerName: "SWEEP TYPE",
      hidden: true,
      renderCell: ({ row }: TableRow) => {
        return (
          <span style={{ fontSize: "12px" }}>
            {row?.note === "SWEEP_FROM_MASTER_TO_LIQUIDITY"
              ? "SWEEP_LIQUIDITY"
              : row?.note}
          </span>
        );
      },
    },
    {
      field: "fromAddress",
      headerName: "SENDER ACCOUNT",
      minWidth: 350,
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.fromAddress ? row?.fromAddress : "---"} `}</span>
      ),
    },
    {
      field: "toAddress",
      minWidth: 350,
      headerName: "RECEIVER ACCOUNT",
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.toAddress ? row?.toAddress : "---"} `}</span>
      ),
    },

    {
      minWidth: 350,
      field: "transactionHash",
      headerName: "TRANSACTION ID",
      renderCell: ({ row }: TableRow) => (
        <span
          style={{ whiteSpace: "normal", wordBreak: "break-all" }}
        >{`${row?.transactionHash ? row?.transactionHash : "---"} `}</span>
      ),
    },

    {
      minWidth: 150,
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
      minWidth: 150,
      field: "assetId",
      headerName: "CURRENCY",
      valueGetter: ({ row }: TableRow) => {
        `${row?.assetId ? row?.assetId : "---"}
        `;
      },
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.assetId ? row?.assetId : "---"} 
        `}</span>
      ),
    },

    {
      minWidth: 200,
      field: "amount",
      headerName: "AMOUNT",
      valueGetter: ({ row }: TableRow) => row?.amount,
      renderCell: ({ row }: TableRow) => {
        return <span>{row?.amount ?? ""}</span>;
      },
    },
  ];

  const [reports, setReports] = useState<EcomTransactionDetails[]>([]);

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
    firstname: undefined,
    note: undefined,
    fromAddress: undefined,
    toAddress: undefined,
    transactionHash: undefined,
    status: undefined,
    assetId: undefined,
  });

  const {
    id,
    firstname,
    note,
    fromAddress,
    toAddress,
    transactionHash,
    status,
    assetId,
  } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);

    const [res, error]: APIResult<{
      data: EcomTransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchEcomSweepTransactions, data);

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
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (id) paramsQuery.id = id;
    if (firstname) paramsQuery.firstname = firstname;
    if (note) paramsQuery.note = note;
    if (fromAddress) paramsQuery.fromAddress = fromAddress;
    if (toAddress) paramsQuery.toAddress = toAddress;
    if (transactionHash) paramsQuery.transactionHash = transactionHash;
    if (transactionHash) paramsQuery.transactionHash = transactionHash;
    if (status) paramsQuery.status = status;
    if (assetId) paramsQuery.assetId = assetId;

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    void getReports(paramsQuery);
  }, [
    pagination,
    fromDate,
    toDate,
    id,
    firstname,
    note,
    fromAddress,
    toAddress,
    transactionHash,
    status,
    assetId,
    sort,
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
    };

    if (id) paramsQuery.id = id;
    if (firstname) paramsQuery.firstname = firstname;
    if (note) paramsQuery.note = note;
    if (fromAddress) paramsQuery.fromAddress = fromAddress;
    if (toAddress) paramsQuery.toAddress = toAddress;
    if (transactionHash) paramsQuery.transactionHash = transactionHash;
    if (transactionHash) paramsQuery.transactionHash = transactionHash;
    if (status) paramsQuery.status = status;
    if (assetId) paramsQuery.assetId = assetId;

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: EcomTransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchEcomSweepTransactions, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      const { id, createdAt, assetId } = row;
      reportHeaderval.push({
        ID: id,
        "CREATED ON": formatDateTime(createdAt),
        "CLIENT NAME": `${row?.Merchant?.User.firstname} ${" "} ${row?.Merchant?.User.lastname}`,
        MERCHANT: row?.Merchant?.projectName,
        "UNIQUE ID": row?.widgetNumber || null,

        "SWEEP TYPE":
          row?.note === "SWEEP_FROM_MASTER_TO_LIQUIDITY"
            ? "SWEEP_LIQUIDITY"
            : row?.note,
        "SENDER ACCOUNT": row?.fromAddress,
        "RECEIVER ACCOUNT": row?.toAddress,
        "TRANSACTION ID": row?.transactionHash,
        STATUS: row?.status,
        CURRENCY: `${assetId}`,
        AMOUNT: row?.amount,
      });
    });

    void ExportCsv(reportHeaderval, "SWEEP TRANSACTIONS");
  }

  function handleClear() {
    setState({
      id: undefined,
      firstname: undefined,
      note: undefined,
      fromAddress: undefined,
      toAddress: undefined,
      transactionHash: undefined,
      status: undefined,
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

export default SweepTransactions;
