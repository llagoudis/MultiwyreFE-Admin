import React, { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import { getAllLimits } from "~/service/ApiRequests";
import MuiButton from "~/components/common/Button";
import Image, { type StaticImageData } from "next/image";
import AddPluse from "~/assets/general/Add_Plus.svg";
import { deleteLimitsById } from "~/service/api/limits";
import { enforcePermission } from "~/utils/permissions";

export interface currencyType {
  id: number;
  name: string;
}

const Limits = () => {
  const router = useRouter();
  // page Navigation
  const onNavigate = useCallback(
    (path: string, data?: any) => {
      void router.push({ pathname: path, query: data });
    },
    [router],
  );

  const [limits, setLimits] = useState<Limits[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  console.log("limits", limits);

  const getLimits = async () => {
    setTableLoading(true);
    const [data, error]: APIResult<Limits[]> = await ApiHandler(getAllLimits);
    setTableLoading(false);
    if (error) {
      toast.error("Failed to load PriceLists");
    }

    if (data?.success) {
      setLimits(data.body);
    }
  };

  useEffect(() => {
    void getLimits();
  }, []);

  const hadleDeleteLimit = async (id: any) => {
    setTableLoading(true);
    const [data, error] = await ApiHandler(deleteLimitsById, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete Limits");
    }
    if (data?.success) {
      void getLimits();
      toast.success("Limit deleted successfully");
      setTableLoading(false);
    }
  };

  // columns
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
      renderCell: ({ row }: { row: Limits }) => <p>{row?.id}</p>,
    },
    {
      field: "client_verification_level",
      headerName: "CLIENT VERIFICATION LEVEL",
      flex: 1,
      minWidth: 220,
      valueGetter: ({ row }: { row: Limits }) =>
        row?.VerificationLevel?.displayName,
      renderCell: ({ row }: { row: Limits }) => (
        <p>{row?.VerificationLevel?.displayName}</p>
      ),
    },
    {
      flex: 1,
      field: "client_type",
      headerName: "CLIENT TYPE",
      valueGetter: ({ row }: { row: Limits }) => row?.clientType,
      renderCell: ({ row }: { row: Limits }) => <p>{row?.clientType}</p>,
    },

    {
      flex: 1,
      minWidth: 120,
      field: "person_type",
      headerName: "PERSON TYPE",
      valueGetter: ({ row }: { row: Limits }) => row?.personType,
      renderCell: ({ row }: { row: Limits }) => <p>{row?.personType}</p>,
    },

    {
      flex: 1,
      minWidth: 100,
      field: "name",
      headerName: "NAME",
      renderCell: ({ row }: { row: Limits }) => <p>{row?.name}</p>,
    },

    {
      flex: 1,
      minWidth: 250,
      field: "description",
      headerName: "DESCRIPTION",
      renderCell: ({ row }: { row: Limits }) => <p>{row?.description}</p>,
    },

    {
      flex: 1,
      width: 80,
      field: "status",
      headerName: "STATUS",
      renderCell: ({ row }: { row: Limits }) => <p>{row?.status}</p>,
    },

    {
      field: "actions",
      type: "actions",
      headerName: "ACTIONS",
      getActions: ({ row }: { row: Limits }) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            onNavigate(`/banking/limits/${row.id}`);
          }}
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #cdcdcd",
            width: "6rem",
            fontSize: "14px",
          }}
        />,
        <GridActionsCellItem
          key="edit"
          label="Edit"
          showInMenu
          onClick={() => {
            onNavigate(`/banking/limits/addLimits`, {
              id: row.id,
            });
          }}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #cdcdcd",
            width: "6rem",
            fontSize: "14px",
          }}
        />,
        <GridActionsCellItem
          key="delete"
          label="Delete"
          onClick={() => {
            enforcePermission("delete", [() => void hadleDeleteLimit(row?.id)]);
          }}
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "6rem",
            fontSize: "14px",
          }}
        />,
      ],
    },
  ];

  return (
    <div className="">
      {/* filters  */}
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">Limits</p>
        <MuiButton
          title="Add new"
          className="btn-solid"
          onClick={() => {
            onNavigate("/banking/limits/addLimits");
          }}
        >
          <Image src={AddPluse as StaticImageData} alt="Add new button" />
        </MuiButton>
      </div>

      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            loading={tableLoading}
            rows={limits}
            storageName="limits"
            columns={columns}
            slotProps={{
              toolbar: { csvOptions: { fileName: "Limits Report" } },
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default Limits;
