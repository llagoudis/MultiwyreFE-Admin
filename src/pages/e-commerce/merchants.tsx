import { Box, Button } from "@mui/material";
import {
  GridActionsCellItem,
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import React, { startTransition, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddIcon from "~/assets/general/Add_Plus.svg";
import { ExportCsv, getTodayAndLast10thDate } from "~/common/functions";
import MuiButton from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import AddMarchants from "~/components/e-commerce/AddMarcharnts";
import ViewMerchant from "~/components/e-commerce/ViewMarchant";
import { deleteMerchants } from "~/service/api/ecommerce";
import { getAllMerchants } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { enforcePermission } from "~/utils/permissions";

const Merchants = () => {
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [openAdd, setOpenAdd] = useState<string>("");
  const [getId, setGetId] = useState<string>("");
  const [getRow, setGetRow] = useState<Merchant>();
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>(todayDate);
  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);
  const [sort, setSort] = useState({
    field: "",
    sort: "",
  });
  const [state, setState] = React.useState({
    projectId: undefined,
    projectName: undefined,
    companyId: undefined,
    webURL: undefined,
  });

  const { projectId, projectName, companyId, webURL } = state;

  const getMerchant = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: Merchant[];
      pagination: Pagination;
    }> = await ApiHandler(getAllMerchants, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      startTransition(() => {
        setPageCount(res?.body?.pagination?.totalItems);
        setMerchants(res.body?.data);
      });
    }
  };

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };
    if (projectId) paramsQuery.prbalance = parseInt(projectId, 10);
    if (projectName) paramsQuery.projectName = projectName;
    if (companyId) paramsQuery.merchantcomname = companyId;
    if (webURL) paramsQuery.webURL = webURL;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    startTransition(() => {
      void getMerchant(paramsQuery);
    });
  }, [
    pagination,
    fromDate,
    toDate,
    projectId,
    projectName,
    companyId,
    webURL,
    sort,
  ]);

  const [col, setColumns] = useState<any>(null);
  useEffect(() => {
    const storedColumnsJSON = localStorage.getItem("AllTransactions");
    if (storedColumnsJSON) {
      const storedColumns = JSON.parse(storedColumnsJSON);
      setColumns(storedColumns);
    }
  }, []);

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (projectId) paramsQuery.prbalance = parseInt(projectId, 10);
    if (projectName) paramsQuery.projectName = projectName;
    if (companyId) paramsQuery.merchantcomname = companyId;
    if (webURL) paramsQuery.webURL = webURL;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: Merchant[];
      pagination: Pagination;
    }> = await ApiHandler(getAllMerchants, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.id,
        "PROJECT ID": row?.projectId,
        "PROJECT Name": row?.projectName,
        COMPANY: row?.User?.firstname,
        URL: row?.webURL,
      });
    });

    void ExportCsv(reportHeaderval, "Merchants");
  }

  function handleClear() {
    setState({
      projectId: undefined,
      projectName: undefined,
      companyId: undefined,
      webURL: undefined,
    });
  }
  const onFilterChange = React.useCallback(
    (filterModel: any) => {
      setState((prevState) => ({
        ...prevState,
        [filterModel?.items[0]?.field]: filterModel?.items[0]?.value,
      }));
    },
    [setState],
  );

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort({ field: "", sort: "" });
    }
  }, []);

  const hadleDeleteLimit = async (id: any) => {
    setLoading(true);
    const [data, error] = await ApiHandler(deleteMerchants, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete Merchants");
    }
    if (data?.success) {
      const paramsQuery: FilterType = {
        pageSize: pagination.pageSize,
        pageNumber: pagination.page + 1,
        fromDate: fromDate ?? last10thDate,
        toDate: toDate ?? todayDate,
      };
      if (projectId) paramsQuery.prbalance = parseInt(projectId, 10);
      if (projectName) paramsQuery.projectName = projectName;
      if (sort) paramsQuery.field = sort.field;
      if (sort) paramsQuery.sort = sort.sort;

      void getMerchant(paramsQuery);
      toast.success("Merchants deleted successfully");
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "projectId",
      headerName: "ID",
      width: 100,
      renderCell: ({ row }: { row: Merchant }) => row?.projectId,
    },
    {
      field: "companyId",
      headerName: "COMPANY",
      flex: 1,
      minWidth: 120,
      valueGetter: ({ row }: { row: Merchant }) => row?.User?.firstname,
      renderCell: ({ row }: { row: Merchant }) => (
        <Link
          className="text-blue-600 underline"
          href={`/banking/companies/view/${row?.User?.companyProfileId}`}
        >
          {row?.User?.firstname} {row?.User?.lastname}
        </Link>
      ),
    },
    {
      minWidth: 200,
      field: "projectName",
      flex: 1,
      headerName: "PROJECT",
    },
    {
      minWidth: 150,
      flex: 1,
      field: "webURL",
      headerName: "URL",
      renderCell: ({ row }: { row: Merchant }) => (
        <Link href={row?.webURL} className="text-blue-600 underline">
          {row?.webURL}
        </Link>
      ),
    },

    {
      field: "actions",
      type: "actions",
      width: 80,
      getActions: ({ row }: { row: Merchant }) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            setGetId(row?.id);
            setOpenAdd("view");
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
          onClick={() =>
            enforcePermission("edit", [
              () => setGetRow(row),
              () => setGetId(row?.id),
              () => setOpenAdd("edit"),
            ])
          }
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
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (projectId) paramsQuery.prbalance = parseInt(projectId, 10);
    if (projectName) paramsQuery.projectName = projectName;
    if (sort) {
      paramsQuery.field = sort.field;
      paramsQuery.sort = sort.sort;
    }

    void getMerchant(paramsQuery);
  };

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

  return (
    <div className=" flex flex-col gap-3">
      <div className=" flex items-center justify-between pb-4 pt-4 ">
        <p className=" text-2xl font-bold">Merchants</p>
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
        <AddMarchants
          onClose={handleModalClose}
          openAdd={openAdd}
          getById={getId}
          getRowData={getRow}
          // marchants={recurringFeesDetails}
        />
      )}

      {openAdd === "view" && (
        <ViewMerchant
          onClose={handleModalClose}
          openAdd={openAdd}
          getById={getId}
        />
      )}

      <div className="tableComponent pt-5">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            rows={merchants}
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
            storageName={"AllTransactions"}
            getRowId={(row) => row?.projectId}
            onSortModelChange={onSortChange}
            pageSizeOptions={[25, 50, 100]}
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
          />
        </Box>
      </div>
    </div>
  );
};

export default Merchants;
