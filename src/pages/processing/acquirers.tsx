import React, { startTransition, useEffect, useState } from "react";
import { Box, Button, Chip } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
  type GridSortModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import Image, { type StaticImageData } from "next/image";
import AddIcon from "~/assets/general/Add_Plus.svg";
import MuiButton from "~/components/common/Button";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import AcquirerDialog from "~/components/processing/AcquirerDialog";
import { ApiHandler } from "~/service/UtilService";
import {
  AddAcquirer,
  deleteAcquirer,
  EditAcquirer,
  getAllAcquirers,
} from "~/service/ApiRequests";
import { formatDateTime } from "~/common/functions";
import { enforcePermission } from "~/utils/permissions";
import toast from "react-hot-toast";

type TableRow = {
  row: Acquirer;
};

const Acquirers = () => {
  const [acquirer, setAcquirers] = useState<Acquirer[]>([]);

  const [paymentMethods] = useAsyncMasterStore("paymentMethods");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [selectedAcquirer, setSelectedAcquirer] = useState<any>(null);
  console.log("selectedAcquirer: ", selectedAcquirer);

  const intialSort = { field: "createdAt", sort: "DESC" };
  const [sort, setSort] = useState(intialSort);
  const [state, setState] = React.useState({
    acquirer: undefined,
    paymentMethods: undefined,
    status: undefined,
  });

  const [pageCount, setPageCount] = useState<number>(0);
  const getAcquirers = async (data: FilterType) => {
    const [res, error]: APIResult<{
      data: Acquirer[];
      pagination: Pagination;
    }> = await ApiHandler(getAllAcquirers, data);

    if (res?.success) {
      setAcquirers(res?.body?.data);
    }
  };

  const paramsQuery: FilterType = {
    pageSize: pagination.pageSize,
    pageNumber: pagination.page + 1,
  };

  useEffect(() => {
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    startTransition(() => {
      void getAcquirers(paramsQuery);
    });
  }, [pagination, sort]);

  const onFilterChange = React.useCallback(
    (filterModel: any) => {
      setState((prevState) => ({
        ...prevState,
        [filterModel?.items[0]?.field]: filterModel?.items[0]?.value,
      }));
    },
    [setState],
  );

  function handleExport() {
    //
  }

  function handleClear() {
    //
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

  async function hadleDeleteLimit(row: Acquirer) {
    const [res, error]: APIResult<{
      data: Acquirer[];
      pagination: Pagination;
    }> = await ApiHandler(deleteAcquirer, { id: row?.id });

    if (res?.success) {
      if (res?.message) toast.success(res?.message);
      void getAcquirers(paramsQuery);
    }
  }

  const columns = [
    { field: "acquirer", headerName: "ACQUIRER", flex: 1 },

    {
      field: "paymentMethods",
      headerName: "PAYMENTS",
      flex: 2,
      renderCell: ({ row }: TableRow) =>
        row.paymentIds?.map((id) => {
          const pm = paymentMethods?.find((p) => p.id === id);
          return <Chip size="small" key={id} label={pm?.name} sx={{ mr: 1 }} />;
        }),
    },

    {
      field: "status",
      headerName: "STATUS",
      flex: 0.5,
      renderCell: ({ row }: TableRow) => (
        <p>{row.status ? "Active" : "InActive"}</p>
      ),
    },

    {
      field: "createdAt",
      headerName: "CREATED AT",
      flex: 1,
      type: "date",
      valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.createdAt, true) ?? "---"}</p>
      ),
    },

    {
      field: "actions",
      type: "actions",
      getActions: ({ row }: TableRow) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            setDialogMode("view");
            setSelectedAcquirer(row);
            setDialogOpen(true);
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
          onClick={() => {
            setDialogMode("edit");
            setSelectedAcquirer(row);
            setDialogOpen(true);
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
            enforcePermission("delete", [() => void hadleDeleteLimit(row)]);
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

  async function submitAcquirer(body: any) {
    setLoading(true);

    if (dialogMode === "add") {
      const [res, error]: APIResult<{
        data: Acquirer[];
        pagination: Pagination;
      }> = await ApiHandler(AddAcquirer, body);
    } else if (dialogMode === "edit") {
      body = {
        id: selectedAcquirer?.id,
        ...body,
      };

      const [res, error]: APIResult<{
        data: Acquirer[];
        pagination: Pagination;
      }> = await ApiHandler(EditAcquirer, body);
    }

    setDialogOpen(false);
    await getAcquirers(paramsQuery);
    setLoading(false);
  }

  return (
    <>
      <AcquirerDialog
        open={dialogOpen}
        mode={dialogMode}
        initialData={selectedAcquirer}
        paymentMethods={paymentMethods}
        onClose={() => setDialogOpen(false)}
        onSubmit={submitAcquirer}
      />

      <div className=" flex flex-col gap-3">
        <div className=" flex items-center justify-between  pt-4 ">
          <p className=" text-2xl font-bold">Acquirers</p>
          <div className=" flex items-center gap-4">
            <MuiButton
              onClick={() => {
                setDialogMode("add");
                setSelectedAcquirer(null);
                setDialogOpen(true);
              }}
              title="Add new"
              className="btn-solid"
            >
              <Image src={AddIcon as StaticImageData} alt="Add new button" />
            </MuiButton>
          </div>
        </div>

        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={acquirer}
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
            storageName={"Acquirers"}
            getRowId={(row) => row?.id}
            onSortModelChange={onSortChange}
            pageSizeOptions={[10]}
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
          />
        </Box>
      </div>
    </>
  );
};

export default Acquirers;
