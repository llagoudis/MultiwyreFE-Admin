import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/x-data-grid";
import Image, { type StaticImageData } from "next/image";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import AddPluse from "~/assets/general/Add_Plus.svg";
import DeleteStaffPopup from "./company-staff/DeleteStaffPopup";
import Link from "next/link";
import { Debounce, ExportCsv } from "~/common/functions";
import { listCompanyStaff } from "~/service/api";
import { ApiHandler } from "~/service/UtilService";
import MuiButton from "~/components/common/Button";
import { enforcePermission } from "~/utils/permissions";
import { staffRoles } from "~/data/country";

type StaffRow = { row: CompanyStaff };

const CompanyStaff = () => {
  const router = useRouter();

  const [companyStaff, setCompanyStaff] = useState<CompanyStaff[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const intialSort = { field: "createdAt", sort: "DESC" };

  const [sort, setSort] = useState(intialSort);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [currentDelete, setCurrentDelete] = useState("");

  const toggleDelete = (associationId?: string) => {
    setCurrentDelete(associationId ?? "");
  };

  const onDeleteConfirm = () => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
    };

    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    void getCompanyStaff(paramsQuery);
    toggleDelete();
  };

  const navigate = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      minWidth: 150,
    },
    {
      flex: 1,
      minWidth: 120,
      field: "company",
      headerName: "COMPANY",
      valueGetter: (params: { row: any }) =>
        params?.row?.CompanyProfile?.companyName,

      renderCell: ({ row }: StaffRow) => (
        <Link
          href={`/banking/companies/view/${row?.CompanyProfile?.id}`}
          className="text-blue-600 underline"
        >
          {row?.CompanyProfile?.companyName}
        </Link>
      ),
    },
    {
      flex: 1,
      minWidth: 180,
      field: "person",
      headerName: "PERSON",
      valueGetter: (params: { row: any }) =>
        params?.row?.UserByAzureId?.firstname +
        " " +
        params?.row?.UserByAzureId?.lastname,
      renderCell: ({ row }: any) => (
        <>
          <Link
            href={`/banking/individuals/view/${row?.UserByAzureId?.azureId}`}
            className="text-blue-600 underline"
          >
            {`${row?.UserByAzureId?.firstname} ${row?.UserByAzureId?.lastname}`}
          </Link>
        </>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "roles",
      type: "singleSelect",
      valueOptions: staffRoles,
      valueGetter: ({ row }: StaffRow) => {
        const roleLower = row?.roles.toLowerCase();
        const actualRole = roleLower.includes("ex_user_viewer")
          ? "Viewer"
          : "Admin";
        return actualRole;
      },
      headerName: "ACCESS ROLES",
      renderCell: ({ row }: StaffRow) => {
        const roleLower = row?.roles.toLowerCase();
        const actualRole = roleLower.includes("ex_user_viewer")
          ? "Viewer"
          : "Admin";
        return (
          <a>
            <span>{actualRole}</span>
          </a>
        );
      },
    },
    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "enabled",
    //   headerName: "ENABLED",
    //   valueGetter: (params: { row: any }) =>
    //     params?.row?.enabled ? "Yes" : "No",
    //   renderCell: (params: { row: { enabled: boolean } }) => (
    //     <a>
    //       <span className="text-[#1CBDAB]">
    //         {params?.row?.enabled ? "Yes" : "No"}
    //       </span>
    //     </a>
    //   ),
    // },
    {
      field: "actions",
      type: "actions",
      width: 100,
      headerName: "ACTIONS",
      getActions: ({ row }: { row: CompanyStaff }) => [
        <GridActionsCellItem
          key="view"
          label="View"
          showInMenu
          title="Add new"
          onClick={() =>
            navigate("/banking/company-staff/view", { id: row.id })
          }
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
          onClick={() =>
            navigate("/banking/company-staff/form", {
              from: "staff",
              id: row.id,
            })
          }
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

  const getCompanyStaff = async (data: FilterType) => {
    setTableLoading(true);

    const [res, error]: APIResult<{
      data: CompanyStaff[];
      pagination: Pagination;
    }> = await ApiHandler(listCompanyStaff, data);

    setTableLoading(false);

    if (res?.success && res.body?.data) {
      setCompanyStaff(res.body?.data);
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

    void getCompanyStaff(paramsQuery);
  }, [pagination, sort, isFilterModelHasValue]);
  const onFilterChange = Debounce((newFilterModel: GridFilterModel) => {
    setFilterModel(newFilterModel);
  }, 500);

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
      data: CompanyStaff[];
      pagination: Pagination;
    }> = await ApiHandler(listCompanyStaff, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      const { id } = row;

      const roleLower = row?.roles.toLowerCase();
      const actualRole = roleLower.includes("admin") ? "Admin" : "Viewer";

      reportHeaderval.push({
        ID: id,
        COMPANY: row?.CompanyProfile?.companyName,
        PERSON: `${row?.UserByAzureId?.firstname} ${row?.UserByAzureId?.lastname}`,
        "ACCESS ROLES": actualRole,
      });
    });

    void ExportCsv(reportHeaderval, "Staff Report");
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
      <DeleteStaffPopup
        associationId={currentDelete}
        onClose={() => toggleDelete()}
        onConfirm={onDeleteConfirm}
      />
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">Company staff</p>
        <MuiButton
          title="Add new"
          onClick={() =>
            navigate("/banking/company-staff/form", {
              from: "staff",
            })
          }
          className="btn-solid"
        >
          <Image src={AddPluse as StaticImageData} alt="Add new button" />
        </MuiButton>
      </div>

      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={companyStaff}
            columns={columns}
            loading={tableLoading}
            checkboxSelection={true}
            rowCount={pageCount}
            slots={{
              toolbar: CustomToolbar,
            }}
            filterMode="server"
            sortingMode="server"
            paginationMode="server"
            onFilterModelChange={onFilterChange}
            onSortModelChange={onSortChange}
            filterModel={filterModel}
            pageSizeOptions={[10]}
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
            storageName="companyStaff"
          />
        </Box>
      </div>
    </div>
  );
};

export default CompanyStaff;
