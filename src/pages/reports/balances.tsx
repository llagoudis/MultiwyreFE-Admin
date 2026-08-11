import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchDailyUserBalances } from "~/service/ApiRequests";
import {
  Debounce,
  ExportCsv,
  TestCoinName,
  formatDate,
  getTodayAndLast10thDate,
} from "~/common/functions";
import ReportTabsLayout from "~/components/ReportTabsLayout";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import MuiButton from "~/components/common/Button";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { getAllUserAssets } from "~/service/api";
import Pagination from "~/components/common/Pagination";
import Link from "next/link";
import {
  GridFilterModel,
  GridSortModel,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

interface filterType {
  label: string;
  name: string;
}

type TableRow = { row: UserAssets };

type UserAsset = {
  label: string;
  value: string;
  currencyName?: string;
  userIdNumber?: string;
  accountNumber?: string;
};

const AllTransactions = () => {
  // columns
  const columns = [
    { field: "id", headerName: "ID", width: 100 },

    {
      field: "clientName",
      valueGetter: ({ row }: TableRow) =>
        row?.User?.firstname + " " + row?.User?.lastname,
      headerName: "CLIENT NAME",
      flex: 1,
      minWidth: 120,

      renderCell: ({ row }: TableRow) => (
        <Link
          href={`/banking/individuals/view/${row?.User?.azureId}`}
          className="text-blue-600 underline"
        >
          {`${row?.User?.firstname ?? ""} ${row?.User?.lastname ?? ""}`}
        </Link>
      ),
    },

    {
      minWidth: 200,
      field: "accountNumber",
      flex: 1,
      headerName: "ACCOUNT NUMBER",
    },
    {
      minWidth: 150,
      flex: 1,
      field: "assetId",
      headerName: "CURRENCY",
      renderCell: ({ row }: TableRow) => (
        <Box className="flex items-center justify-around">
          <Image
            width={25}
            height={25}
            src={row?.Asset?.icon}
            alt={row?.assetId}
          />
          <p className="px-2">{TestCoinName(row?.assetId)}</p>
        </Box>
      ),
    },

    {
      minWidth: 200,
      field: "balance",
      flex: 1,
      headerName: "BALANCE",
    },
    {
      flex: 1,
      field: "createdAt",
      headerName: "CREATED AT",
      renderCell: ({ row }: TableRow) => (
        <span>{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  const [balances, setBalances] = useState<UserAssets[]>([]);

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);

  const { todayDate, last10thDate } = getTodayAndLast10thDate();

  const getUserAssets = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: UserAssets[];
      pagination: Pagination;
    }> = await ApiHandler(fetchDailyUserBalances, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res?.body?.data) {
      setPageCount(res?.body?.pagination?.totalItems);
      setBalances(res?.body?.data);
    }
  };

  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(todayDate);
  const [state, setState] = React.useState({
    accountNumber: undefined,
    id: undefined,
    currency: "",
    balance: undefined,
    clientName: undefined,
  });

  const { accountNumber, id, currency, balance, clientName } = state;
  const [sort, setSort] = useState({
    field: "",
    sort: "",
  });

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };

    if (currency) paramsQuery.assetId = currency;
    if (accountNumber) paramsQuery.accountNumber = accountNumber;
    if (id) paramsQuery.id = id;
    if (balance) paramsQuery.balance = balance;
    if (clientName) paramsQuery.clientName = clientName;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    void getUserAssets(paramsQuery);
  }, [
    pagination,
    fromDate,
    toDate,
    accountNumber,
    currency,
    id,
    balance,
    sort,
    clientName,
  ]);

  const onSortChange = React.useCallback((sortModel: GridSortModel) => {
    const { field, sort } = sortModel[0] ?? {};

    if (field && sort) {
      setSort({ field, sort: sort === "desc" ? "DESC" : "ASC" });
    } else {
      setSort({ field: "", sort: "" });
    }
  }, []);

  const onFilterChange = React.useCallback(
    (filterModel: GridFilterModel) => {
      const newState = { ...state };

      if (
        filterModel?.items[0]?.field === "assetId" &&
        filterModel?.items[0]?.value
      ) {
        newState.currency = filterModel?.items[0]?.value;
      } else if (
        filterModel?.items[0]?.field === "id" &&
        filterModel?.items[0]?.value
      ) {
        newState.id = filterModel?.items[0]?.value;
      } else if (
        filterModel?.items[0]?.field === "accountNumber" &&
        filterModel?.items[0]?.value
      ) {
        newState.accountNumber = filterModel?.items[0]?.value;
      } else if (
        filterModel?.items[0]?.field === "clientName" &&
        filterModel?.items[0]?.value
      ) {
        //
        newState.clientName = filterModel?.items[0]?.value;
      } else if (
        filterModel?.items[0]?.field === "balance" &&
        filterModel?.items[0]?.value
      ) {
        newState.balance = filterModel?.items[0]?.value;
      }

      setState(newState);
    },
    [state],
  );

  function handleChangeStartDate(e: any) {
    setFromDate(e.target.value);
  }

  function handleChangeEndDate(e: any) {
    setToDate(e.target.value);
  }

  function handleClear() {
    setState({
      accountNumber: undefined,
      id: undefined,
      currency: "",
      balance: undefined,
      clientName: undefined,
    });
  }

  async function handleExport() {
    const paramsQuery: FilterType = {
      pageSize: 100000000,
      fromDate: fromDate ?? last10thDate,
      toDate: toDate ?? todayDate,
    };
    if (currency) paramsQuery.assetId = currency;
    if (accountNumber) paramsQuery.accountNumber = accountNumber;
    if (id) paramsQuery.id = id;
    if (balance) paramsQuery.balance = balance;
    if (clientName) paramsQuery.clientName = clientName;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: UserAssets[];
      pagination: Pagination;
    }> = await ApiHandler(fetchDailyUserBalances, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: any[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.id,
        "FULL NAME": row?.User?.firstname + " " + row?.User?.lastname,
        "ACCOUNT NAME": row?.accountNumber ?? "",
        ASSETID: TestCoinName(row?.assetId) ?? "",
        BALANCE: row?.balance ?? "--",
        "CREATED AT": formatDate(row.createdAt) ?? "--",
      });
    });
    void ExportCsv(reportHeaderval, "Balances Report");
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

  return (
    <ReportTabsLayout>
      {/* filters  */}

      <div className=" flex flex-wrap gap-2 bg-[#E2E8F080] px-3 py-2">
        <div className="flex w-[200px]  flex-col gap-1">
          <label htmlFor="filter_id">Start Date</label>
          <TextField
            id="filter_id"
            variant="outlined"
            className=" bg-white"
            size="small"
            onChange={handleChangeStartDate}
            value={fromDate}
            type="date"
          />
        </div>

        <div className="flex w-[200px] flex-col gap-1">
          <label htmlFor="filter_id">End Date</label>
          <TextField
            id="filter_id"
            variant="outlined"
            className=" bg-white"
            size="small"
            onChange={handleChangeEndDate}
            value={toDate}
            type="date"
          />
        </div>

        {/* <div className="flex  w-[200px]  flex-col  gap-1 md:flex-1">
          <label htmlFor="filter_id">Currency</label>

          <Select
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e5e7eb",
              },
            }}
            size="small"
            value={currency}
            onChange={(e) => setCurrency(e?.target?.value)}
            className=" w-full rounded-md bg-white outline outline-1 outline-[#c4c4c4]"
          >
            {assets.map(
              (item) =>
                item.name !== "Any" && (
                  <MenuItem key={item.name} value={item.fireblockAssetId}>
                    <div className="flex items-center gap-2">
                      <Image
                        width="22"
                        height="22"
                        src={item.icon}
                        alt="icon"
                      />
                      {item.name}
                    </div>
                  </MenuItem>
                ),
            )}
          </Select>
        </div>

        <div className="flex  w-[250px]  flex-col   gap-1 md:flex-1">
          <label htmlFor="filter_id">Account Number</label>
          <Autocomplete
            size="small"
            className="bg-white"
            value={accountNumber}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" />
            )}
            onChange={(event: any, newValue: UserAsset | null) => {
              setAccountNumber(newValue);
            }}
            noOptionsText="Type to search"
            options={filtersOptions}
            onInputChange={handleInputChange}
            getOptionLabel={(option) => {
              return option.label ?? "";
            }}
            // isOptionEqualToValue={(_, option) => {
            //   return _.value === option.label;
            // }}
          />
        </div>

        <div className="flex  items-end gap-2">
          <MuiButton
            title={"Filter"}
            className="btn-solid"
            onClick={handleFilter}
          ></MuiButton>
          <MuiButton
            title={"Cancel"}
            onClick={handleClear}
            className="btn-outlined"
          ></MuiButton>
        </div> */}
      </div>

      {/* table component  */}
      <MuiDataGrid
        rows={balances}
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
        storageName={"Balances"}
        onSortModelChange={onSortChange}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />
    </ReportTabsLayout>
  );
};

export default AllTransactions;
