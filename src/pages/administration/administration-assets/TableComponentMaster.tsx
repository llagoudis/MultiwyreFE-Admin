import React, { useEffect, useState, startTransition } from "react";
import { Button, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchAdminWalletTrxs } from "~/service/ApiRequests";
import {
  ExportCsv,
  formatDateTime,
  getTodayAndLast10thDate,
} from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

interface adminUsers {
  firstname: string;
  lastname: string;
}
interface Project {
  id: number;
  adminName: string;
  assetId: string;
  amount: string;
  feeValue: string;
  sourceAddress: string;
  destinationAddress: string;
  status: string;
  txHash: string;
  note: string;
  createdAt: string;
  AdminUser: adminUsers;
}

type TableRow = { row: Project };

type propType = {
  reload: boolean;
};
const TableComponentMaster = (reload: propType) => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const [fromDate, setFromDate] = useState<any>("2024-07-01");
  const [toDate, setToDate] = useState<any>(todayDate);

  const columns = [
    {
      minWidth: 50,
      field: "id",
      headerName: "ID",
      renderCell: ({ row }: TableRow) => <span>{row?.id ?? "---"}</span>,
    },
    {
      minWidth: 150,
      field: "createdAt",
      headerName: "CREATED AT",
      valueGetter: ({ row }: TableRow) => {
        return formatDateTime(row?.createdAt) ?? "---";
      },
      renderCell: ({ row }: TableRow) => (
        <span>{formatDateTime(row?.createdAt) ?? "---"}</span>
      ),
    },
    {
      minWidth: 250,
      field: "adminName",
      flex: 1,
      headerName: "ADMINISTRATOR NAME",
      renderCell: ({ row }: TableRow) => (
        <span>
          {row?.AdminUser?.firstname ?? "---"}{" "}
          {row?.AdminUser?.lastname ?? "---"}
        </span>
      ),
    },
    {
      minWidth: 450,
      flex: 1,
      field: "txHash",
      headerName: "TRX ID",
      renderCell: ({ row }: TableRow) => <span>{row?.txHash ?? "---"}</span>,
    },
    {
      minWidth: 400,
      flex: 1,
      field: "sourceAddress",
      headerName: "SOURCE ADDRESS",
      renderCell: ({ row }: TableRow) => (
        <span>{row?.sourceAddress ?? "---"}</span>
      ),
    },
    {
      minWidth: 400,
      flex: 1,
      field: "destinationAddress",
      headerName: "DESTINATION ADDRESS",
      renderCell: ({ row }: TableRow) => (
        <span>{row?.destinationAddress ?? "---"}</span>
      ),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "status",
      headerName: "STATUS",
      renderCell: ({ row }: TableRow) => <span>{row?.status ?? "---"}</span>,
    },
    {
      minWidth: 150,
      field: "assetId",
      flex: 1,
      headerName: "ASSET ID",
      renderCell: ({ row }: TableRow) => <span>{row?.assetId ?? "---"}</span>,
    },
    {
      minWidth: 150,
      flex: 1,
      field: "amount",
      headerName: "AMOUNT",
      renderCell: ({ row }: TableRow) => <span>{row?.amount ?? "---"}</span>,
    },
    // {
    //   minWidth: 150,
    //   flex: 1,
    //   field: "feeValue",
    //   headerName: "FEE VALUE",
    //   renderCell: ({ row }: TableRow) => <span>{row?.feeValue ?? "---"}</span>,
    // },
    // {
    //   minWidth: 150,
    //   flex: 1,
    //   field: "note",
    //   headerName: "NOTE",
    //   renderCell: ({ row }: TableRow) => <span>{row?.note ?? "---"}</span>,
    // },
  ];

  const [reports, setReports] = useState<Project[]>([]);

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
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
    adminName: undefined,
    assetId: undefined,
    amount: undefined,
    feeValue: undefined,
    sourceAddress: undefined,
    destinationAddress: undefined,
    status: undefined,
    txHash: undefined,
    note: undefined,
    createdAt: undefined,
  });

  const {
    id,
    adminName,
    assetId,
    amount,
    feeValue,
    sourceAddress,
    destinationAddress,
    status,
    txHash,
    note,
    createdAt,
  } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: Project[];
      pagination: Pagination;
    }> = await ApiHandler(fetchAdminWalletTrxs, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      startTransition(() => {
        setPageCount(res?.body?.pagination?.totalItems);
        setReports(res.body?.data);
      });
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
    if (createdAt) paramsQuery.createdAt = createdAt;
    if (adminName) paramsQuery.adminName = adminName;
    if (assetId) paramsQuery.assetId = assetId;
    if (amount) paramsQuery.amount = amount;
    if (feeValue) paramsQuery.feeValue = feeValue;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (destinationAddress) paramsQuery.destinationAddress = destinationAddress;
    if (status) paramsQuery.status = status;
    if (txHash) paramsQuery.txHash = txHash;
    if (note) paramsQuery.note = note;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    startTransition(() => {
      void getReports(paramsQuery);
    });
  }, [
    pagination,
    fromDate,
    toDate,
    id,
    adminName,
    assetId,
    amount,
    feeValue,
    sourceAddress,
    destinationAddress,
    status,
    txHash,
    note,
    createdAt,
    sort,
    reload,
  ]);

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
    if (createdAt) paramsQuery.createdAt = createdAt;
    if (adminName) paramsQuery.adminName = adminName;
    if (assetId) paramsQuery.assetId = assetId;
    if (amount) paramsQuery.amount = amount;
    if (feeValue) paramsQuery.feeValue = feeValue;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (destinationAddress) paramsQuery.destinationAddress = destinationAddress;
    if (status) paramsQuery.status = status;
    if (txHash) paramsQuery.txHash = txHash;
    if (note) paramsQuery.note = note;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: Project[];
      pagination: Pagination;
    }> = await ApiHandler(fetchAdminWalletTrxs, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.id,
        "CREATED AT": formatDateTime(row?.createdAt),
        "ADMINISTRATOR NAME": `${row?.AdminUser?.firstname} ${row?.AdminUser?.lastname}`,
        "ASSET ID": row?.assetId,
        AMOUNT: row?.amount,
        "FEE VALUE": row?.feeValue,
        "SOURCE ADDRESS": row?.sourceAddress,
        "DESTINATION ADDRESS": row?.destinationAddress,
        STATUS: row?.status,
        "TRX ID": row?.txHash,
        NOTE: row?.note,
      });
    });

    void ExportCsv(reportHeaderval, "Transactions Report");
  }

  function handleClear() {
    setState({
      id: undefined,
      adminName: undefined,
      assetId: undefined,
      amount: undefined,
      feeValue: undefined,
      sourceAddress: undefined,
      destinationAddress: undefined,
      status: undefined,
      txHash: undefined,
      note: undefined,
      createdAt: undefined,
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
      <div className=" flex flex-wrap gap-2 bg-[#E2E8F080] px-3 py-2">
        <div className="flex w-[200px]  flex-col gap-1">
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

        <div className="flex w-[200px] flex-col gap-1">
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
        storageName={"ManualTrxs"}
        getRowId={(row) => row.id}
        onSortModelChange={onSortChange}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />
    </>
  );
};

export default TableComponentMaster;
