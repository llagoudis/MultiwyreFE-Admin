import React, { useEffect, useState } from "react";
import { fetchClientLogs } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { Box, Button } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import toast from "react-hot-toast";
import {
  Debounce,
  ExportCsv,
  formatDate,
  formatDateTime,
} from "~/common/functions";
import {
  type GridFilterModel,
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

// import { formatDate } from "~/common/functions";

export interface currencyType {
  id: number;
  name: string;
}

type TableRow = { row: Log };

const ClientActivityLog = () => {
  // router
  const [tableLoading, setTableLoading] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const intialSort = { field: "createdAt", sort: "DESC" };
  const [sort, setSort] = useState(intialSort);

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [logs, setLogs] = useState<Log[]>([]);

  // columns
  const columns = [
    // {
    //   field: "id",
    //   minWidth: 50,
    //   headerName: "ID",
    //   renderCell: ({ row }: TableRow) => <p>{row?.id}</p>,
    // },
    {
      field: "createdAt",
      minWidth: 200,
      type: "date",
      headerName: "CREATED AT",
      valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <p>{formatDate(row?.createdAt) ?? "---"}</p>
      ),
    },
    {
      field: "initiator",
      minWidth: 200,
      headerName: "INITIATOR",
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.User?.firstname || ""} ${row?.User?.lastname || ""}`}</p>
      ),
    },

    {
      minWidth: 180,
      field: "ipAddress",
      headerName: "IP ADDRESS",
    },

    {
      // flex: 1,
      minWidth: 450,
      field: "message",
      headerName: "DESCRIPTION",
      renderCell: ({ row }: TableRow) => <p>{row.message}</p>,
    },

    {
      // flex: 1,
      minWidth: 200,
      field: "type",
      headerName: "ACTION",
      renderCell: ({ row }: TableRow) => <p>{row.type}</p>,
    },
  ];
  const getLogs = async (data: FilterType) => {
    setTableLoading(true);
    const [res, error]: APIResult<{ data: Log[]; pagination: Pagination }> =
      await ApiHandler(fetchClientLogs, data);
    setTableLoading(false);

    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      setLogs(res?.body?.data);
      setPageCount(res?.body?.pagination?.totalItems);
    }
  };

  const isFilterModelHasValue = filterModel?.items?.find((item) => item.value);

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
    };

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    void getLogs(paramsQuery);
  }, [pagination, sort, isFilterModelHasValue]);

  function handleClear() {
    setFilterModel({ items: [] });
    setSort(intialSort);
  }

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
    };

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    const [res, error]: APIResult<{
      data: Log[];
      pagination: Pagination;
    }> = await ApiHandler(fetchClientLogs, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        "CREATED AT": formatDate(row?.createdAt),
        INITIATOR: `${row?.User?.firstname ?? ""} ${row?.User?.lastname ?? ""}`,
        "IP ADDRESS": `${row?.ipAddress}`,
        DESCRIPTION: row.message,
        ACTION: row.type,
      });
    });

    void ExportCsv(reportHeaderval, "Client Activity Logs Report");
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

  const onFilterChange = Debounce((newFilterModel: GridFilterModel) => {
    setFilterModel(newFilterModel);
  }, 500);

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort(intialSort);
    }
  }, []);

  return (
    <div className="">
      {/* filters  */}
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">Client activity log</p>
      </div>

      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={logs}
            loading={tableLoading}
            storageName={"client_activity"}
            columns={columns}
            rowCount={pageCount}
            slots={{
              toolbar: CustomToolbar,
            }}
            filterMode="server"
            sortingMode="server"
            paginationMode="server"
            onFilterModelChange={onFilterChange}
            onSortModelChange={onSortChange}
            filterModel={filterModel}
            pageSizeOptions={[25, 50, 100]}
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
          />
        </Box>
      </div>
    </div>
  );
};

export default ClientActivityLog;
