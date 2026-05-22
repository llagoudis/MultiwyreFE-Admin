import React, { useEffect, useState, startTransition } from "react";
import { Box, Button } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { CheckoutMerchantsTurnover } from "~/service/ApiRequests";
import {
  ExportCsv,
  formatDateTime,
  getTodayAndLast10thDate,
} from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  GridFilterModel,
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import ProcessingTabsLayout from "~/components/ProcessingTabsLayout";
import Link from "next/link";

type TableRow = { row: CheckoutTurnover };
const ProcessTurnover = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);

  const [reports, setReports] = useState<Project[]>([]);

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10000,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  const [loading, setLoading] = useState(false);
  const initSort = { field: "createdAt", sort: "DESC" };
  const [sort, setSort] = useState(initSort);
  const [state, setState] = React.useState({
    createdAt: undefined,
    firstname: undefined,
    projectName: undefined,
  });

  const { createdAt, firstname, projectName } = state;

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
      type: "date",
      valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.createdAt) ?? "---"}</p>
      ),
    },
    {
      minWidth: 200,
      field: "firstname",
      flex: 1,
      headerName: "COMPANY",

      valueGetter: ({ row }: { row: Merchant }) => row?.User?.firstname,
      renderCell: ({ row }: { row: Merchant }) => (
        <Link
          className="text-blue-600 underline"
          href={`/banking/companies/view/${row?.User?.companyProfileId}`}
        >
          {row?.User?.firstname} {row?.User?.lastname}
        </Link>
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
      field: "EUR",
      headerName: "EUR",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.EUR ?? "-"}</p>,
    },

    {
      field: "USD",
      headerName: "USD",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USD ?? "-"}</p>,
    },

    {
      field: "networkFeeEUR",
      headerName: "NETWORK FEE (EUR)",
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.networkFeeEUR ?? "-"}</p>,
    },

    {
      field: "processingFeeEUR",
      headerName: "PROCESSING FEE (EUR)",
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.processingFeeEUR ?? "-"}</p>,
    },

    {
      field: "fxmarkUpEUR",
      headerName: "FX MARKUP (EUR)",
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.fxmarkUpEUR ?? "-"}</p>,
    },

    {
      field: "networkFeeUSD",
      headerName: "NETWORK FEE (USD)",
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.networkFeeUSD ?? "-"}</p>,
    },

    {
      field: "processingFeeUSD",
      headerName: "PROCESSING FEE (USD)",
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.processingFeeUSD ?? "-"}</p>,
    },

    {
      field: "fxmarkUpUSD",
      headerName: "FX MARKUP (USD)",
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.fxmarkUpUSD ?? "-"}</p>,
    },

    {
      field: "ETH",
      headerName: "ETH",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.ETH ?? "-"}</p>,
    },

    {
      field: "BTC",
      headerName: "BTC",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.BTC ?? "-"}</p>,
    },

    {
      field: "USDC_ERC20",
      headerName: "USDC (ERC20)",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USDC_ERC20 ?? "-"}</p>,
    },

    {
      field: "USDT_ERC20",
      headerName: "USDT (ERC20)",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USDT_ERC20 ?? "-"}</p>,
    },

    {
      field: "USDC_BSC",
      headerName: "USDC (BSC)",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USDC_BSC ?? "-"}</p>,
    },

    {
      field: "USDT_BSC",
      headerName: "USDT (BSC)",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USDT_BSC ?? "-"}</p>,
    },

    {
      field: "USDC_POLYGON",
      headerName: "USDC (POLYGON)",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USDC_POLYGON ?? "-"}</p>,
    },

    {
      field: "USDT_POLYGON",
      headerName: "USDT (POLYGON)",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USDT_POLYGON ?? "-"}</p>,
    },

    {
      field: "USDC_TRC20",
      headerName: "USDC (TRC20)",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USDC_TRC20 ?? "-"}</p>,
    },

    {
      field: "USDT_TRC20",
      headerName: "USDT (TRC20)",
      minWidth: 130,
      flex: 1,
      renderCell: ({ row }: TableRow) => <p>{row?.USDT_TRC20 ?? "-"}</p>,
    },
  ];

  const formatTo6Decimals = (val: number) => {
    if (val == null || isNaN(val)) return val;
    const str = val.toString();
    if (str.includes(".")) {
      const [intPart, decPart] = str.split(".");
      if (decPart && decPart.length > 6) {
        return parseFloat(val.toFixed(6)); // cut after 6 digits
      }
    }
    return val; // keep original if no decimals or less than 6
  };

  const mapReportsWithTurnover = (projects: CheckoutTurnover[]) => {
    return projects.map((project) => {
      // Initialize turnover row with base project info
      const turnoverRow: any = {
        ...project,
      };

      // Aggregate transactions
      project.CheckoutTransactions.forEach((txn) => {
        const fiat = txn.fiatCurrency;
        const receiver = txn.receiverCurrency;

        // Fiat turnover
        if (fiat) {
          turnoverRow[fiat] =
            (turnoverRow[fiat] || 0) +
            (txn.fiatAmountAfterFees || txn.fiatAmount || 0);

          // Fees in fiat currency
          if (txn.networkFee) {
            turnoverRow[`networkFee${fiat}`] =
              (turnoverRow[`networkFee${fiat}`] || 0) +
              parseFloat(txn.networkFee);
          }
          if (txn.processingFee) {
            turnoverRow[`processingFee${fiat}`] =
              (turnoverRow[`processingFee${fiat}`] || 0) +
              parseFloat(txn.processingFee);
          }
          if (txn.fxmarkUp) {
            turnoverRow[`fxmarkUp${fiat}`] =
              (turnoverRow[`fxmarkUp${fiat}`] || 0) + parseFloat(txn.fxmarkUp);
          }
        }

        // Crypto turnover
        if (receiver) {
          turnoverRow[receiver] =
            (turnoverRow[receiver] || 0) + (txn.receiverAmount || 0);
        }
      });

      // Format to 6 decimals
      Object.keys(turnoverRow).forEach((key) => {
        if (typeof turnoverRow[key] === "number") {
          turnoverRow[key] = formatTo6Decimals(turnoverRow[key]);
        }
      });

      return turnoverRow;
    });
  };

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: CheckoutTurnover[];
      pagination: Pagination;
    }> = await ApiHandler(CheckoutMerchantsTurnover, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body) {
      const turnoverReports = mapReportsWithTurnover(res.body?.data);

      startTransition(() => {
        // setPageCount(res?.body?.pagination?.totalItems);
        setReports(turnoverReports);
      });
    }
  };

  const paramsQuery: FilterType = {
    pageSize: pagination.pageSize,
    pageNumber: pagination.page + 1,
    fromDate: fromDate ?? last10thDate,
    toDate: toDate ?? todayDate,
  };

  useEffect(() => {
    if (createdAt) paramsQuery.createdAt = createdAt;
    if (firstname) paramsQuery.firstname = firstname;
    if (projectName) paramsQuery.projectName = projectName;

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    startTransition(() => {
      void getReports(paramsQuery);
    });
  }, [pagination, fromDate, toDate, createdAt, firstname, projectName, sort]);

  async function handleExport() {
    if (createdAt) paramsQuery.createdAt = createdAt;
    if (firstname) paramsQuery.firstname = firstname;
    if (projectName) paramsQuery.projectName = projectName;

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: CheckoutTurnover[];
      pagination: Pagination;
    }> = await ApiHandler(CheckoutMerchantsTurnover, paramsQuery);

    if (error) {
      return;
    }

    if (!res?.body?.data) return;

    // 🔹 Apply turnover mapping
    const turnoverReports = mapReportsWithTurnover(res.body?.data);

    // 🔹 Build CSV export rows
    const reportHeaderval: TransactionReport[] = [];

    turnoverReports.forEach((row) => {
      reportHeaderval.push({
        ID: row?.projectId,
        "CREATED AT": formatDateTime(row?.createdAt),
        COMPANY: row?.User?.firstname,
        PROJECT: row?.projectName,

        // Fiat
        EUR: row?.EUR ?? 0,
        USD: row?.USD ?? 0,
        ETH: row?.ETH ?? 0,
        BTC: row?.BTC ?? 0,

        // Fees
        "NETWORK FEE (EUR)": row?.networkFeeEUR ?? 0,
        "PROCESSING FEE (EUR)": row?.processingFeeEUR ?? 0,
        "FX MARKUP (EUR)": row?.fxmarkUpEUR ?? 0,

        "NETWORK FEE (USD)": row?.networkFeeUSD ?? 0,
        "PROCESSING FEE (USD)": row?.processingFeeUSD ?? 0,
        "FX MARKUP (USD)": row?.fxmarkUpUSD ?? 0,

        // Tokens
        "USDC (ERC20)": row?.USDC_ERC20 ?? 0,
        "USDT (ERC20)": row?.USDT_ERC20 ?? 0,
        "USDC (BSC)": row?.USDC_BSC ?? 0,
        "USDT (BSC)": row?.USDT_BSC ?? 0,
        "USDC (POLYGON)": row?.USDC_POLYGON ?? 0,
        "USDT (POLYGON)": row?.USDT_POLYGON ?? 0,
        "USDC (TRC20)": row?.USDC_TRC20 ?? 0,
        "USDT (TRC20)": row?.USDT_TRC20 ?? 0,
      });
    });

    // Export to CSV
    void ExportCsv(reportHeaderval, "Merchants");
  }

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

  function handleClear() {
    setState({
      createdAt: undefined,
      firstname: undefined,
      projectName: undefined,
    });

    setSort(initSort);
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

  function CustomToolbar() {
    return (
      <GridToolbarContainer className="flex justify-between">
        <Box>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <Button size="small" onClick={handleExport}>
            Export
          </Button>

          {/* <Button size="small" onClick={handleClear}>
            Clear
          </Button> */}
        </Box>
        <Box>
          <div className="flex gap-2 p-1">
            <div className="flex w-[12vw] flex-col">
              <label className=" text-[#1976d2]" htmlFor="filter_id1">
                Start Date
              </label>
              <input
                id="filter_id1"
                className="border-gray rounded-sm border bg-white p-1 text-[14px]"
                onChange={handleChangeStartDate}
                value={fromDate}
                type="date"
              />
            </div>

            <div className="flex w-[12vw] flex-col">
              <label className="text-[#1976d2]" htmlFor="filter_id2">
                End Date
              </label>
              <input
                id="filter_id2"
                className=" border-gray rounded-sm border bg-white p-1 text-[14px]"
                onChange={handleChangeEndDate}
                value={toDate}
                type="date"
              />
            </div>
          </div>
        </Box>
      </GridToolbarContainer>
    );
  }

  return (
    <>
      <ProcessingTabsLayout>
        <MuiDataGrid
          rows={reports}
          columns={columns}
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
          }}
          storageName="ProcessingTurnover"
          // paginationModel={pagination}
          onFilterModelChange={onFilterChange}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
            // sorting: {
            //   sortModel: [{ field: "id", sort: "desc" }],
            // },
          }}
          // rowCount={500}
          pageSizeOptions={[10, 20, 30]}
        />
      </ProcessingTabsLayout>
    </>
  );
};

export default ProcessTurnover;
