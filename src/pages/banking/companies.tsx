import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";
import AddIcon from "~/assets/general/Add_Plus.svg";
import { Box, Button, Fade, Paper, Popper } from "@mui/material";
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
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useRouter } from "next/router";
import MuiButton from "~/components/common/Button";
import Link from "next/link";
import FilterComponent from "~/components/common/FilterComponent";
import { verificationLevels } from "~/data/country";
import { fetchPaginateCompanies, getAllCompanies } from "~/service/api/company";
import {
  Debounce,
  ExportCsv,
  findColorCode,
  formatDate,
} from "~/common/functions";
import DeleteCompanyPopup from "./companies/DeleteCompanyPopup";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
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
  type: string;
  list?: list[];
}

type companies = Omit<Company, "UserCompanyAssociations">;

type TableRow = { row: companies };

const Companies = () => {
  const router = useRouter();

  const [companies, setCompanies] = useState<companies[]>([]);
  const [currentDelete, setCurrentDelete] = useState("");
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
  const toggleDelete = (associationId?: string) => {
    setCurrentDelete(associationId ?? "");
  };

  const onDeleteConfirm = () => {
    // setCompanies((prev) => {
    //   const nextState = [...prev];
    //   const idx = nextState.findIndex(
    //     (item) => String(item.id) === currentDelete,
    //   );
    //   nextState.splice(idx, 1);
    //   return nextState;
    // });
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
    };

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    void getCompanies(paramsQuery);

    toggleDelete();
  };

  // page Navigation
  const handleNavigate = (path: string) => {
    router
      .push(path)
      .then(() => {
        // The navigation was successful
      })
      .catch((error) => {
        console.log("error: ", error);
        // Handle any errors that occur during navigation
      });
  };

  // columns
  const columns = [
    { field: "id", headerName: "CLIENT ID", minWidth: 110, hideable: false },
    {
      field: "companyName",
      headerName: "NAME",
      hidden: true,
      minWidth: 200,
      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/companies/view/${row?.id}`}
          className="overflow-hidden text-ellipsis text-blue-600 underline"
        >
          {row?.companyName}
        </Link>
      ),
    },
    {
      field: "owner",
      headerName: "OWNER",
      minWidth: 200,
      valueGetter: (params: { row: any }) =>
        params?.row?.User?.firstname + " " + params?.row?.User?.lastname,
      renderCell: ({ row }: TableRow) => (
        <>
          <Link
            href={`/banking/individuals/view/${row?.userId}`}
            className="overflow-hidden text-ellipsis text-blue-600 underline"
          >
            {`${row?.User?.firstname || ""} ${row?.User?.lastname || ""}`}
          </Link>
        </>
      ),
    },
    {
      flex: 1,
      minWidth: 200,
      field: "verificationStatus",
      headerName: "VERIFICATION STATUS",
      type: "singleSelect",
      valueOptions: ["APPROVED", "PENDING", "SUBMITTED"],
      renderCell: ({ row }: TableRow) => (
        <a
          className={findColorCode(row?.verificationStatus)}
        >{`${row?.verificationStatus}`}</a>
      ),
    },

    {
      flex: 1,
      minWidth: 150,
      field: "accountStatus",
      headerName: "ACCOUNT STATUS",
      type: "singleSelect",
      valueOptions: ["Active", "Suspended"],
    },
    { flex: 1, minWidth: 250, field: "companyEmail", headerName: "EMAIL" },
    {
      flex: 1,
      minWidth: 120,
      field: "country",
      headerName: "COUNTRY",
      valueGetter: (params: { row: any }) =>
        params?.row?.CompanyEntityInfo?.Country?.name,
      renderCell: ({ row }: TableRow) => (
        <a>{row?.CompanyEntityInfo?.Country?.name}</a>
      ),
    },
    //  renderCell: ({ row }: TableRow) => {row?.countryCode},
    {
      flex: 1,
      minWidth: 180,
      field: "businessType",
      headerName: "BUSINESS TYPE",
      valueGetter: (params: { row: any }) =>
        params?.row?.CompanyEntityInfo?.BusinessNature?.name,
      renderCell: ({ row }: TableRow) => (
        <a>{row?.CompanyEntityInfo?.BusinessNature?.name}</a>
      ),
    },

    {
      flex: 1,
      minWidth: 150,
      field: "verificationLevel",
      headerName: "RISK LEVEL",
      type: "singleSelect",
      valueOptions: [
        { label: "Not identified", value: "1" },
        { label: "Low-Low", value: "2" },
        { label: "Low-Medium", value: "3" },
        { label: "Low-High", value: "4" },
        { label: "Medium-Low", value: "5" },
        { label: "Medium-Medium", value: "6" },
        { label: "Medium-High", value: "7" },
        { label: "High-Low", value: "8" },
        { label: "High-Medium", value: "9" },
        { label: "High-High", value: "10" },
      ],
      valueGetter: (params: { row: any }) => params?.row?.User?.roles,
      renderCell: ({ row }: TableRow) => {
        const value = verificationLevels.find(
          (item) => item.value === row?.verificationLevel,
        );
        return <a>{value?.label ?? ""}</a>;
      },
    },
    {
      flex: 1,
      minWidth: 180,
      field: "createdAt",
      headerName: "CREATED AT",
      type: "date",
      valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
      renderCell: ({ row }: TableRow) => (
        <p>{formatDate(row?.createdAt) ?? "---"}</p>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "ACTIONS ",
      getActions: ({ row }: TableRow) => [
        <GridActionsCellItem
          key="view"
          onClick={() => {
            handleNavigate(`/banking/companies/view/${row.id}`);
          }}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #cdcdcd",
            width: "6rem",
            fontSize: "14px",
          }}
          label="View"
          showInMenu
        />,
        <GridActionsCellItem
          key="edit"
          onClick={() =>
            handleNavigate(`/banking/companies/company-form?id=${row.id}`)
          }
          label="Edit"
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "6rem",
            fontSize: "14px",
          }}
        />,

        <GridActionsCellItem
          key="delete"
          label="Delete"
          onClick={() => {
            enforcePermission("delete", [() => toggleDelete(String(row.id))]);
          }}
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            color: "#FF0000",
            width: "6rem",
            fontSize: "14px",
          }}
        />,
      ],
    },
  ];

  const [tableLoading, setTableLoading] = useState(false);

  const getCompanies = async (data: FilterType) => {
    setTableLoading(true);

    const [res, error]: APIResult<{
      data: companies[];
      pagination: Pagination;
    }> = await ApiHandler(fetchPaginateCompanies, data);

    setTableLoading(false);
    if (error) {
      // handleClear();
      // toast.error("Failed to load companies");
    }

    if (res?.success && res.body?.data) {
      setCompanies(res.body?.data);
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

    if (filterModel && filterModel.items.length > 0) {
      filterModel.items.forEach((filter) => {
        if (filter.value) {
          paramsQuery[filter.field] = filter.value;
        }
      });
    }

    void getCompanies(paramsQuery);
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
      data: companies[];
      pagination: Pagination;
    }> = await ApiHandler(fetchPaginateCompanies, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      const { id, createdAt } = row;

      const value = verificationLevels.find(
        (item) => item.value === row?.verificationLevel,
      );

      reportHeaderval.push({
        "CLIENT ID": id,
        NAME: row?.companyName,
        OWNER: `${row?.User?.firstname || ""} ${row?.User?.lastname || ""}`,
        "VERIFICATION STATUS": row?.verificationStatus,
        "ACCOUNT STATUS": row?.accountStatus,
        EMAIL: row?.companyEmail,
        "BUSINESS TYPE": row?.CompanyEntityInfo?.BusinessNature?.name,
        "RISK LEVEL": value?.label,
        "CREATED AT": formatDate(createdAt),
      });
    });

    void ExportCsv(reportHeaderval, "Companies Report");
  }

  function handleClear() {
    setFilterModel({ items: [] });
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

  const onFilterChange = Debounce((newFilterModel: GridFilterModel) => {
    setFilterModel(newFilterModel);
  }, 500);

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort(intialSort);
    }
  }, []);

  return (
    <div className="">
      <DeleteCompanyPopup
        companyId={currentDelete}
        onClose={() => toggleDelete()}
        onConfirm={onDeleteConfirm}
      />
      {/* Filters */}
      <div className=" flex items-center justify-between pb-8 pt-4 ">
        <p className=" text-2xl font-bold">Companies</p>
        <div className=" flex items-center gap-4">
          <MuiButton
            title="Add new"
            onClick={() => {
              handleNavigate("/banking/companies/company-form");
            }}
            className="btn-solid"
          >
            <Image src={AddIcon as StaticImageData} alt="Add new button" />
          </MuiButton>
        </div>
      </div>

      {/* datagrid  */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={companies}
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
            storageName={"Companies"}
            onSortModelChange={onSortChange}
            filterModel={filterModel}
            pageSizeOptions={[25, 50, 100]}
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
          />
        </Box>
      </div>
    </div>
  );
};

export default Companies;
