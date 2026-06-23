import React, { useEffect, useState, startTransition } from "react";
import { Button, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { merchantsTurnover } from "~/service/ApiRequests";
import {
  ExportCsv,
  formatDateTime,
  getTodayAndLast10thDate,
} from "~/common/functions";
import ReportTabsLayout from "~/components/ReportTabsLayout";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import EcomReportTabsLayout from "~/components/EcomReportTabsLayout";

interface User {
  azureId: string;
  firstname: string;
  lastname: string;
}

interface Project {
  totalValueIneurType2: string;
  totalValueIneurType1: string;
  totalTransactionsType2: string;
  totalTransactionsType1: string;
  projectId: number;
  projectName: string;
  companyId: string;
  User: User;
  totalTransactions: number;
  totalValueIneur: number;
  createdAt: string;
}

type TableRow = { row: Project };
const MerchantTurnover = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const [fromDate, setFromDate] = useState<any>("2024-07-01");
  const [toDate, setToDate] = useState<any>(todayDate);

  const columns = [
    {
      minWidth: 50,
      field: "id",
      headerName: "ID",
      renderCell: ({ row }: TableRow) => <p>{row?.projectId ?? "---"}</p>,
    },
    {
      minWidth: 200,
      field: "createdAt",
      headerName: "CREATED AT",
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.createdAt) ?? "---"}</p>
      ),
    },
    {
      minWidth: 200,
      field: "firstname",
      flex: 1,
      headerName: "COMPANY",
      renderCell: ({ row }: TableRow) => <p>{row?.User?.firstname ?? "---"}</p>,
    },
    {
      minWidth: 200,
      flex: 1,
      field: "projectName",
      headerName: "PROJECT",
      renderCell: ({ row }: TableRow) => <p>{row?.projectName ?? "---"}</p>,
    },
    {
      minWidth: 100,
      field: "currency",
      flex: 1,
      headerName: "CURRENCY",
      renderCell: ({ row }: TableRow) => <p>EUR</p>,
    },
    {
      minWidth: 150,
      flex: 1,
      field: "totalValueIneur",
      headerName: "INCOMING AMOUNT",
      renderCell: ({ row }: TableRow) => (
        <p>{row?.totalValueIneurType1 ?? "---"}</p>
      ),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "outgoingAmount",
      headerName: "OUTGOING AMOUNT",
      renderCell: ({ row }: TableRow) => (
        <p>{row?.totalValueIneurType2 ?? "---"}</p>
      ),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "totalTransactions",
      headerName: "INCOMING COUNT",
      renderCell: ({ row }: TableRow) => (
        <p>{row?.totalTransactionsType1 ?? "---"}</p>
      ),
    },
    {
      minWidth: 200,
      flex: 1,
      field: "outgoingCount",
      headerName: "OUTGOING COUNT",
      renderCell: ({ row }: TableRow) => (
        <p>{row?.totalTransactionsType2 ?? "---"}</p>
      ),
    },
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
    createdAt: undefined,
    firstname: undefined,
    projectName: undefined,
    currency: undefined,
    totalValueIneur: undefined,
    outgoingAmount: undefined,
    totalTransactions: undefined,
    outgoingCount: undefined,
  });

  const {
    createdAt,
    firstname,
    projectName,
    currency,
    totalValueIneur,
    outgoingAmount,
    totalTransactions,
    outgoingCount,
  } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: Project[];
      pagination: Pagination;
    }> = await ApiHandler(merchantsTurnover, data);
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

    if (createdAt) paramsQuery.createdAt = createdAt;
    if (firstname) paramsQuery.firstname = firstname;
    if (projectName) paramsQuery.projectName = projectName;
    if (currency) paramsQuery.currency = currency;
    if (totalValueIneur) paramsQuery.totalValueIneur = totalValueIneur;
    if (outgoingAmount) paramsQuery.outgoingAmount = outgoingAmount;
    if (totalTransactions) paramsQuery.totalTransactions = totalTransactions;
    if (outgoingCount) paramsQuery.outgoingCount = outgoingCount;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    startTransition(() => {
      void getReports(paramsQuery);
    });
  }, [
    pagination,
    fromDate,
    toDate,
    createdAt,
    firstname,
    projectName,
    currency,
    totalValueIneur,
    outgoingAmount,
    totalTransactions,
    outgoingCount,
    sort,
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

    if (createdAt) paramsQuery.createdAt = createdAt;
    if (firstname) paramsQuery.firstname = firstname;
    if (projectName) paramsQuery.projectName = projectName;
    if (currency) paramsQuery.currency = currency;
    if (totalValueIneur) paramsQuery.totalValueIneur = totalValueIneur;
    if (outgoingAmount) paramsQuery.outgoingAmount = outgoingAmount;
    if (totalTransactions) paramsQuery.totalTransactions = totalTransactions;
    if (outgoingCount) paramsQuery.outgoingCount = outgoingCount;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: Project[];
      pagination: Pagination;
    }> = await ApiHandler(merchantsTurnover, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.projectId,
        "CREATED AT": formatDateTime(row?.createdAt),
        COMPANY: row?.User?.firstname,
        PROJECT: row?.projectName,
        CURRENCY: "EUR",
        "INCOMING AMOUNT": row?.totalValueIneurType1,
        "OUTGOING AMOUNT": row?.totalValueIneurType2,
        "INCOMING COUNT": row?.totalTransactionsType1,
        "OUTGOING COUNT": row?.totalTransactionsType2,
      });
    });

    void ExportCsv(reportHeaderval, "Transactions Report");
  }

  function handleClear() {
    setState({
      createdAt: undefined,
      firstname: undefined,
      projectName: undefined,
      currency: undefined,
      totalValueIneur: undefined,
      outgoingAmount: undefined,
      totalTransactions: undefined,
      outgoingCount: undefined,
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
      <EcomReportTabsLayout>
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
          storageName={"AllTransactions"}
          getRowId={(row) => row.projectId}
          onSortModelChange={onSortChange}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
        />
      </EcomReportTabsLayout>
    </>
  );
};

export default MerchantTurnover;
