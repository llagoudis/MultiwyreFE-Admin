import React, { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import {
  ExportCsv,
  formatDateTime,
  getTodayAndLast10thDate,
} from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import MuiButton from "~/components/common/Button";
import {
  getAllCustomerWallets,
  getAllMerchantWallets,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import CopyButton from "~/assets/general/copyicon.svg";

type DepositMode = "PROJECT" | "TEMPORARY";

type DepositRow = {
  id: number | string;
  createdAt?: string;
  assetId?: string;
  balance?: string;
  assetAddress?: string;
  address?: string;
  customerId?: string;
  Merchant?: {
    projectId?: number | string;
    projectName?: string;
    User?: { firstname?: string; lastname?: string };
  };
};

/** QA #56 — Crypto deposit wallets under Asset Management (read-only, no secrets). */
const DepositWallets = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const [mode, setMode] = useState<DepositMode>("PROJECT");
  const [fromDate] = useState("");
  const [toDate] = useState("");
  const [wallets, setWallets] = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [sort, setSort] = useState({ field: "", sort: "" });
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});

  const maskAddress = (address?: string) => {
    if (!address) return "---";
    if (address.length < 16) return address;
    return `${address.slice(0, 16)}...`;
  };

  const onCopy = (text?: string) => {
    if (!text) return;
    void navigator.clipboard.writeText(text).then(
      () => toast.success("Copied to clipboard!"),
      () => toast.error("Copy failed"),
    );
  };

  const addressField = mode === "PROJECT" ? "assetAddress" : "address";

  const columns = useMemo(() => {
    const cols: any[] = [
      { field: "id", headerName: "ID", width: 80, flex: 0 },
      {
        field: "createdAt",
        headerName: "DATE",
        flex: 1,
        minWidth: 140,
        maxWidth: 200,
        renderCell: ({ row }: { row: DepositRow }) => (
          <p>{formatDateTime(row?.createdAt, true) ?? "---"}</p>
        ),
      },
      {
        field: "projectId",
        headerName: "PROJECT",
        flex: 1,
        minWidth: 120,
        maxWidth: 220,
        renderCell: ({ row }: { row: DepositRow }) => (
          <p className="truncate">{row?.Merchant?.projectName ?? "---"}</p>
        ),
      },
      {
        field: "company",
        headerName: "COMPANY",
        flex: 1,
        minWidth: 120,
        maxWidth: 220,
        renderCell: ({ row }: { row: DepositRow }) => (
          <p className="truncate">
            {row?.Merchant?.User
              ? `${row.Merchant.User.firstname ?? ""} ${row.Merchant.User.lastname ?? ""}`.trim() ||
                "---"
              : "---"}
          </p>
        ),
      },
    ];

    if (mode === "TEMPORARY") {
      cols.push({
        field: "customerId",
        headerName: "CUSTOMER ID",
        width: 130,
        flex: 0,
      });
    }

    cols.push(
      {
        field: "assetId",
        headerName: "ASSET",
        width: 130,
        flex: 0,
      },
      {
        field: addressField,
        headerName: "ADDRESS",
        flex: 1.2,
        minWidth: 180,
        maxWidth: 320,
        renderCell: ({ row }: { row: DepositRow }) => {
          const addr =
            mode === "PROJECT" ? row?.assetAddress : row?.address;
          return (
            <p className="flex w-full max-w-full items-center justify-between gap-1 overflow-hidden">
              <span className="truncate">{maskAddress(addr)}</span>
              <span
                className="mr-1 shrink-0 cursor-pointer"
                onClick={() => onCopy(addr)}
              >
                <Image className="cursor-pointer" src={CopyButton} alt="copy" />
              </span>
            </p>
          );
        },
      },
      {
        field: "balance",
        headerName: "BALANCE",
        width: 130,
        flex: 0,
      },
    );

    return cols;
  }, [mode, addressField]);

  const load = useCallback(
    async (params: FilterType) => {
      setLoading(true);
      const api =
        mode === "PROJECT" ? getAllMerchantWallets : getAllCustomerWallets;
      const [res, error]: APIResult<{
        data: DepositRow[];
        pagination: Pagination;
      }> = await ApiHandler(api, params);
      setLoading(false);
      if (error) {
        toast.error(
          mode === "PROJECT"
            ? "Failed to load project deposit wallets"
            : "Failed to load temporary deposit wallets",
        );
        return;
      }
      if (res?.success && res.body?.data) {
        startTransition(() => {
          setPageCount(res.body?.pagination?.totalItems ?? 0);
          setWallets(res.body.data);
        });
      } else {
        setWallets([]);
        setPageCount(0);
      }
    },
    [mode],
  );

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 0 }));
    setFilters({});
    setWallets([]);
  }, [mode]);

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: fromDate || last10thDate,
      toDate: toDate || todayDate,
    };
    if (filters.id) paramsQuery.id = filters.id;
    if (filters.createdAt) paramsQuery.createdAt = filters.createdAt;
    if (filters.assetId) paramsQuery.assetId = filters.assetId;
    if (filters.balance) paramsQuery.balance = filters.balance;
    if (filters.projectId) paramsQuery.adprojectname = filters.projectId;
    if (filters.customerId) paramsQuery.customerId = filters.customerId;
    if (mode === "PROJECT" && filters.assetAddress) {
      paramsQuery.assetAddress = filters.assetAddress;
    }
    if (mode === "TEMPORARY" && filters.address) {
      paramsQuery.address = filters.address;
    }
    if (sort.field) paramsQuery.field = sort.field;
    if (sort.sort) paramsQuery.sort = sort.sort;
    void load(paramsQuery);
  }, [
    pagination,
    fromDate,
    toDate,
    filters,
    sort,
    mode,
    last10thDate,
    todayDate,
    load,
  ]);

  const handleExport = async () => {
    const paramsQuery: FilterType = {
      pageSize: 100000,
      fromDate: fromDate || last10thDate,
      toDate: toDate || todayDate,
    };
    if (filters.projectId) paramsQuery.adprojectname = filters.projectId;
    if (sort.field) paramsQuery.field = sort.field;
    if (sort.sort) paramsQuery.sort = sort.sort;

    const api =
      mode === "PROJECT" ? getAllMerchantWallets : getAllCustomerWallets;
    const [res]: APIResult<{ data: DepositRow[] }> = await ApiHandler(
      api,
      paramsQuery,
    );
    if (!res?.success || !res.body?.data) return;

    const rows = res.body.data.map((row) => {
      const base: Record<string, unknown> = {
        ID: row.id,
        "CREATED AT": formatDateTime(row.createdAt),
        PROJECT: row.Merchant?.projectName,
        COMPANY: row.Merchant?.User
          ? `${row.Merchant.User.firstname ?? ""} ${row.Merchant.User.lastname ?? ""}`.trim()
          : "",
        ASSET: row.assetId,
        ADDRESS: mode === "PROJECT" ? row.assetAddress : row.address,
        BALANCE: row.balance,
      };
      if (mode === "TEMPORARY") base["CUSTOMER ID"] = row.customerId;
      return base;
    });
    void ExportCsv(rows as any, `DepositWallets_${mode}`);
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <Button size="small" onClick={() => void handleExport()}>
          Export
        </Button>
        <Button size="small" onClick={() => setFilters({})}>
          Clear
        </Button>
      </GridToolbarContainer>
    );
  }

  const onSortChange = useCallback((sortModel: GridSortModel) => {
    const { field, sort: dir } = sortModel[0] ?? {};
    if (field && dir) {
      setSort({ field, sort: dir === "desc" ? "DESC" : "ASC" });
    } else {
      setSort({ field: "", sort: "" });
    }
  }, []);

  const onFilterChange = useCallback((filterModel: any) => {
    const item = filterModel?.items?.[0];
    if (!item?.field) return;
    setFilters((prev) => ({ ...prev, [item.field]: item.value }));
  }, []);

  return (
    <div className="grid w-full max-w-full min-w-0 gap-3 overflow-hidden">
      <div className="flex flex-wrap gap-2">
        <MuiButton
          title="Project / Company"
          className={mode === "PROJECT" ? "btn-solid" : "btn-outlined"}
          onClick={() => setMode("PROJECT")}
        />
        <MuiButton
          title="Temporary / Plugin"
          className={mode === "TEMPORARY" ? "btn-solid" : "btn-outlined"}
          onClick={() => setMode("TEMPORARY")}
        />
      </div>
      <p className="text-sm text-slate-500">
        {mode === "PROJECT"
          ? "Company/project crypto deposit addresses (same source as E-Commerce Merchant Wallets)."
          : "Temporary plugin deposit addresses (same source as E-Commerce Customer Wallets)."}
      </p>
      <div
        className="w-full min-w-0"
        style={{ maxWidth: "100%", overflowX: "auto" }}
      >
        <MuiDataGrid
          key={mode}
          rows={wallets}
          columns={columns}
          loading={loading}
          rowCount={pageCount}
          slots={{ toolbar: CustomToolbar }}
          filterMode="server"
          sortingMode="server"
          paginationMode="server"
          onFilterModelChange={onFilterChange}
          storageName={`DepositWallets_${mode}`}
          getRowId={(row) => row.id}
          onSortModelChange={onSortChange}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          autoHeight
        />
      </div>
    </div>
  );
};

export default DepositWallets;
