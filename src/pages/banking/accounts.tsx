import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  type GridFilterModel,
  type GridSortModel,
  GridActionsCellItem,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useRouter } from "next/router";
import AddPluse from "~/assets/general/Add_Plus.svg";
import MuiButton from "~/components/common/Button";
import { fetchPaginatedAccounts } from "~/service/api";
import Link from "next/link";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import { Debounce, ExportCsv } from "~/common/functions";

export interface currencyType {
  id: number;
  name: string;
}

const Accounts = () => {
  const router = useRouter();
  const [tableLoading, setTableLoading] = useState(false);

  const [userAssets, setUserAssets] = useState<any>([]);

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

  // columns
  const columns = [
    { field: "id", headerName: "SL NO", minWidth: 30 },

    {
      field: "accountNumber",
      headerName: "NUMBER",
      flex: 1,
      minWidth: 150,
      renderCell: (params: { row: { accountNumber: string } }) => (
        <Link
          href={`/banking/accounts/view/${params?.row?.accountNumber}`}
          className="text-blue-600 underline"
        >
          {params?.row?.accountNumber}
        </Link>
      ),
    },
    {
      flex: 1,
      minWidth: 400,
      field: "assetAddress",
      headerName: "PROVIDER NUMBER",
      renderCell: (params: { row: { assetAddress: string } }) => (
        <p className="font-bold">{params?.row?.assetAddress}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 200,
      valueGetter: (params: { row: any }) =>
        params?.row?.User?.firstname + " " + params?.row?.User?.lastname,
      field: "holder",
      headerName: "HOLDER",
      renderCell: (params: { row: any }) => (
        <span>{`${params?.row?.User?.firstname ?? ""} ${
          params?.row?.User?.lastname ?? ""
        }`}</span>
      ),
    },
    {
      flex: 1,
      minWidth: 100,
      field: "type",
      valueGetter: (params: { row: any }) =>
        params?.row?.assetId === "EUR" ? "Standard" : "Crypto",
      type: "singleSelect",
      valueOptions: ["Standard", "Crypto"],
      headerName: "TYPE",
      renderCell: (params: { row: { assetId: string } }) => (
        <span>{params?.row?.assetId === "EUR" ? "Standard" : "Crypto"}</span>
      ),
    },
    {
      flex: 1,
      minWidth: 200,
      field: "assetId",
      valueGetter: (params: { row: any }) => params?.row?.Asset?.name,
      headerName: "PROVIDER CURRENCY",
      renderCell: (params: { row: any }) => (
        <p className=" font-bold">{params?.row?.Asset?.name}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "active",
      headerName: "STATUS",
      type: "singleSelect",
      valueOptions: ["ACTIVE", "INACTIVE"],
      valueGetter: (params: { row: any }) =>
        params?.row?.User?.active ? "ACTIVE" : "INACTIVE",
      renderCell: (params: { row: any }) => (
        <span>{params?.row?.User?.active ? "ACTIVE" : "INACTIVE"}</span>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "Provider_name",
      valueGetter: (params: { row: any }) => "Fireblocks",
      headerName: "PROVIDER NAME",
      renderCell: () => <span>Fireblocks</span>,
    },

    {
      field: "actions",
      type: "actions",
      width: 80,
      headerName: "ACTIONS",
      getActions: (params: { row: { accountNumber: string } }) => [
        <GridActionsCellItem
          key="Show"
          onClick={() => {
            handleNavigate(
              `/banking/accounts/view/${params?.row?.accountNumber}`,
            );
          }}
          label="Show"
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
            handleNavigate("/banking/accounts/addAccount", {
              from: "edit",
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
          key="deposit"
          label="Deposit"
          onClick={() => {
            handleNavigate("/banking/transactions/addTransaction");
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
          key="suspend"
          label="Suspend"
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
          key="close"
          label="Close"
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "6rem",
            fontSize: "14px",
            color: "#FF0000",
          }}
        />,
      ],
    },
  ];

  const handleNavigate = (path: string, data?: any) => {
    router
      .push({
        pathname: path, // Replace with the actual page path
        query: data,
      })
      .then(() => {
        // The navigation was successful
      })
      .catch((error) => {
        // Handle any errors that occur during navigation
        console.error(error);
      });
  };

  const getAccounts = async (data: FilterType) => {
    setTableLoading(true);

    const [res, error]: APIResult<{
      data: Account[];
      pagination: Pagination;
    }> = await ApiHandler(fetchPaginatedAccounts, data);

    setTableLoading(false);

    if (res?.success && res.body?.data) {
      setUserAssets(res.body?.data);
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

    void getAccounts(paramsQuery);
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
      data: Account[];
      pagination: Pagination;
    }> = await ApiHandler(fetchPaginatedAccounts, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      const { id } = row;

      reportHeaderval.push({
        "SL NO": id,
        NUMBER: row?.accountNumber,
        "PROVIDER NUMBER": `${row?.assetAddress}`,
        HOLDER: `${row?.User?.firstname ?? ""} ${row?.User?.lastname ?? ""}`,
        TYPE: row?.assetId === "EUR" ? "Standard" : "Crypto",
        "PROVIDER CURRENCY": row?.Asset?.name,
        STATUS: row?.User?.active,
        "PROVIDER NAME": "Fireblocks",
      });
    });

    void ExportCsv(reportHeaderval, "Accounts Report");
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
        <p className="pageHeader">Accounts</p>
        <div className="flex items-center gap-4">
          {/* <p className="textLight">Filters</p>

          <button
            className=" rounded-lg border border-[#E2E8F0] bg-white p-3"
            onClick={handleClick}
          >
            <Image src={FilterBtn as StaticImageData} alt="filter" />{" "}
          </button> */}

          <MuiButton
            className="btn-solid"
            title="Add new"
            onClick={() => {
              handleNavigate("/banking/accounts/addAccount", {
                from: "create",
              });
            }}
          >
            <Image src={AddPluse as StaticImageData} alt="Add new button" />
          </MuiButton>
        </div>
      </div>

      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={userAssets}
            columns={columns}
            loading={tableLoading}
            storageName="banking_accounts"
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

export default Accounts;
