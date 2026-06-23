import {
  Button,
  // ClickAwayListener,
  // Fade,
  // LinearProgress,
  // Paper,
  // Popper,
  TextField,
} from "@mui/material";
import React, { startTransition, useEffect, useState } from "react";
// import Image, { type StaticImageData } from "next/image";
// import FilterBtn from "~/assets/general/sortlines.svg";
import toast from "react-hot-toast";
import {
  ExportCsv,
  // NoDataFound,
  formatDateTime,
  getStatusColor,
  getTodayAndLast10thDate,
} from "~/common/functions";
import { fetchEcomTransactions } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
// import MuiButton from "~/components/common/Button";
import {
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import StatusText from "~/components/common/StatusText";
// import { GridToolbar } from "@mui/x-data-grid";

interface filterType {
  label: string;
  name: string;
}

type TableRow = { row: EcomTransactions };

const EcommerceTransactions = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();

  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);

  // columns
  const columns = [
    {
      minWidth: 200,
      field: "id",
      headerName: "ID",
    },
    {
      minWidth: 200,
      field: "createdAt",
      headerName: "CREATED ON",
      renderCell: ({ row }: TableRow) => (
        <span>{formatDateTime(row?.createdAt) ?? "---"}</span>
      ),
    },

    {
      minWidth: 350,
      field: "fromAddress",
      valueGetter: ({ row }: TableRow) => row?.fromAddress,
      headerName: "SENDER",
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.fromAddress ? row?.fromAddress : "---"} `}</span>
      ),
    },

    {
      minWidth: 350,
      field: "toAddress",
      valueGetter: ({ row }: TableRow) => row?.toAddress,
      headerName: "BENEFICIARY",
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.toAddress ? row?.toAddress : "---"} `}</span>
      ),
    },

    {
      minWidth: 150,
      field: "merchantId",
      headerName: "MERCHANT",
      valueGetter: ({ row }: TableRow) => row?.Merchant?.projectName,
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.Merchant?.projectName ? row?.Merchant?.projectName : "---"} `}</span>
      ),
    },

    {
      minWidth: 150,
      field: "widgetNumber",
      headerName: "UNIQUE ID",
    },

    {
      minWidth: 200,
      field: "amount",
      valueGetter: ({ row }: TableRow) => row?.amount,
      headerName: "AMOUNT",
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.amount ? row?.amount : "---"} `}</span>
      ),
    },

    {
      minWidth: 150,
      field: "assetId",
      valueGetter: ({ row }: TableRow) => row?.assetId,
      headerName: "CURRENCY",
      renderCell: ({ row }: TableRow) => (
        <span>{`${row?.assetId ? row?.assetId : "---"} `}</span>
      ),
    },

    {
      field: "note",
      headerName: "TRANSACTION TYPE",
      hidden: true,
      minWidth: 250,
      valueGetter: ({ row }: TableRow) => row?.transactiontype,
      renderCell: ({ row }: TableRow) => (
        <span style={{ fontSize: "12px" }}>
          {Number(row?.transactiontype) === 6
            ? row?.note === "SWEEP_FROM_MASTER_TO_LIQUIDITY"
              ? "SWEEP_LIQUIDITY"
              : row?.note
            : row?.operationTypeData
              ? row?.operationTypeData?.displayName
              : ""}
        </span>
      ),
    },

    {
      minWidth: 250,
      field: "transactionId",
      headerName: "TRANSACTION ID",
    },

    {
      minWidth: 300,
      field: "account",
      headerName: "ACCOUNT",
      renderCell: ({ row }: TableRow) => (
        <span>{row?.fromAddress ?? "---"}</span>
      ),
    },
    {
      field: "status",
      headerName: "TRANSACTION STATUS",
      hidden: true,
      minWidth: 170,
      valueGetter: ({ row }: TableRow) => row?.status,
      renderCell: ({ row }: TableRow) => {
        const color = getStatusColor(row?.status ?? "");
        return (
          <StatusText color={color}>{String(row?.status) || ""}</StatusText>
        );
      },
    },
  ];

  const [reports, setReports] = useState<EcomTransactions[]>([]);

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
    transactionHash: undefined,
    transactiontype: undefined,
    customerId: undefined,
    recoveryEmail: undefined,
    status: undefined,
    merchantId: undefined,
    fromAddress: undefined,
    toAddress: undefined,
    networkFee: undefined,
    exactAmount: undefined,
    requestedAmount: undefined,
    amount: undefined,
    requestedAssetId: undefined,
    assetId: undefined,
    note: undefined,
    firstname: undefined,
  });

  const {
    createdAt,
    transactionHash,
    transactiontype,
    customerId,
    recoveryEmail,
    status,
    merchantId,
    fromAddress,
    toAddress,
    networkFee,
    exactAmount,
    requestedAmount,
    amount,
    requestedAssetId,
    assetId,
    note,
    firstname,
  } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: EcomTransactions[];
      pagination: Pagination;
    }> = await ApiHandler(fetchEcomTransactions, data);
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
      // operation: "TRANSFER",
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (createdAt) paramsQuery.createdAt = createdAt;
    if (transactionHash) paramsQuery.transactionHash = transactionHash;
    if (transactiontype) paramsQuery.transactiontype = transactiontype;
    if (customerId) paramsQuery.customerId = customerId;
    if (recoveryEmail) paramsQuery.recoveryEmail = recoveryEmail;
    if (status) paramsQuery.status = status;
    if (merchantId) paramsQuery.merchantId = merchantId;
    if (fromAddress) paramsQuery.fromAddress = fromAddress;
    if (toAddress) paramsQuery.toAddress = toAddress;
    if (networkFee) paramsQuery.networkFee = networkFee;
    if (exactAmount) paramsQuery.exactAmount = exactAmount;
    if (requestedAmount) paramsQuery.requestedAmount = requestedAmount;
    if (transactionHash) paramsQuery.transactionHash = transactionHash;
    if (amount) paramsQuery.amount = amount;
    if (requestedAssetId) paramsQuery.requestedAssetId = requestedAssetId;
    if (assetId) paramsQuery.assetId = assetId;
    if (note) paramsQuery.note = note;
    if (firstname) paramsQuery.firstname = firstname;
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
    transactionHash,
    transactiontype,
    customerId,
    recoveryEmail,
    status,
    merchantId,
    fromAddress,
    toAddress,
    networkFee,
    exactAmount,
    requestedAmount,
    amount,
    requestedAssetId,
    assetId,
    note,
    firstname,
    sort,
  ]);

  const handleColumnVisibilityChange = (columns: any) => {
    setColumns(columns);
    const columnsJSON = JSON.stringify(columns);
    localStorage.setItem("AllTransactions", columnsJSON);
  };

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
    if (transactionHash) paramsQuery.transactionHash = transactionHash;
    if (transactiontype) paramsQuery.transactiontype = transactiontype;
    if (customerId) paramsQuery.customerId = customerId;
    if (recoveryEmail) paramsQuery.recoveryEmail = recoveryEmail;
    if (status) paramsQuery.status = status;
    if (merchantId) paramsQuery.merchantId = merchantId;
    if (fromAddress) paramsQuery.fromAddress = fromAddress;
    if (toAddress) paramsQuery.toAddress = toAddress;
    if (networkFee) paramsQuery.networkFee = networkFee;
    if (exactAmount) paramsQuery.exactAmount = exactAmount;
    if (requestedAmount) paramsQuery.requestedAmount = requestedAmount;
    if (amount) paramsQuery.amount = amount;
    if (requestedAssetId) paramsQuery.requestedAssetId = requestedAssetId;
    if (assetId) paramsQuery.assetId = assetId;
    if (note) paramsQuery.note = note;
    if (firstname) paramsQuery.firstname = firstname;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: EcomTransactions[];
      pagination: Pagination;
    }> = await ApiHandler(fetchEcomTransactions, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.id,
        "CREATED AT": formatDateTime(row?.createdAt),
        "TRANSACTION ID": row?.transactionHash,
        "CUSTOMER ID": row?.customerId,
        MERCHANT: row?.Merchant?.projectName ?? "---",
        "UNIQUE ID": row?.widgetNumber,
        "COMPANY NAME": `${row?.firstname} ${" "} ${row?.lastname}`,
        "CUSTOMER EMAIL": row?.recoveryEmail,
        "SENDER ADDRESS": row?.fromAddress,
        "RECEIVER ADDRESS": row?.toAddress,
        "CRYPTO AMOUNT": row?.exactAmount,
        "NETWORK FEE": row?.networkFee,
        "FIAT AMOUNT": row?.requestedAmount,
        "RECEIVED CRYPTO": row?.amount,
        "FIAT CURRENCY": row?.requestedAssetId,
        CURRENCY: row?.assetId,
        "TRANSACTION TYPE":
          Number(row?.transactiontype) === 6
            ? row?.note === "SWEEP_FROM_MASTER_TO_LIQUIDITY"
              ? "SWEEP_LIQUIDITY"
              : row?.note
            : row?.operationTypeData
              ? row?.operationTypeData?.displayName
              : "",
        STATUS: row?.status,
      });
    });

    void ExportCsv(reportHeaderval, "Transactions Report");
  }

  function handleClear() {
    setState({
      createdAt: undefined,
      transactionHash: undefined,
      transactiontype: undefined,
      customerId: undefined,
      recoveryEmail: undefined,
      status: undefined,
      merchantId: undefined,
      fromAddress: undefined,
      toAddress: undefined,
      networkFee: undefined,
      exactAmount: undefined,
      requestedAmount: undefined,
      amount: undefined,
      requestedAssetId: undefined,
      assetId: undefined,
      note: undefined,
      firstname: undefined,
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
      <div className=" flex items-center justify-between pb-4 pt-4 ">
        <p className=" text-2xl font-bold">Transactions</p>
        <div className=" flex items-center gap-4">
          {/* <MuiButton
            // onClick={() => {
            //   onNavigation("/banking/individuals/user-form");
            // }}
            title="Add new"
            className="btn-solid"
          >
            <Image src={AddIcon as StaticImageData} alt="Add new button" />
          </MuiButton> */}
        </div>
      </div>
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

      {/* table component  */}
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
        onSortModelChange={onSortChange}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />
    </>
  );
};

export default EcommerceTransactions;
