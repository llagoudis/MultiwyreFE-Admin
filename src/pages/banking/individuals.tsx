import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Button } from "@mui/material";
import {
  GridActionsCellItem,
  type GridFilterModel,
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  type GridColDef,
} from "@mui/x-data-grid";
import { ApiHandler } from "~/service/UtilService";
import { deleteUser, fetchPaginatedUsers } from "~/service/ApiRequests";
import {
  Debounce,
  ExportCsv,
  findColorCode,
  formatDate,
} from "~/common/functions";
import Image, { type StaticImageData } from "next/image";
import AddIcon from "~/assets/general/Add_Plus.svg";
import Link from "next/link";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import DailogBox from "~/components/common/DailogBox";
import toast from "react-hot-toast";
import MuiButton from "~/components/common/Button";
import { enforcePermission } from "~/utils/permissions";

export interface currencyType {
  id: number;
  name: string;
}

type list = {
  label: string;
  value: string;
};

export interface filterType {
  label: string;
  name: string;
  type?: string;
  list?: list[];
}

type TableRow = { row: User };

const Persons = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const intialSort = { field: "createdAt", sort: "DESC" };

  const [sort, setSort] = useState(intialSort);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [tableLoading, setTableLoading] = useState(false);
  const getUsers = async (data: FilterType) => {
    const params = { ...data, userType: "USER" };
    setTableLoading(true);

    const [res, error]: APIResult<{ data: User[]; pagination: Pagination }> =
      await ApiHandler(fetchPaginatedUsers, params);

    setTableLoading(false);

    if (res?.success && res.body?.data) {
      setUsers(res.body?.data);
      setPageCount(res?.body?.pagination?.totalItems);
    }

    // if (data?.success) {
    //   const filterd = data.body?.filter((item) => item.userType !== "COMPANY");
    //   setUsers(filterd);
    // }
  };

  const [openDialog, setOpenDialog] = useState("");
  const [deleteAzureId, setDeleteAzureId] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  // page Navigation
  const onNavigation = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  const onFilterChange = Debounce((newFilterModel: GridFilterModel) => {
    setFilterModel(newFilterModel);
  }, 500);

  // columns
  const columns: GridColDef[] = [
    { field: "id", headerName: "CLIENT ID", minWidth: 150, hideable: false },
    {
      field: "firstname",
      headerName: "NAME",
      minWidth: 150,
      flex: 1,
      valueGetter: (params: { row: any }) =>
        params?.row?.firstname + " " + params?.row?.lastname,
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/individuals/view/${row.azureId}`}
          className="text-blue-600 underline"
        >
          {`${row.firstname ?? ""} ${row.lastname ?? ""}`}
        </Link>
      ),
    },
    {
      minWidth: 180,
      field: "isUserVerified",
      type: "singleSelect",
      valueOptions: ["APPROVED", "PENDING", "SUBMITTED"],
      headerName: "VERIFICATION STATUS",
      flex: 1,
      renderCell: ({ row }: TableRow) => (
        <p className={findColorCode(row?.isUserVerified)}>
          {row?.isUserVerified ?? "---"}
        </p>
      ),
    },
    {
      field: "email",
      headerName: "EMAIL",
      width: 200,
      flex: 1,
      minWidth: 200,
    },

    {
      minWidth: 150,
      field: "nationality",
      headerName: "COUNTRY",
      renderCell: ({ row }: TableRow) => <p>{row?.nationality ?? "---"}</p>,
      flex: 1,
    },
    {
      minWidth: 150,
      field: "createdAt",
      headerName: "CREATED AT",
      flex: 1,
      type: "date",
      valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <p>{formatDate(row?.createdAt) ?? "---"}</p>
      ),
    },

    {
      field: "actions",
      type: "actions",
      headerName: "ACTIONS",
      width: 80,
      getActions: ({ row }: TableRow) => [
        <GridActionsCellItem
          key="view"
          onClick={() => {
            onNavigation(`/banking/individuals/view/${row?.azureId}`);
          }}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #E1DCDC",
            width: "6rem",
            fontSize: "14px",
          }}
          label="View"
          showInMenu
        />,
        <GridActionsCellItem
          key="edit"
          label="Edit"
          onClick={() => {
            onNavigation(`/banking/individuals/user-form`, {
              id: row?.azureId,
            });
          }}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #E1DCDC",
            width: "6rem",
            fontSize: "14px",
          }}
          showInMenu
        />,
      ],
    },
  ];

  const submit = async () => {
    setLoading(true);
    const [data, error] = await ApiHandler(deleteUser, {
      id: deleteAzureId,
    });
    if (error) {
      toast.error("Failed to delete user");
    }
    if (data?.success) {
      setOpenDialog("deleteSuccess");

      const paramsQuery: FilterType = {
        pageSize: pagination.pageSize,
        pageNumber: pagination.page + 1,
      };

      if (sort) paramsQuery.field = sort.field;
      if (sort) paramsQuery.sort = sort.sort;

      void getUsers(paramsQuery);
    }
    setLoading(false);
  };

  const handleCloseDelete = () => {
    setOpenDialog("");
  };

  const isFilterModelHasValue = filterModel?.items?.find((item) => item.value);
  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
    };

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    void getUsers(paramsQuery);
  }, [pagination, sort, isFilterModelHasValue]);

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
    };

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    const [res, error]: APIResult<{
      data: User[];
      pagination: Pagination;
    }> = await ApiHandler(fetchPaginatedUsers, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      const { id, createdAt, email, firstname, lastname, isUserVerified } = row;

      reportHeaderval.push({
        "CLIENT ID": id,
        NAME: `${firstname} ${lastname}`,
        EMAIL: email,
        "VERIFICATION STATUS": isUserVerified,
        "ACCOUNT STATUS": row?.active ? "Approved" : "Not Approved",
        COUNTRY: row?.nationality,
        "CREATED AT": formatDate(createdAt),
      });
    });

    void ExportCsv(reportHeaderval, "Individuals Report");
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

  function handleClear() {
    setFilterModel({ items: [] });
    setSort(intialSort);
  }

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort(intialSort);
    }
  }, []);

  return (
    <div className=" flex flex-col gap-3">
      <div className=" flex items-center justify-between pb-4 pt-4 ">
        <p className="text-2xl font-bold">Individuals</p>
        <div className="flex items-center gap-4">
          <MuiButton
            onClick={() => {
              onNavigation("/banking/individuals/user-form");
            }}
            title="Add new"
            className=" btn-solid"
          >
            <Image src={AddIcon as StaticImageData} alt="Add new button" />
          </MuiButton>
        </div>
      </div>

      {/* datagrid  */}

      <Box sx={{ width: "100%" }}>
        <MuiDataGrid
          rows={users}
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
          storageName={"Individuals"}
          onSortModelChange={onSortChange}
          filterModel={filterModel}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
        />
      </Box>

      <DailogBox
        maxWidth={"sm"}
        open={openDialog === "delete"}
        handleClose={() => {
          setOpenDialog("");
        }}
      >
        <div className="flex flex-col gap-4 ">
          <h2 className="text-xl font-semibold text-black">
            Are you sure want to delete the person?
          </h2>
          <p>
            By doing this action the user will be removed permanently from the
            list. Are you sure you want to remove this person?
          </p>
          <div className="mt-4 flex justify-end gap-4">
            <MuiButton
              className="btn-outlined "
              title="No, cancel"
              onClick={() => {
                setOpenDialog("");
              }}
            />
            <MuiButton
              className="btn-solid text-white"
              title="Yes, confirm"
              onClick={submit}
              loading={loading}
            />
          </div>
        </div>
      </DailogBox>
      <DailogBox
        maxWidth={"sm"}
        open={openDialog === "deleteSuccess"}
        handleClose={handleCloseDelete}
      >
        <div className="flex flex-col gap-4 ">
          <h2 className="text-center text-xl font-semibold text-black">
            User deleted successfully
          </h2>

          <div className="mt-4 flex justify-end gap-4">
            <MuiButton
              className="btn-solid text-white"
              title="Close"
              onClick={handleCloseDelete}
            />
          </div>
        </div>
      </DailogBox>
    </div>
  );
};

export default Persons;
