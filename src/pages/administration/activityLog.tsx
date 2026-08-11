import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";

import {
  Box,
  Fade,
  Paper,
  Popper,
  ClickAwayListener,
  Button,
} from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchAdminLogs } from "~/service/ApiRequests";
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

export interface currencyType {
  id: number;
  name: string;
}

type TableRow = { row: Log };

const ActivityLog = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const getLogs = async (data: FilterType) => {
    setTableLoading(true);
    const [res, error]: APIResult<{ data: Log[]; pagination: Pagination }> =
      await ApiHandler(fetchAdminLogs, data);
    setTableLoading(false);

    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      setLogs(res?.body?.data);
      setPageCount(res?.body?.pagination?.totalItems);
    }
  };

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

  const columns = [
    // {
    //   field: "id",
    //   minWidth: 150,
    //   flex: 1,
    //   headerName: "ID",
    //   renderCell: ({ row }: TableRow) => <p>{row?.id}</p>,
    // },
    {
      field: "createdAt",
      minWidth: 200,
      flex: 1,
      type: "date",
      headerName: "CREATED AT",
      valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <p>{formatDate(row?.createdAt) ?? "---"}</p>
      ),
    },
    {
      field: "administrator",
      minWidth: 120,
      headerName: "ADMINISTRATOR",
      flex: 1,
      renderCell: ({ row }: TableRow) => (
        <p>{`${row?.AdminUser?.firstname || ""} ${
          row?.AdminUser?.lastname || ""
        }`}</p>
      ),
    },
    // {
    //   flex: 1,
    //   minWidth: 120,
    //   field: "user",
    //   headerName: "USER",
    //   renderCell: ({ row }: TableRow) => (
    //     <p>{`${row?.User?.firstname || ""} ${row?.User?.lastname || ""}`}</p>
    //   ),
    // },

    {
      flex: 1,
      minWidth: 300,
      field: "message",
      headerName: "DESCRIPTION",
      renderCell: ({ row }: TableRow) => <p>{row.message}</p>,
    },

    {
      flex: 1,
      minWidth: 150,
      field: "type",
      headerName: "ACTION",
      renderCell: ({ row }: TableRow) => <p>{row.type}</p>,
    },
  ];

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
    }> = await ApiHandler(fetchAdminLogs, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        "CREATED AT": formatDate(row?.createdAt),
        ADMINISTRATOR: `${row?.AdminUser?.firstname || ""} ${
          row?.AdminUser?.lastname || ""
        }`,
        DESCRIPTION: row.message,
        ACTION: row.type,
      });
    });

    void ExportCsv(reportHeaderval, "Admin Activity Logs Report");
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
        <p className="pageHeader">Activity log</p>
        <div className="flex items-center gap-4"></div>
      </div>

      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={logs}
            loading={tableLoading}
            storageName={"activity_log"}
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

export default ActivityLog;
