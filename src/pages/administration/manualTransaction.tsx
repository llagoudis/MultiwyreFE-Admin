import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import React, { startTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ExportCsv, formatDateTime } from "~/common/functions";
import MuiButton from "~/components/common/Button";
import InputComponent from "~/components/common/InputComponent";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import SelectComponent from "~/components/common/SelectComponent";
import TwoFA from "~/components/TwoFA";
import TwoFactorAuthentication from "~/components/TwoFactorAuthentication";
import WarningMsg from "~/components/WarningMsg";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { get2FAQRCode, submit2FAOtp } from "~/service/api/auth";
import {
  adminCommissionWithdraw,
  fetchManualTrxs,
  ManualWithdraw,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { useAuthStore } from "~/store";
import { enforcePermission } from "~/utils/permissions";

interface Form {
  twoFactorCode?: string;
}

type submissionType = {
  amount: number;
  sourceAddress: string;
  destinationAddress: string;
  assetId: string;
  privateKey: string;
  note: string;
};

const ManualTransaction = () => {
  const [popupState, setPopupState] = useState<
    "WITHDRAW" | "2FA" | "2FAQR" | "" | "CONFIRM"
  >("");
  const [rows, setRows] = useState<ManualTrx[]>([]);

  const [twofaQR, setTwofaQR] = useState<string>("");
  const { tfaEnabled } = useAuthStore((state) => state);
  const [assets] = useAsyncMasterStore("assets");

  const filteredAssets = assets.filter(
    (asset) =>
      asset.fireblockAssetId !== "USD" && asset.fireblockAssetId !== "EUR",
  );

  type TableRow = { row: ManualTrx };

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
      headerName: "HASH",
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
    //   field: "privateKey",
    //   headerName: "Private",
    //   renderCell: ({ row }: TableRow) => <span>{row?.feeValue ?? "---"}</span>,
    // },
    {
      minWidth: 150,
      flex: 1,
      field: "note",
      headerName: "NOTE",
      renderCell: ({ row }: TableRow) => <span>{row?.note ?? "---"}</span>,
    },
  ];

  const [loading, setLoading] = useState<
    "WITHDRAW" | "2FA" | "2FAQR" | "create" | "tableLoad" | ""
  >("");
  const [transactionBody, setTransactionBody] = useState<submissionType | null>(
    null,
  );

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });
  console.log("pagination: ", pagination);
  const [pageCount, setPageCount] = useState<number>(0);

  const [sort, setSort] = useState({
    field: "",
    sort: "",
  });

  async function fetchTrxs(data: FilterType) {
    setLoading("tableLoad");
    const [res, error] = await ApiHandler<{
      data: ManualTrx[];
      pagination: Pagination;
    }>(fetchManualTrxs, data);

    setLoading("");

    if (res?.success && res?.body?.data) {
      if (res?.success && res.body?.data) {
        startTransition(() => {
          setPageCount(res?.body?.pagination?.totalItems);
          setRows(res?.body?.data);
        });
      }
    }
  }

  const on2FASubmit = async () => {
    setLoading("2FA");
    const [res, error] = await ApiHandler(ManualWithdraw, transactionBody);
    setLoading("");

    if (res?.success) {
      handleDialogClose();
      const paramsQuery: FilterType = {
        pageSize: pagination.pageSize,
        pageNumber: pagination.page + 1,
      };
      void fetchTrxs(paramsQuery);
      toast.success("Transaction Submitted");
    }
  };

  const submit2FACode = async (value: Form) => {
    const { twoFactorCode } = value;
    setLoading("2FAQR");
    const [data, error]: APIResult<{ userId: string }> = await ApiHandler(
      submit2FAOtp,
      {
        otp: twoFactorCode,
      },
    );

    setLoading("");

    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      toast.success(data?.message ?? "");
      useAuthStore.setState((prev) => ({
        ...prev,
        tfaEnabled: true,
      }));

      toast.success(data?.message ?? "");
      setPopupState("");
    }
  };

  const get2FAQR = async () => {
    const [data, error]: APIResult<{ qrImage: string }> =
      await ApiHandler(get2FAQRCode);
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      setTwofaQR(data?.body?.qrImage);
    }
  };

  const { control, handleSubmit, reset, watch } = useForm<submissionType>();

  const onSubmit = (values: submissionType) => {
    setTransactionBody(values);
    setPopupState("CONFIRM");
  };

  const handleDialogClose = () => {
    reset();
    setPopupState("");
  };

  const [state, setState] = React.useState({
    id: undefined,
    adminName: undefined,
    assetId: undefined,
    amount: undefined,
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
    sourceAddress,
    destinationAddress,
    status,
    txHash,
    note,
    createdAt,
  } = state;

  console.log("pagination: ", pagination);
  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
    };

    if (id) paramsQuery.id = id;
    if (createdAt) paramsQuery.createdAt = createdAt;
    if (adminName) paramsQuery.adminName = adminName;
    if (assetId) paramsQuery.assetId = assetId;
    if (amount) paramsQuery.amount = amount;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (destinationAddress) paramsQuery.destinationAddress = destinationAddress;
    if (status) paramsQuery.status = status;
    if (txHash) paramsQuery.txHash = txHash;
    if (note) paramsQuery.note = note;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    startTransition(() => {
      void fetchTrxs(paramsQuery);
    });
  }, [
    pagination,
    id,
    adminName,
    assetId,
    amount,
    sourceAddress,
    destinationAddress,
    status,
    txHash,
    note,
    createdAt,
    sort,
  ]);

  const onConfirmSubmit = () => {
    setPopupState("2FA"); // Open 2FA popup
  };

  function camelToSpace(text: string) {
    const words = text.split(/(?=[A-Z])/);
    const result = words.join(" ").toLocaleLowerCase();
    return result;
  }

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
    };

    if (id) paramsQuery.id = id;
    if (createdAt) paramsQuery.createdAt = createdAt;
    if (adminName) paramsQuery.adminName = adminName;
    if (assetId) paramsQuery.assetId = assetId;
    if (amount) paramsQuery.amount = amount;
    if (sourceAddress) paramsQuery.sourceAddress = sourceAddress;
    if (destinationAddress) paramsQuery.destinationAddress = destinationAddress;
    if (status) paramsQuery.status = status;
    if (txHash) paramsQuery.txHash = txHash;
    if (note) paramsQuery.note = note;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: ManualTrx[];
      pagination: Pagination;
    }> = await ApiHandler(fetchManualTrxs, paramsQuery);

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
        "SOURCE ADDRESS": row?.sourceAddress,
        "DESTINATION ADDRESS": row?.destinationAddress,
        STATUS: row?.status,
        "TRX ID": row?.txHash,
        NOTE: row?.note,
      });
    });

    void ExportCsv(reportHeaderval, "Manual Transactions");
  }

  function handleClear() {
    setState({
      id: undefined,
      adminName: undefined,
      assetId: undefined,
      amount: undefined,
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

  return (
    <Box>
      <div className="pt-1">
        {!tfaEnabled && (
          <WarningMsg
            element={<span>Please enable two factor authentication</span>}
            handleClickText={"Enable Now"}
            handleClick={() => {
              void get2FAQR();

              setPopupState("2FAQR");
            }}
          />
        )}
      </div>

      <Dialog
        fullWidth
        maxWidth="sm"
        component={"form"}
        onSubmit={handleSubmit(onSubmit)}
        open={popupState === "WITHDRAW"}
        onClose={handleDialogClose}
      >
        <DialogTitle className="text-center font-semibold">
          Create Manual Transaction
        </DialogTitle>
        <DialogContent>
          <SelectComponent
            control={control}
            options={[...filteredAssets?.filter((val) => val.name !== "Any")]}
            label="Currency"
            required={true}
            valueKey="fireblockAssetId"
            labelKey="name"
            name="assetId"
            rules={{
              required: "Currency is required",
            }}
          />

          <InputComponent
            type="text"
            name="sourceAddress"
            label="Source Address"
            control={control}
            defaultValue=""
            required={true}
            rules={{ required: "Source Address is Required" }}
          />

          <InputComponent
            name="privateKey"
            control={control}
            defaultValue=""
            label="Private Key"
            type="text"
            required={true}
            rules={{ required: "Private Key is Required" }}
          />
          <InputComponent
            name="destinationAddress"
            control={control}
            defaultValue=""
            label="Destination Address"
            type="text"
            required={true}
            rules={{ required: "Destination Address is Required" }}
          />

          <InputComponent
            name="amount"
            control={control}
            defaultValue=""
            label="Amount"
            type="number"
            required={true}
            rules={{ required: "Amount is Required" }}
          />

          <InputComponent
            name="note"
            control={control}
            defaultValue=""
            label="Note"
            type="text"
          />
        </DialogContent>

        <DialogActions>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <MuiButton onClick={handleDialogClose} title="Cancel" />

            <MuiButton
              className="btn-solid"
              title="Submit"
              type="submit"
            ></MuiButton>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        sx={{ width: "100%" }}
        maxWidth="sm"
        open={popupState === "CONFIRM"}
        onClose={() => setPopupState("WITHDRAW")}
      >
        <DialogTitle className="flex justify-center text-xl font-bold text-gray-800">
          Confirm Transaction
        </DialogTitle>
        <DialogContent>
          <Box className="break-words rounded-md bg-gray-50 p-4 shadow-md">
            {transactionBody ? (
              <ul className="transaction-details flex flex-col gap-4">
                {Object.entries(transactionBody).map(([key, value]) => (
                  <li key={key} className="flex flex-col gap-1">
                    {value && (
                      <span className="text-sm font-medium capitalize text-gray-600">
                        {camelToSpace(key)}
                      </span>
                    )}
                    {value && (
                      <span className="text-base text-gray-800">{value}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-600">
                No transaction details available.
              </p>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="flex justify-end gap-4">
          <MuiButton onClick={() => setPopupState("WITHDRAW")} title="Cancel" />
          <MuiButton
            onClick={onConfirmSubmit}
            title="Confirm"
            className="btn-solid rounded-md  px-4 py-2 text-white transition "
          />
        </DialogActions>
      </Dialog>

      <MuiButton
        className="btn-solid my-2"
        title="Create Transaction"
        onClick={() => {
          enforcePermission("write", () => setPopupState("WITHDRAW"));
        }}
      />

      <MuiDataGrid
        rows={rows}
        columns={columns}
        loading={loading === "tableLoad"}
        rowCount={pageCount}
        slots={{
          toolbar: CustomToolbar,
        }}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        onFilterModelChange={onFilterChange}
        storageName={"AllTransactions"}
        getRowId={(row) => row.id}
        onSortModelChange={onSortChange}
        pageSizeOptions={[10]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />

      {popupState === "2FA" && (
        <TwoFA
          onClose={() => {
            setPopupState("CONFIRM");
          }}
          loading={loading === "2FA"}
          onSubmit={on2FASubmit}
        />
      )}

      {popupState === "2FAQR" && (
        <TwoFactorAuthentication
          submitData={submit2FACode}
          close={() => {
            setTwofaQR("");
            setPopupState("");
          }}
          loading={loading === "2FAQR"}
          twofaQR={twofaQR}
        />
      )}
    </Box>
  );
};

export default ManualTransaction;
