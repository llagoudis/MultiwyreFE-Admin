import React, { useEffect, useState, startTransition } from "react";
import { Box, Button } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { getAllCheckoutMerchants } from "~/service/ApiRequests";
import {
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { ExportCsv, getTodayAndLast10thDate } from "~/common/functions";

const ProjectBalances = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>(todayDate);
  const [projects, setProjects] = useState<Merchant[]>([]);
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
    projectId: undefined,
    projectName: undefined,
  });

  const { projectId, projectName } = state;

  const getMerchant = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: Merchant[];
      pagination: Pagination;
    }> = await ApiHandler(getAllCheckoutMerchants, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      startTransition(() => {
        setPageCount(res?.body?.pagination?.totalItems);
        setProjects(res.body?.data);
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
    if (projectId) paramsQuery.prbalance = parseInt(projectId, 10);
    if (projectName) paramsQuery.projectName = projectName;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    startTransition(() => {
      void getMerchant(paramsQuery);
    });
  }, [pagination, fromDate, toDate, projectId, projectName, sort]);

  const [col, setColumns] = useState<any>(null);
  useEffect(() => {
    const storedColumnsJSON = localStorage.getItem("AllTransactions");
    if (storedColumnsJSON) {
      const storedColumns = JSON.parse(storedColumnsJSON);
      setColumns(storedColumns);
    }
  }, []);

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (projectId) paramsQuery.prbalance = parseInt(projectId, 10);
    if (projectName) paramsQuery.projectName = projectName;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: Merchant[];
      pagination: Pagination;
    }> = await ApiHandler(getAllCheckoutMerchants, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.id,
        "Project ID": row?.projectId,
        "Project Name": row?.projectName,
        EUR: getBalanceForAsset(row, "EUR"),
        BTC: getBalanceForAsset(row, "EUR"),
        ETH: getBalanceForAsset(row, "ETH"),
        "USDT (ERC20)": getBalanceForAsset(row, "USDT_ERC20"),
        "USDC (ERC20)": getBalanceForAsset(row, "USDC_ERC20"),
        "USDT (TRC20)": getBalanceForAsset(row, "USDT_TRC20"),
        "USDC (TRC20)": getBalanceForAsset(row, "USDC_TRC20"),
        "USDC (BSC)": getBalanceForAsset(row, "USDC_BSC"),
        "USDT (POLYGON)": getBalanceForAsset(row, "USDT_POLYGON"),
        "USDC (POLYGON)": getBalanceForAsset(row, "USDC_POLYGON"),
      });
    });

    void ExportCsv(reportHeaderval, "Project Balance");
  }

  function handleClear() {
    setState({
      projectId: undefined,
      projectName: undefined,
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

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort({ field: "", sort: "" });
    }
  }, []);

  // columns
  const columns = [
    {
      field: "projectId",
      headerName: "ID",
      width: 100,
      renderCell: ({ row }: { row: Merchant }) => row?.projectId,
    },
    {
      minWidth: 200,
      field: "projectName",
      flex: 1,
      headerName: "PROJECT",
      renderCell: ({ row }: { row: Merchant }) => (
        <span>{row?.projectName}</span>
      ),
    },

    {
      minWidth: 100,
      flex: 1,
      field: "EUR",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "EUR"),
      headerName: "EUR",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "EUR"),
    },
    {
      minWidth: 100,
      flex: 1,
      field: "BTC",
      headerName: "BTC",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "BTC"),
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "BTC"),
    },

    {
      minWidth: 100,
      flex: 1,
      field: "ETH",

      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "ETH"),
      headerName: "ETH",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "ETH"),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "USDT_ERC20",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDT (ERC20)"),
      headerName: "USDT (ERC20)",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDT_ERC20"),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "USDC_ERC20",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDC (ERC20)"),
      headerName: "USDC (ERC20)",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDC_ERC20"),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "USDT_TRC20",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDT (TRC20)"),
      headerName: "USDT (TRC20)",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDT_TRC20"),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "USDC_TRC20",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDC (TRC20)"),
      headerName: "USDC (TRC20)",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDC_TRC20"),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "USDT_BSC",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDT (BSC)"),
      headerName: "USDT (BSC)",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDT_BSC"),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "USDC_BSC",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDC (BSC)"),
      headerName: "USDC (BSC)",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDC_BSC"),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "USDT_POLYGON",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDT (POLYGON)"),
      headerName: "USDT (POLYGON)",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDT_POLYGON"),
    },
    {
      minWidth: 150,
      flex: 1,
      field: "USDC_POLYGON",
      valueGetter: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDC (POLYGON)"),
      headerName: "USDC (POLYGON)",
      renderCell: ({ row }: { row: Merchant }) =>
        getBalanceForAsset(row, "USDC_POLYGON"),
    },
  ];

  // Function to get balance for a specific asset from MerchantWallets
  const getBalanceForAsset = (row: Merchant, assetId: string) => {
    const balance =
      row.UserAssets.find((wallet) => wallet.assetId === assetId)?.balance ?? 0;

    const amount = Math.max(Number(balance), 0);
    return Number(amount.toFixed(6));
  };

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
    <div className=" flex flex-col gap-3">
      <div className=" flex items-center justify-between pb-4 pt-4 ">
        <p className=" text-2xl font-bold">Project Balances</p>
      </div>

      <div className="tableComponent eComProjectBalanceTabel pt-5">
        {/* <Box sx={{ width: "100%" }}> */}
        {/* <MuiDataGrid rows={projects} columns={columns} loading={loading} /> */}
        <MuiDataGrid
          rows={projects}
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
          getRowId={(row) => row?.projectId}
          onSortModelChange={onSortChange}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
        />
        {/* </Box> */}
      </div>
    </div>
  );
};

export default ProjectBalances;
