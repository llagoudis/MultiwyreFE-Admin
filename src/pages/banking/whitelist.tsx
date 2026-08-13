import { Box, Button } from "@mui/material";
import { type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { findColorCode, formatDate } from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  listWhitelistAddressesAdmin,
  updateWhitelistApprovalStatus,
} from "~/service/api/accounts";
import { enforcePermission } from "~/utils/permissions";

type StatusFilter = "pending" | "approved" | "rejected" | "";

const WhitelistAddresses = () => {
  const [rows, setRows] = useState<WhitelistAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

  const load = async (status: StatusFilter = statusFilter) => {
    setLoading(true);
    const [data] = await listWhitelistAddressesAdmin(status || undefined);
    setLoading(false);
    if (data?.success) {
      setRows(data.body ?? []);
    }
  };

  useEffect(() => {
    void load(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const setStatus = (id: number, status: "approved" | "rejected") => {
    enforcePermission("edit", [
      async () => {
        setLoading(true);
        const [data, error] = await updateWhitelistApprovalStatus(id, status);
        setLoading(false);
        if (error || !data?.success) return;
        toast.success(
          status === "approved"
            ? "Whitelist address approved"
            : "Whitelist address rejected",
        );
        await load();
      },
    ]);
  };

  const columns: GridColDef<WhitelistAddress>[] = [
    { field: "id", headerName: "ID", width: 80 },
      {
        field: "client",
        headerName: "CLIENT",
        flex: 1,
        minWidth: 160,
        valueGetter: ({ row }) =>
          `${row?.User?.firstname ?? ""} ${row?.User?.lastname ?? ""}`.trim() ||
          row.userId,
        renderCell: ({ row }) => (
          <span>
            {`${row?.User?.firstname ?? ""} ${row?.User?.lastname ?? ""}`.trim() ||
              row.userId}
          </span>
        ),
      },
      {
        field: "email",
        headerName: "EMAIL",
        flex: 1,
        minWidth: 180,
        valueGetter: ({ row }) => row?.User?.email ?? "",
      },
      {
        field: "label",
        headerName: "LABEL",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "assetId",
        headerName: "ASSET",
        minWidth: 140,
        valueGetter: ({ row }) => row?.Assets?.name || row.assetId,
        renderCell: ({ row }) => (
          <span>{row?.Assets?.name || row.assetId}</span>
        ),
      },
      {
        field: "assetAddress",
        headerName: "ADDRESS",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "approvalStatus",
        headerName: "STATUS",
        minWidth: 140,
        renderCell: ({ row }) => {
          const status = String(row.approvalStatus || "pending").toUpperCase();
          return (
            <span className={findColorCode(status as verificationStates)}>
              {status}
            </span>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "CREATED AT",
        minWidth: 160,
        valueGetter: ({ row }) =>
          row.createdAt ? new Date(row.createdAt) : null,
        renderCell: ({ row }) => (
          <span>{row.createdAt ? formatDate(row.createdAt) : ""}</span>
        ),
      },
      {
        field: "actions",
        headerName: "ACTIONS",
        minWidth: 220,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => {
          const status = String(row.approvalStatus || "pending").toLowerCase();
          if (status !== "pending") return <span>—</span>;
          return (
            <div className="flex gap-2">
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => setStatus(Number(row.id), "approved")}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => setStatus(Number(row.id), "rejected")}
              >
                Reject
              </Button>
            </div>
          );
        },
      },
    ];

  const filters: { label: string; value: StatusFilter }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "All", value: "" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">Whitelist addresses</p>
        <div className="flex gap-2">
          {filters.map((item) => (
            <Button
              key={item.label}
              size="small"
              variant={statusFilter === item.value ? "contained" : "outlined"}
              onClick={() => setStatusFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            loading={loading}
            storageName="whitelistAddresses"
            rows={rows}
            columns={columns}
            pageSizeOptions={[25, 50, 100]}
          />
        </Box>
      </div>
    </div>
  );
};

export default WhitelistAddresses;
