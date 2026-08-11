import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
// import FilterBtn from "~/assets/general/sortlines.svg";
import { Box, Button } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  GridActionsCellItem,
  type GridFilterModel,
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

import AddPluse from "~/assets/general/Add_Plus.svg";
import DailogBox from "~/components/common/DailogBox";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import { BsPlus } from "react-icons/bs";
import pdflogo from "~/assets/general/pdf_icon.svg";
import deletelogo from "~/assets/general/delete_icon.svg";
import MuiButton from "~/components/common/Button";
import RequestDemo from "~/components/common/RequestDemo";
import Link from "next/link";
import { ApiHandler } from "~/service/UtilService";
import { fetchTransactions } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import {
  Debounce,
  ExportCsv,
  formatDateTime,
  getStatusColor,
} from "~/common/functions";
import StatusText from "~/components/common/StatusText";

export interface currencyType {
  id: number;
  name: string;
}

type TableRow = { row: TransactionDetails };

const Transactions = () => {
  // router
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const [transactionUpdated, setTransactionUpdated] = useState<
    TransactionDetails[]
  >([]);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const intialSort = { field: "createdAt", sort: "DESC" };
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sort, setSort] = useState(intialSort);

  const [showPending, setShowPending] = useState(false);

  const pendingFilter = () => {
    const statusFilters = [
      "PENDING_BLOCKCHAIN_CONFIRMATIONS",
      "SUBMITTED",
      "PENDING_AML_SCREENING",
      "PENDING_ENRICHMENT",
      "PENDING_AUTHORIZATION",
      "QUEUED",
      "PENDING_SIGNATURE",
      "PENDING_3RD_PARTY_MANUAL_APPROVAL",
      "PENDING_3RD_PARTY",
      "BROADCASTING",
      "CONFIRMING",
      "CANCELLING",
      "PENDING",
    ];

    if (showPending) {
      setTransactions(transactionUpdated);
    } else {
      const filteredTransactions = transactions.filter((transaction) =>
        statusFilters.includes(transaction.status),
      );
      setTransactions(filteredTransactions);
    }
    setShowPending(!showPending);
  };

  const onFilterChange = Debounce((newFilterModel: GridFilterModel) => {
    setFilterModel(newFilterModel);
  }, 500);

  // page Navigation
  const handleNavigate = (path: string) => {
    router
      .push(path)
      .then(() => {
        // The navigation was successful
      })
      .catch((error) => {
        // Handle any errors that occur during navigation
      });
  };

  const [tableLoading, setTableLoading] = useState(false);
  const getTransactions = async (data: FilterType) => {
    setTableLoading(true);

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchTransactions, data);
    setTableLoading(false);
    if (error) {
      handleClear();
      toast.error("Failed to load transactions");
    }
    if (res?.success && res.body?.data) {
      setTransactions(res.body?.data);
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
    if (showPending) paramsQuery.isPending = showPending;

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    void getTransactions(paramsQuery);
  }, [pagination, sort, isFilterModelHasValue, showPending]);

  const getSender = (row: any) => {
    const sourceAddress = row?.sourceAddress;
    const userId = row?.SourceAsset?.User
      ? row?.SourceAsset?.User?.azureId
      : "";
    const name = row?.SourceAsset?.User
      ? row?.SourceAsset?.User?.firstname +
        " " +
        row?.SourceAsset?.User?.lastname
      : "External";

    if (Number(row?.operationType) === 2 && row?.assetId === "EUR") {
      return `Customer name :${row?.EuroTransaction?.customerName} IBAN :${row?.EuroTransaction?.IBAN} BIC :${row?.EuroTransaction?.swift} Bank Name:  ${row?.EuroTransaction?.bankName}`;
    }

    if (userId && sourceAddress) {
      return name;
    }

    return row?.note === "COMMISSION_TRANSACTION"
      ? `${row?.User?.firstname} ${row?.User?.lastname}`
      : "External";
  };

  const getBeneficiary = (row: any) => {
    const destinationAddress = row?.destinationAddress;
    const userId = row?.DestinationUser?.User
      ? row?.DestinationUser?.User?.azureId
      : "";
    const name = row?.DestinationUser?.User
      ? row?.DestinationUser?.User?.firstname +
        " " +
        row?.DestinationUser?.User?.lastname
      : "External";

    if (Number(row?.operationType) === 2 && row?.assetId === "EUR") {
      return `Customer name :${row?.EuroTransaction?.customerName} IBAN :${row?.EuroTransaction?.IBAN} BIC :${row?.EuroTransaction?.swift} Bank Name:  ${row?.EuroTransaction?.bankName}`;
    }

    if (userId && destinationAddress) {
      return name;
    }

    return "External";
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100, hideable: false },

    {
      flex: 1,
      minWidth: 200,
      field: "createdAt",
      type: "date",
      headerName: "CREATED ON",
      filterable: true,
      valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.createdAt, true) ?? "---"}</p>
      ),
    },
    {
      field: "sender",
      headerName: "SENDER",
      valueGetter: ({ row }: TableRow) => {
        return getSender(row);
      },
      minWidth: 200,
      renderCell: ({ row }: TableRow) => {
        const sourceAddress = row?.sourceAddress;
        const userId = row?.SourceAsset?.User
          ? row?.SourceAsset?.User?.azureId
          : "";
        const name =
          row?.SourceAsset?.User &&
          row?.SourceAsset?.User?.firstname +
            " " +
            row?.SourceAsset?.User?.lastname;

        return (
          <>
            {Number(row?.operationType) === 1 && row?.assetId === "EUR" ? (
              <div className="text-xs leading-none">
                <p className="font-semibold">
                  {row?.EuroTransaction?.customerName}
                </p>
                <p>
                  <span className="font-semibold">IBAN: </span>
                  {row?.EuroTransaction?.IBAN}
                </p>
                <p>
                  <span className="font-semibold">BIC: </span>
                  {row?.EuroTransaction?.swift}
                </p>
                <p>
                  <span className="font-semibold">Bank Name: </span>
                  {row?.EuroTransaction?.bankName}
                </p>
              </div>
            ) : (
              <>
                {userId && sourceAddress ? (
                  <Link
                    className="text-blue-600 underline"
                    href={`/banking/individuals/view/${userId}`}
                  >
                    {name}
                  </Link>
                ) : (
                  <p className="">
                    {row?.note === "COMMISSION_TRANSACTION" ? (
                      <Link
                        className="text-blue-600 underline"
                        href={`/banking/individuals/view/${row?.User?.azureId}`}
                      >
                        {row?.User?.firstname} {row?.User?.lastname}
                      </Link>
                    ) : (
                      "External"
                    )}
                  </p>
                )}
              </>
            )}
          </>
        );
      },
    },
    {
      flex: 1,
      minWidth: 200,
      field: "beneficiary",
      valueGetter: ({ row }: TableRow) => {
        return getBeneficiary(row);
      },
      headerName: "BENEFICIARY",
      renderCell: ({ row }: TableRow) => {
        const destinationAddress = row?.destinationAddress;
        const userId = row?.DestinationUser?.User
          ? row?.DestinationUser?.User?.azureId
          : "";
        const name =
          row?.DestinationUser?.User &&
          row?.DestinationUser?.User?.firstname +
            " " +
            row?.DestinationUser?.User?.lastname;

        return (
          <>
            {Number(row?.operationType) === 2 && row?.assetId === "EUR" ? (
              <div className="text-xs leading-none">
                <p className="font-semibold">
                  {row?.EuroTransaction?.customerName}
                </p>
                <p>
                  <span className="font-semibold">IBAN: </span>
                  {row?.EuroTransaction?.IBAN}
                </p>
                <p>
                  <span className="font-semibold">BIC: </span>
                  {row?.EuroTransaction?.swift}
                </p>
                <p>
                  <span className="font-semibold">Bank Name: </span>
                  {row?.EuroTransaction?.bankName}
                </p>
              </div>
            ) : (
              <>
                {name && destinationAddress ? (
                  <Link
                    href={`/banking/individuals/view/${userId}`}
                    className="text-blue-600 underline"
                  >
                    {name}
                  </Link>
                ) : (
                  <p>{"External"}</p>
                )}
              </>
            )}
          </>
        );
      },
    },
    {
      minWidth: 150,
      field: "amount",
      headerName: "AMOUNT",
      valueGetter: ({ row }: TableRow) => {
        return row?.TransactionFee?.amount;
      },
      renderCell: ({ row }: TableRow) => {
        return <p>{row?.TransactionFee?.amount}</p>;
      },
    },

    {
      flex: 1,
      minWidth: 200,
      field: "assetId",
      headerName: "CURRENCY",
      renderCell: ({ row }: TableRow) => (
        <p>
          {row?.operation === "EXCHANGE"
            ? `${row?.assetId} - ${row?.destinationAssetId}`
            : `${row?.assetId}`}{" "}
        </p>
      ),
    },

    {
      flex: 1,
      minWidth: 200,
      field: "transactionType",
      headerName: "TRANSACTION TYPE",
      type: "singleSelect",
      valueOptions: [
        "Outgoing Transfer",
        "Internal Transfer",
        "Incoming Transfer",
        "Exchange",
        "Fee",
      ],
      hidden: true,
      valueGetter: ({ row }: TableRow) => row?.OperationType?.displayName,
      renderCell: ({ row }: TableRow) => (
        <p>
          {`${
            row?.note === "COMMISSION_TRANSACTION"
              ? "Fee"
              : row?.OperationType?.displayName
                ? row?.OperationType?.displayName
                : ""
          } `}
        </p>
      ),
    },

    {
      width: 300,
      field: "transactionId",
      valueGetter: (params: { row: any }) => params?.row?.txHash,
      headerName: "TRANSACTION ID",
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/transactions/view/${row.transactionId}`}
          className="w-full text-blue-600 underline"
          style={{ whiteSpace: "normal", wordBreak: "break-all" }}
        >
          {`${row.txHash || ""}`}
        </Link>
      ),
    },

    {
      flex: 1,
      minWidth: 400,
      field: "sourceAddress",
      headerName: "ACCOUNT",
      renderCell: ({ row }: TableRow) => {
        return <p>{row?.sourceAddress ? row?.sourceAddress : "---"}</p>;
      },
    },

    {
      minWidth: 200,
      field: "status",
      type: "singleSelect",
      valueOptions: ["COMPLETED", "FAILED", "PENDING"],
      valueGetter: ({ row }: TableRow) => {
        const pendingStatuses = new Set([
          "PENDING_BLOCKCHAIN_CONFIRMATIONS",
          "SUBMITTED",
          "PENDING_AML_SCREENING",
          "PENDING_ENRICHMENT",
          "PENDING_AUTHORIZATION",
          "QUEUED",
          "PENDING_SIGNATURE",
          "PENDING_3RD_PARTY_MANUAL_APPROVAL",
          "PENDING_3RD_PARTY",
          "BROADCASTING",
          "CONFIRMING",
          "CANCELLING",
        ]);

        if (pendingStatuses.has(row?.status)) {
          return "PENDING";
        } else if (row?.status === "COMPLETED") {
          return "COMPLETED";
        } else {
          return String(row?.status) || "";
        }
      },
      headerName: "TRANSACTION  STATUS",
      renderCell: ({ row }: TableRow) => {
        const pendingStatuses = new Set([
          "PENDING_BLOCKCHAIN_CONFIRMATIONS",
          "SUBMITTED",
          "PENDING_AML_SCREENING",
          "PENDING_ENRICHMENT",
          "PENDING_AUTHORIZATION",
          "QUEUED",
          "PENDING_SIGNATURE",
          "PENDING_3RD_PARTY_MANUAL_APPROVAL",
          "PENDING_3RD_PARTY",
          "BROADCASTING",
          "CONFIRMING",
          "CANCELLING",
        ]);

        if (pendingStatuses.has(row?.status)) {
          const color = getStatusColor("PENDING");
          return <StatusText color={color}>PENDING</StatusText>;
        } else if (row?.status === "COMPLETED") {
          const color = getStatusColor(row?.status ?? "");
          return <StatusText color={color}>COMPLETED</StatusText>;
        } else {
          const color = getStatusColor(row?.status ?? "");
          return (
            <StatusText color={color}>{String(row?.status) || ""}</StatusText>
          );
        }
      },
    },

    {
      minWidth: 200,
      field: "operation",
      headerName: "PAYMENT TYPE",
      type: "singleSelect",
      valueOptions: [
        { label: "KRAKEN", value: "Exchange" },
        { label: "CRYPTO", value: "Transfer" },
        { label: "SEPA", value: "SEPA" },
      ],
      valueGetter: ({ row }: TableRow) =>
        row?.operation === "EXCHANGE"
          ? "KRAKEN"
          : row.assetId === "EUR" && Number(row?.operationType) === 2
            ? "SEPA"
            : "CRYPTO",

      renderCell: ({ row }: TableRow) => {
        if (row.operation === "EXCHANGE") {
          return "KRAKEN";
        } else if (row.assetId === "EUR" && Number(row?.operationType) === 2) {
          return "SEPA";
        } else {
          return "CRYPTO";
        }
      },
    },

    {
      field: "actions",
      type: "actions",
      headerName: "ACTIONS",
      getActions: ({ row }: TableRow) => [
        <GridActionsCellItem
          key="show"
          label="Show"
          showInMenu
          onClick={() => {
            onNavigation(`/banking/transactions/view/${row?.transactionId}`);
          }}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #cdcdcd",
            width: "7.5rem",
            fontSize: "14px",
          }}
        />,

        <GridActionsCellItem
          key="upload"
          label="Upload"
          showInMenu
          onClick={handleChange}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #cdcdcd",
            width: "7.5rem",
            fontSize: "14px",
          }}
        />,

        <GridActionsCellItem
          key="request_document"
          label="Request Document"
          onClick={handleChangeRequestDemo}
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "7.5rem",
            fontSize: "14px",
          }}
        />,
      ],
    },
  ];

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
    };

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    if (showPending) paramsQuery.isPending = showPending;

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(fetchTransactions, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      const { id, createdAt } = row;

      const SENDER = getSender(row);
      const BENEFICIARY = getBeneficiary(row);

      reportHeaderval.push({
        ID: id,
        "CRETAED ON": formatDateTime(createdAt),
        SENDER: SENDER,
        BENEFICIARY: BENEFICIARY,
        AMOUNT: row?.TransactionFee?.amount,
        CURRENCY:
          row?.operation === "EXCHANGE"
            ? `${row?.assetId} - ${row?.destinationAssetId}`
            : `${row?.assetId}`,
        "TRANSACTION TYPE":
          row?.note === "COMMISSION_TRANSACTION"
            ? "Fee"
            : row?.OperationType?.displayName,
        "TRANSACTION ID": row?.transactionId,
        ACCOUNT: row?.sourceAddress ? row?.sourceAddress : "---",
        "TRANSACTION STATUS": row?.TransactionFee?.transactionFee,

        "PAYMENT TYPE":
          row?.operation === "EXCHANGE"
            ? "KRAKEN"
            : row.assetId === "EUR" && Number(row?.operationType) === 2
              ? "SEPA"
              : "CRYPTO",
      });
    });

    void ExportCsv(reportHeaderval, "Transactions Report");
  }
  // page Navigation
  const onNavigation = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  // opening dailog box
  const [dialogOpen, setDailogOpen] = useState(false);
  const [requestDemo, setRequestDemoOpen] = useState(false);

  const handleChange = () => {
    setDailogOpen(!dialogOpen);
  };

  const handleChangeRequestDemo = () => {
    setRequestDemoOpen(!requestDemo);
  };

  type formData = {
    file: string[];
  };

  const { control } = useForm<formData>();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};
    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort(intialSort);
    }
  }, []);

  function handleClear() {
    setFilterModel({ items: [] });
    setShowPending(false);
    setSort(intialSort);
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

  return (
    <div className="flex flex-col gap-3">
      {/* upload  file */}
      <DailogBox
        maxWidth={"md"}
        open={dialogOpen}
        dailogHeader="Upload document"
        handleClose={handleChange}
      >
        <div className="mt-5 flex flex-col gap-5 ">
          <div className="w-full">
            <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
              <h2 className="subHeader">Document</h2>
              <Controller
                name="file"
                control={control}
                render={({ field }) => (
                  <>
                    <MuiButton
                      onClick={() => {
                        document.getElementById("fileInput")?.click();
                      }}
                      className="btn-solid"
                      title="Upload file"
                    >
                      <input
                        {...field}
                        id="fileInput"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        multiple
                        accept="application/pdf"
                      ></input>
                      <BsPlus size={20} />
                    </MuiButton>
                  </>
                )}
              />
            </div>

            {selectedFiles.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <Image src={pdflogo as StaticImageData} alt="" />{" "}
                  <p>{item.name}</p>
                </div>

                <Image
                  alt=""
                  src={deletelogo as StaticImageData}
                  className="cursor-pointer"
                />
              </div>
            ))}

            <div className="mt-5 flex justify-end">
              <MuiButton title="Upload document" className="btn-solid" />
            </div>
          </div>
        </div>
      </DailogBox>

      {/* request demo  */}
      <RequestDemo open={requestDemo} handleClose={handleChangeRequestDemo} />

      {/* filters  */}
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">Transactions</p>
        <div className="flex items-center gap-4">
          <MuiButton
            title={showPending ? "Show All" : "Pending"}
            className={`btn-outlined ${showPending ? "btn-pending" : ""}`}
            onClick={pendingFilter}
          ></MuiButton>

          <MuiButton
            title="Add new"
            className="btn-solid"
            onClick={() => {
              handleNavigate("/banking/transactions/addTransaction");
            }}
          >
            <Image src={AddPluse as StaticImageData} alt="Add new button" />
          </MuiButton>
        </div>
      </div>

      {/* datagrid */}
      <Box sx={{ width: "100%" }}>
        <MuiDataGrid
          rows={transactions}
          columns={columns}
          loading={tableLoading}
          rowCount={pageCount}
          slots={{
            toolbar: CustomToolbar,
          }}
          filterMode="server"
          sortingMode="server"
          paginationMode="server"
          onFilterModelChange={onFilterChange}
          storageName={"Transactions"}
          onSortModelChange={onSortChange}
          filterModel={filterModel}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
        />
      </Box>
    </div>
  );
};

export default Transactions;
