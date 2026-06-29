import React, { useEffect, useState, startTransition } from "react";
import { Button, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchEcomProjectFees } from "~/service/ApiRequests";
import {
  ExportCsv,
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
import EcomReportTabsLayout from "~/components/EcomReportTabsLayout";

interface User {
  azureId: string;
  firstname: string;
  lastname: string;
  companyProfileId: string;
}

// Per project, per currency fee aggregation. Backend: ecomtransaction/project-fees
interface ProjectFee {
  projectId: number;
  projectName: string;
  companyId: string;
  User: User;
  currency: string;
  markupFee: string;
  networkFee: string;
}

type TableRow = { row: ProjectFee };

const ProjectFees = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const projectFeesEnabled =
    process.env.NEXT_PUBLIC_FEATURE_PROJECT_FEES === "true";
  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);

  const columns = [
    {
      minWidth: 200,
      field: "firstname",
      flex: 1,
      headerName: "COMPANY",
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.User?.firstname ?? ""} ${row?.User?.lastname ?? ""}`}</p>
      ),
    },
    {
      minWidth: 200,
      flex: 1,
      field: "projectName",
      headerName: "PROJECT",
      renderCell: ({ row }: TableRow) => <p>{row?.projectName ?? "---"}</p>,
    },
    {
      minWidth: 120,
      field: "currency",
      headerName: "CURRENCY",
      renderCell: ({ row }: TableRow) => <p>{row?.currency ?? "---"}</p>,
    },
    {
      minWidth: 180,
      flex: 1,
      field: "markupFee",
      headerName: "MARK-UP FEE",
      align: "right" as const,
      headerAlign: "right" as const,
      renderCell: ({ row }: TableRow) => <p>{row?.markupFee ?? "---"}</p>,
    },
    {
      minWidth: 180,
      flex: 1,
      field: "networkFee",
      headerName: "NETWORK FEE",
      align: "right" as const,
      headerAlign: "right" as const,
      renderCell: ({ row }: TableRow) => <p>{row?.networkFee ?? "---"}</p>,
    },
  ];

  const [reports, setReports] = useState<ProjectFee[]>([]);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState({ field: "", sort: "" });
  const [state, setState] = React.useState({
    firstname: undefined,
    projectName: undefined,
    currency: undefined,
    markupFee: undefined,
    networkFee: undefined,
  });

  const { firstname, projectName, currency, markupFee, networkFee } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: ProjectFee[];
      pagination: Pagination;
    }> = await ApiHandler(fetchEcomProjectFees, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load project fees");
    }
    if (res?.success && res.body?.data) {
      startTransition(() => {
        setPageCount(res?.body?.pagination?.totalItems);
        setReports(res.body?.data);
      });
    }
  };

  useEffect(() => {
    if (!projectFeesEnabled) return;
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (firstname) paramsQuery.firstname = firstname;
    if (projectName) paramsQuery.projectName = projectName;
    if (currency) paramsQuery.currency = currency;
    if (markupFee) paramsQuery.markupFee = markupFee;
    if (networkFee) paramsQuery.networkFee = networkFee;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    startTransition(() => {
      void getReports(paramsQuery);
    });
  }, [pagination, fromDate, toDate, firstname, projectName, currency, markupFee, networkFee, sort]);

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
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: ProjectFee[];
      pagination: Pagination;
    }> = await ApiHandler(fetchEcomProjectFees, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];
    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: `${row?.projectId}-${row?.currency}`,
        COMPANY: `${row?.User?.firstname ?? ""} ${row?.User?.lastname ?? ""}`,
        PROJECT: row?.projectName,
        CURRENCY: row?.currency,
        "MARK-UP FEE": row?.markupFee,
        "NETWORK FEE": row?.networkFee,
      });
    });
    void ExportCsv(reportHeaderval, "Project Fees Report");
  }

  function handleClear() {
    setState({
      firstname: undefined,
      projectName: undefined,
      currency: undefined,
      markupFee: undefined,
      networkFee: undefined,
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
          <div className="flex w-[200px] flex-col gap-1">
            <label htmlFor="filter_start">Start Date</label>
            <TextField
              id="filter_start"
              variant="outlined"
              className=" bg-white"
              size="small"
              onChange={handleChangeStartDate}
              value={fromDate}
              type="date"
            />
          </div>

          <div className="flex w-[200px] flex-col gap-1">
            <label htmlFor="filter_end">End Date</label>
            <TextField
              id="filter_end"
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
          storageName={"ProjectFees"}
          getRowId={(row) => `${row.projectId}-${row.currency}`}
          onSortModelChange={onSortChange}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
        />
      </EcomReportTabsLayout>
    </>
  );
};

export default ProjectFees;
