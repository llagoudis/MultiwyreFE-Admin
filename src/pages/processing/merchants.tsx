import React, { startTransition, useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
  type GridSortModel,
} from "@mui/x-data-grid";
import Image, { type StaticImageData } from "next/image";
import AddIcon from "~/assets/general/Add_Plus.svg";
import MuiButton from "~/components/common/Button";
import {
  getAllAcquirers,
  getAllCheckoutMerchants,
} from "~/service/ApiRequests";
import Link from "next/link";
import { deleteCheckoutMerchants } from "~/service/api/checkoutMerchant";
import { ExportCsv, getTodayAndLast10thDate } from "~/common/functions";
import { enforcePermission } from "~/utils/permissions";
import AddMarcharntsProcessing from "~/components/processing/AddMarcharntsProcessing";
import ViewMarchantProcessing from "~/components/processing/ViewMarchantProcessing";

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
  const intialSort = { field: "createdAt", sort: "DESC" };
  const [pageCount, setPageCount] = useState<number>(0);
  const [sort, setSort] = useState(intialSort);
  const [state, setState] = React.useState({
    projectId: undefined,
    projectName: undefined,
    companyId: undefined,
    webURL: undefined,
    payoutType: undefined,
  });
  const [acquirers, setAcquirers] = useState<Acquirer[]>([]);

  const { projectId, projectName, payoutType, companyId, webURL } = state;

  const getMerchant = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: Merchant[];
      pagination: Pagination;
    }> = await ApiHandler(getAllCheckoutMerchants, data);
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

  const paramsQuery: FilterType = {
    pageSize: pagination.pageSize,
    pageNumber: pagination.page + 1,
    fromDate: fromDate ?? last10thDate,
    toDate: toDate ?? todayDate,
  };

  useEffect(() => {
    if (projectId) paramsQuery.prbalance = parseInt(projectId, 10);
    if (projectName) paramsQuery.projectName = projectName;
    if (companyId) paramsQuery.merchantcomname = companyId;
    if (payoutType) paramsQuery.payoutType = payoutType;
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
    payoutType,
    companyId,
    webURL,
    sort,
  ]);

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: 1000000,
      pageNumber: 0,
    };
    const getAcquirers = async (data: FilterType) => {
      const [res, error]: APIResult<{
        data: Acquirer[];
        pagination: Pagination;
      }> = await ApiHandler(getAllAcquirers, data);

      if (res?.success) {
        setAcquirers(res?.body?.data);
      }
    };

    void getAcquirers(paramsQuery);
  }, []);

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
    }> = await ApiHandler(getAllCheckoutMerchants, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.id,
        "PROJECT NAME": row?.projectName,
        COMPANY: row?.User?.firstname + " " + row?.User?.lastname,
        URL: row?.webURL,
        "PAYOUT TYPE": row?.payoutType,
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
      payoutType: undefined,
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
    const [data, error] = await ApiHandler(deleteCheckoutMerchants, {
      id: id,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to delete Merchants");
    }
    if (data?.success) {
      toast.success("Merchants deleted successfully");

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
      minWidth: 150,
      flex: 1,
      field: "payoutType",
      headerName: "PAYOUT TYPE",
      type: "singleSelect",
      valueOptions: ["user", "dedicated"],
      renderCell: ({ row }: { row: Merchant }) => <div>{row?.payoutType}</div>,
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
        <AddMarcharntsProcessing
          onClose={() => setOpenAdd("")}
          onFetch={handleModalClose}
          openAdd={openAdd}
          getById={getId}
          getRowData={getRow}
          acquirers={acquirers}
        />
      )}

      {openAdd === "view" && (
        <ViewMarchantProcessing
          onClose={() => {
            setOpenAdd("");
          }}
          // payoutType={getRow?.payoutType === "User Selected" ? true : false}
          openAdd={openAdd}
          getById={getId}
          acquirers={acquirers}
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
