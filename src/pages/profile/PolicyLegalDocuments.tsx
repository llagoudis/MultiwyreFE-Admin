import { GridActionsCellItem } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  createPolicyDocumentType,
  getPolicyDocumentTypes,
  editPolicyDocumentType,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import Button from "~/components/common/Button";
import { Dialog, DialogActions } from "@mui/material";
import InputComponent from "~/components/common/InputComponent";
import { formatDateTime } from "~/common/functions";
import { enforcePermission } from "~/utils/permissions";

type DocumentType = {
  id: string;
  displayName: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type TableRow = { row: DocumentType };

const PolicyLegalDocumentsPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<{ policyDocumentType: string }>();

  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [policyLegalDocuments, setPolicyLegalDocuments] = useState<
    DocumentType[]
  >([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDocumentId, setEditDocumentId] = useState<string>("");
  const [editDisplayName, setEditDisplayName] = useState<string>("");

  const getUsers = async () => {
    setTableLoading(true);
    const [data, error]: APIResult<DocumentType[]> = await ApiHandler(
      getPolicyDocumentTypes,
    );
    setTableLoading(false);
    if (error) {
      toast.error("Failed to load documents");
    }

    if (data?.success) {
      setPolicyLegalDocuments(data.body);
    }
  };

  const onSubmit = async (data: { policyDocumentType: string }) => {
    setLoading(true);
    try {
      const reqBody = { displayName: data.policyDocumentType };

      let response;

      if (editDocumentId) {
        // Update existing document
        const [res, error] = await ApiHandler(() =>
          editPolicyDocumentType(editDocumentId, reqBody),
        );

        if (error) {
          toast.error("Failed to update policy document type");
          return;
        }
        response = res;
      } else {
        // Create new document
        const [res, error] = await ApiHandler(() =>
          createPolicyDocumentType(reqBody),
        );

        if (error) {
          toast.error("Failed to create policy document type");
          return;
        }
        response = res;
      }

      if (response) {
        toast.success(response.message ?? "Operation successful");
        await getUsers(); // Refresh the users or document types list
        reset();
        setOpenDialog(false);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void getUsers();
  }, []);

  const columns = [
    {
      flex: 1,
      minWidth: 180,
      field: "id",
      headerName: "Type",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "displayName",
      headerName: "Name",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "createdAt",
      headerName: "Created At",
      valueGetter: ({ row }: TableRow) => {
        return formatDateTime(row?.createdAt) ?? "--";
      },
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.createdAt) ?? "--"}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "UpdatedAt",
      headerName: "Updated at",
      valueGetter: ({ row }: TableRow) => {
        return formatDateTime(row?.updatedAt) ?? "--";
      },
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.updatedAt) ?? "--"}</p>
      ),
    },
    {
      field: "actions",
      type: "actions",
      width: 100,
      getActions: ({ row }: TableRow) => [
        <GridActionsCellItem
          key="edit"
          label="Edit"
          showInMenu
          onClick={() => handleEditClick(row.id, row.displayName)}
          sx={{
            padding: "5px 1rem",
            width: "6rem",
            fontSize: "14px",
          }}
        />,
        // <GridActionsCellItem
        //   key="delete"
        //   label="Delete"
        //   onClick={() => openDeleteDialog(row.id)}
        //   showInMenu
        //   sx={{
        //     padding: "5px 1rem",
        //     width: "6rem",
        //     fontSize: "14px",
        //   }}
        // />,
      ],
    },
  ];

  const handleEditClick = (id: string, displayName: string) => {
    setEditDocumentId(id);
    setEditDisplayName(displayName);
    reset({ policyDocumentType: displayName });
    setOpenDialog(true);
  };
  const handleAddNewClick = () => {
    setEditDocumentId("");
    setEditDisplayName("");
    reset({ policyDocumentType: "" });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditDocumentId("");
    setEditDisplayName("");
  };

  return (
    <div className="container mx-auto my-8">
      <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
        <h2 className="subHeader">Policy Documents Type</h2>
        <div className="flex gap-4">
          <Button
            className="btn-solid"
            title="Add New"
            onClick={() => {
              enforcePermission("write", [() => handleAddNewClick()]);
            }}
          ></Button>
        </div>
      </div>
      <MuiDataGrid
        loading={tableLoading}
        storageName={"profile"}
        rows={policyLegalDocuments}
        columns={columns}
      />

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <div className="px-4 pb-4 pt-2">
          <p className="py-4 text-xl font-semibold">
            {editDocumentId
              ? "Edit Policy Document Type"
              : "Create New Policy Document Type"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="policyDocumentType"
              control={control}
              rules={{ required: "Policy Document Type is required" }}
              render={({ field }) => (
                <InputComponent
                  {...field}
                  control={control}
                  errors={errors}
                  defaultValue={editDisplayName}
                  type="text"
                  label="Policy Document Type"
                  watch={watch}
                  rules={{ required: "Legal Document Type is required" }}
                  name="policyDocumentType"
                />
              )}
            />
          </form>

          <DialogActions>
            <Button
              className="btn-outlined whitespace-nowrap"
              onClick={handleDialogClose}
            >
              Cancel
            </Button>
            <Button
              className="btn-solid whitespace-nowrap"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? "Processing..." : editDocumentId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default PolicyLegalDocumentsPage;
