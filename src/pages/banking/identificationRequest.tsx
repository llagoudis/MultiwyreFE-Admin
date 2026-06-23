import React, { useEffect, useMemo, useState } from "react";
import { listIdentificationRequest } from "~/service/api";
import { useRouter } from "next/router";
import {
  Debounce,
  ExportCsv,
  findColorCode,
  formatDate,
} from "~/common/functions";
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
import Link from "next/link";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { ApiHandler } from "~/service/UtilService";

type TableRow = { row: IdentityRequestType };

export interface currencyType {
  id: number;
  name: string;
}

const IdentificationRequest = () => {
  const router = useRouter();

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

  const [identityRequest, setIdentityRequest] = useState<IdentityRequestType[]>(
    [],
  );

  const columns = useMemo(
    () => [
      {
        minWidth: 120,
        field: "id",
        headerName: "CLIENT ID",
        renderCell: ({ row }: TableRow) => <p>{row.id}</p>,
      },
      {
        flex: 1,
        minWidth: 150,
        field: "firstname",
        headerName: "CLIENT",
        valueGetter: ({ row }: TableRow) => `${row?.firstname} ${row.lastname}`,
        renderCell: ({ row }: TableRow) => (
          <Link
            href={
              row.companyProfileId
                ? `/banking/companies/view/${row.companyProfileId}`
                : `/banking/individuals/view/${row.azureId}`
            }
            className="tableLink"
          >
            {`${row?.firstname} ${row.lastname}`}
          </Link>
        ),
      },
      {
        flex: 1,
        minWidth: 150,
        field: "isUserVerified",
        valueGetter: ({ row }: TableRow) =>
          row.userId ? row?.verificationStatus : row?.isUserVerified,
        headerName: "VERIFICATION STATUS",
        type: "singleSelect",
        valueOptions: ["SUBMITTED", "REJECTED"],
        renderCell: ({ row }: TableRow) => {
          const status = row?.isUserVerified;
          return <span className={findColorCode(status)}>{status}</span>;
        },
      },
      {
        flex: 1,
        minWidth: 100,
        field: "userType",
        valueGetter: ({ row }: TableRow) =>
          row.companyName ? "Company" : "Person",
        headerName: "CLIENT TYPE",
        type: "singleSelect",
        valueOptions: [
          { label: "Person", value: "PERSON" },
          { label: "Company", value: "COMPANY" },
        ],
        renderCell: ({ row }: TableRow) => (
          <span>{row?.userType === "COMPANY" ? "Company" : "Person"}</span>
        ),
      },
      {
        flex: 1,
        field: "createdAt",
        headerName: "CREATED AT",
        valueGetter: (params: { row: any }) => new Date(params.row.createdAt),
        type: "date",
        renderCell: ({ row }: TableRow) => <a>{formatDate(row?.createdAt)}</a>,
      },
      {
        field: "actions",
        type: "actions",
        headerName: "ACTIONS",
        getActions: ({ row }: TableRow) => [
          <GridActionsCellItem
            key="view"
            label="View"
            showInMenu
            onClick={async () => {
              await router.push(
                `/banking/identificationRequest/view?request=${btoa(
                  JSON.stringify(row),
                )}`,
              );
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
            key="download"
            label="Download"
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
    ],
    [router],
  );
  const [tableLoading, setTableLoading] = useState(false);

  const getIdentityRequests = async (data: FilterType) => {
    setTableLoading(true);

    const [res, error]: APIResult<{
      data: IdentityRequestType[];
      pagination: Pagination;
    }> = await ApiHandler(listIdentificationRequest, data);

    setTableLoading(false);

    if (res?.success && res.body?.data) {
      setIdentityRequest(res.body?.data);
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

    void getIdentityRequests(paramsQuery);
  }, [pagination, sort, isFilterModelHasValue]);

  // const getIdentityRequests = useCallback(async () => {
  //   setTableLoading(true);
  //   await getUsers("identity").then(([res]) => {
  //     setTableLoading(false);
  //     if (res) {
  //       const filter = res?.body?.filter((item) => item.userType === "COMPANY");
  //       console.log("filter: ", filter);
  //       setIdentityRequest(res?.body);
  //     }
  //   });
  // }, []);

  // useEffect(() => {
  //   void getIdentityRequests();
  // }, [getIdentityRequests]);

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
      data: IdentityRequestType[];
      pagination: Pagination;
    }> = await ApiHandler(listIdentificationRequest, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      const { id } = row;

      reportHeaderval.push({
        "CLIENT ID": id,
        CLIENT: `${row?.firstname} ${row.lastname}`,
        "VERIFICATION STATUS": row?.isUserVerified,
        "CLIENT TYPE": row?.userType === "COMPANY" ? "Company" : "Person",
        "CREATED AT": formatDate(row?.createdAt),
      });
    });

    void ExportCsv(reportHeaderval, "Identification Requests Report");
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
      {/* filters  */}
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">Identification requests</p>
      </div>

      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            loading={tableLoading}
            storageName="identificationRequest"
            rows={identityRequest}
            columns={columns}
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
            pageSizeOptions={[25, 50, 100]}
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
          />
        </Box>
      </div>
    </div>
  );
};

export default IdentificationRequest;
