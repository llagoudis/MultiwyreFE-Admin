import { Box } from "@mui/material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddIcon from "~/assets/general/Add_Plus.svg";
import MuiButton from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { ApiHandler } from "~/service/UtilService";

import AddAutoConversion from "~/components/e-commerce/AddAutoConversion";
import { deleteAutoconversion } from "~/service/api/ecommerce";
import { getAllAutoConversion } from "~/service/ApiRequests";
import { enforcePermission } from "~/utils/permissions";

const Merchants = () => {
  const [loading, setLoading] = useState(false);
  const [autoConversions, setAutoConversions] = useState<AutoConversions[]>([]);
  const [openAdd, setOpenAdd] = useState<string>("");
  const [getId, setGetId] = useState<string | number>("");
  const [getRow, setGetRow] = useState<AutoConversions>();

  const getAutoConversion = async () => {
    setLoading(true);
    const [data]: APIResult<AutoConversions[]> =
      await ApiHandler(getAllAutoConversion);
    setLoading(false);

    if (data?.success) {
      setAutoConversions(data.body);
    } else {
      toast.error("Failed to load Merchants");
    }
  };

  useEffect(() => {
    void getAutoConversion();
  }, []);

  const hadleDeleteLimit = async (id: any) => {
    setLoading(true);
    const [data, error] = await ApiHandler(deleteAutoconversion, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete Autoconversion");
    }
    if (data?.success) {
      void getAutoConversion();
      toast.success("Autoconversion deleted successfully");
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "projectId",
      headerName: "PROJECT NAME",
      flex: 1,
      minWidth: 120,
      valueGetter: ({ row }: { row: AutoConversions }) =>
        row?.Merchant?.projectName,
      renderCell: ({ row }: { row: AutoConversions }) => (
        <p>{row?.Merchant?.projectName}</p>
      ),
    },

    {
      field: "targetAsset",
      headerName: "TARGET ASSET",
      flex: 1,
      minWidth: 120,
    },

    {
      field: "finalAsset",
      headerName: "FINAL ASSET",
      flex: 1,
      minWidth: 120,
    },

    {
      field: "status",
      headerName: "STATUS",
      flex: 1,
      minWidth: 120,
      valueGetter: ({ row }: { row: AutoConversions }) =>
        row?.status ? "Active" : "InActive",
      renderCell: ({ row }: { row: AutoConversions }) => (
        <p>{row?.status ? "Active" : "InActive"}</p>
      ),
    },

    {
      field: "actions",
      type: "actions",
      width: 80,
      getActions: ({ row }: { row: AutoConversions }) => [
        <GridActionsCellItem
          key="edit"
          label="Edit"
          onClick={() => {
            enforcePermission("edit", [
              () => setGetRow(row),
              () => setGetId(row?.id),
              () => setOpenAdd("edit"),
            ]);
          }}
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "6rem",
            fontSize: "14px",
            borderBottom: "1px solid #cdcdcd",
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

  const handleModalClose = () => {
    setOpenAdd("");
    setGetRow(undefined);
    void getAutoConversion();
  };

  return (
    <div className=" flex flex-col gap-3">
      <div className=" flex items-center justify-between pb-4 pt-4 ">
        <p className=" text-2xl font-bold">Auto Conversions</p>
        <div className=" flex items-center gap-4">
          <MuiButton
            onClick={() => {
              enforcePermission("write", [() => setOpenAdd("addNew")]);
            }}
            title="Add new"
            className="btn-solid"
          >
            <Image src={AddIcon as StaticImageData} alt="Add new button" />
          </MuiButton>
        </div>
      </div>

      {(openAdd === "addNew" || openAdd === "edit") && (
        <AddAutoConversion
          onClose={handleModalClose}
          openAdd={openAdd}
          getById={getId}
          getRowData={getRow}
          // marchants={recurringFeesDetails}
        />
      )}

      <div className="tableComponent pt-5">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={autoConversions}
            columns={columns}
            loading={loading}
            initialState={{
              sorting: {
                sortModel: [{ field: "id", sort: "desc" }],
              },
            }}
            slotProps={{
              toolbar: { csvOptions: { fileName: "Auto Conversions" } },
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default Merchants;
