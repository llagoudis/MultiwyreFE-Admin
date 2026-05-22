import React, { useEffect, useState, startTransition } from "react";
import { Box, Button, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchCheckoutTransactions } from "~/service/ApiRequests";
import {
  Debounce,
  ExportCsv,
  formatDateTime,
  getStatusColor,
  getTodayAndLast10thDate,
} from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  type GridFilterModel,
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import StatusText from "~/components/common/StatusText";
import Link from "next/link";

type TableRow = { row: CheckoutTransaction };

const ProcessingTransactions = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();

  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);
  const intialSort = { field: "createdAt", sort: "DESC" };
  const [reports, setReports] = useState<EcomTransactions[]>([]);
  // console.log("called");
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState(intialSort);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  // columns
  const columns = [
    {
      minWidth: 50,
      field: "id",
      headerName: "SL NO",
    },
    {
      minWidth: 150,
      field: "createdAt",
      headerName: "CREATED AT",
      type: "date",
      valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.createdAt, true) ?? "---"}</p>
      ),
    },
    {
      minWidth: 250,
      field: "transactionId",
      headerName: "TRANSACTION ID",
    },
    {
      field: "merchantId",
      minWidth: 150,
      headerName: "MERCHANT ID",
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.merchantId ? row?.merchantId : "---"} `}</span>
      ),
    },
    {
      minWidth: 200,
      field: "companyName",
      headerName: "COMPANY NAME",
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/companies/view/${row?.Checkoutmerchant?.User?.companyProfileId}`}
          className="text-blue-600 underline"
        >
          {`${
            row?.Checkoutmerchant?.User
              ? `${row?.Checkoutmerchant?.User?.firstname} ${" "} ${row?.Checkoutmerchant?.User?.lastname}`
              : "---"
          } `}
        </Link>
      ),
    },
    {
      field: "customerDetails",
      headerName: "CUSTOMER DETAILS",
      width: 250,
      renderCell: ({ row }: TableRow) => (
        <p className=" flex flex-col gap-1">
          <span className=" font-semibold">
            {row?.firstName} {row?.lastName}
          </span>
          <span>{row?.email}</span>
          <span>
            {row?.customerCity +
              ", " +
              row?.customerAddress +
              ", " +
              row?.customerCountry +
              " - " +
              row?.customerZipcode}
          </span>
        </p>
      ),
    },
    {
      minWidth: 200,
      field: "paymentMethod",
      valueGetter: ({ row }: TableRow) => row?.paymentMethod,
      headerName: "PAYOUT TYPE",
      type: "singleSelect",
      valueOptions: ["Card", "Apple Pay", "Google Pay"],
    },

    {
      minWidth: 200,
      field: "receiverAddress",
      valueGetter: ({ row }: TableRow) => row?.receiverAddress,
      headerName: "RECEIVER ADDRESS",
    },

    {
      minWidth: 150,
      field: "fiatCurrency",
      valueGetter: ({ row }: TableRow) => row?.fiatCurrency,
      headerName: "FIAT CURRENCY",
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.fiatCurrency ? row?.fiatCurrency : "---"} `}</span>
      ),
    },

    {
      minWidth: 150,
      field: "receiverCurrency",
      valueGetter: ({ row }: TableRow) => row?.receiverCurrency,
      headerName: "CRYPTO CURRENCY",
    },

    {
      minWidth: 150,
      field: "fiatAmount",
      valueGetter: ({ row }: TableRow) => row?.fiatAmount,
      headerName: "FIAT AMOUNT",
    },

    {
      minWidth: 150,
      field: "receiverAmount",
      headerName: "CRYPTO AMOUNT",
      valueGetter: ({ row }: TableRow) => {
        return row?.receiverAmount?.toFixed(5);
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{row?.receiverAmount?.toFixed(5)}</p>;
      },
    },

    {
      minWidth: 350,
      field: "txHash",
      headerName: "TXN HASH",
      valueGetter: ({ row }: TableRow) => {
        return row?.PayoutTransaction?.txHash;
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{row?.PayoutTransaction?.txHash}</p>;
      },
    },

    {
      minWidth: 150,
      field: "networkFee",
      headerName: "NETWORK FEE",
    },

    {
      minWidth: 150,
      field: "processingFee",
      headerName: "PROCESSING FEE",
      renderCell: ({ row }: TableRow) => {
        return (
          <span>{row?.processingFee ? row?.processingFee + "%" : ""}</span>
        );
      },
    },

    {
      field: "fiatPaymentStatus",
      headerName: "FIAT PAYMENT STATUS",
      hidden: true,
      type: "singleSelect",
      valueOptions: ["COMPLETED", "SUBMITTED", "PENDING"],
      renderCell: ({ row }: TableRow) => {
        const color = getStatusColor(row?.fiatPaymentStatus ?? "");
        return (
          <StatusText color={color}>{row?.fiatPaymentStatus ?? ""}</StatusText>
        );
      },
    },

    {
      field: "cryptoPaymentStatus",
      headerName: "CRYPTO PAYMENT STATUS",
      type: "singleSelect",
      valueOptions: ["COMPLETED", "SUBMITTED", "PENDING"],
      hidden: true,
      renderCell: ({ row }: TableRow) => {
        const color = getStatusColor(row?.cryptoPaymentStatus ?? "");
        return (
          <StatusText color={color}>
            {row?.cryptoPaymentStatus ?? ""}
          </StatusText>
        );
      },
    },
  ];

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: EcomTransactions[];
      pagination: Pagination;
    }> = await ApiHandler(fetchCheckoutTransactions, data);
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

  const isFilterModelHasValue = filterModel?.items?.find((item) => item.value);

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    startTransition(() => {
      void getReports(paramsQuery);
    });
  }, [pagination, fromDate, toDate, sort, isFilterModelHasValue]);

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

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: CheckoutTransaction[];
      pagination: Pagination;
    }> = await ApiHandler(fetchCheckoutTransactions, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.id,
        "CREATED AT": formatDateTime(row?.createdAt),
        "TRANSACTION ID": row?.transactionId,
        "MERCHANT ID": row?.merchantId,
        "COMPANY NAME": `${row?.firstName} ${row?.lastName}`,
        "CUSTOMER DETAILS": `"${row?.Checkoutmerchant?.User?.firstname} ${row?.Checkoutmerchant?.User?.lastname}\n${row?.email}\n${row?.customerCity} ${row?.customerAddress}${row?.customerCountry} - ${row?.customerZipcode}"`,
        "PAYOUT TYPE": row?.paymentMethod,
        "RECEIVER ADDRESS": row?.receiverCurrency,
        "FIAT CURRENCY": row?.fiatCurrency,
        "CRYPTO CURRENCY": row?.receiverCurrency,
        "FIAT AMOUNT": row?.fiatAmount,
        "CRYPTO AMOUNT": row?.receiverAmount,
        "TXN HASH": row?.PayoutTransaction?.txHash,
        "NETWORK FEE": row?.networkFee,
        "PROCESS FEE": row?.processingFee ? row?.processingFee + "%" : "",
        "FIAT PAYMENT STATUS": row?.fiatPaymentStatus,
        "CRYPTO PAYMENT STATUS": row?.cryptoPaymentStatus,
      });
    });

    void ExportCsv(reportHeaderval, "Processing Transactions Report");
  }

  function handleClear() {
    setFromDate(last10thDate);
    setToDate(todayDate);
    setFilterModel({ items: [] });
    setSort(intialSort);
  }

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
          <Button size="small" onClick={handleClear}>
            Clear
          </Button>
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

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort(intialSort);
    }
  }, []);

  const onFilterChange = Debounce((newFilterModel: GridFilterModel) => {
    setFilterModel(newFilterModel);
  }, 500);

  return (
    <>
      <div className=" flex items-center justify-between pb-4 pt-4 ">
        <p className=" text-2xl font-bold">Transactions</p>
        <div className=" flex items-center gap-4"></div>
      </div>

      <MuiDataGrid
        rows={reports}
        columns={columns}
        loading={loading}
        rowCount={pageCount}
        rowHeight={70}
        slots={{
          toolbar: CustomToolbar,
        }}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        onFilterModelChange={onFilterChange}
        storageName={"AllTransactions"}
        onSortModelChange={onSortChange}
        pageSizeOptions={[10]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />
    </>
  );
};

export default ProcessingTransactions;
