import React, { useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import Image from "next/image";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { fetchDailyUserBalances } from "~/service/ApiRequests";
import {
  TestCoinName,
  formatDate,
  getTodayAndLast10thDate,
  todaysDate,
} from "~/common/functions";
import ReportTabsLayout from "~/components/ReportTabsLayout";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import {
  type GridFilterModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";

interface TotalBalance {
  id: number;
  assetId: string;
  icon: string;
  balance: number;
  date: string;
}

type TableRow = { row: TotalBalance };

const AllTransactions = () => {
  const [balances, setBalances] = useState<TotalBalance[]>([]);

  const columns = [
    { field: "id", headerName: "ID", width: 100 },

    {
      minWidth: 150,
      flex: 1,
      field: "asset_icon",
      valueGetter: ({ row }: TableRow) => TestCoinName(row?.assetId),
      headerName: "CURRENCY",
      renderCell: ({ row }: TableRow) => (
        <Box className="flex items-center justify-around">
          <Image width={25} height={25} src={row?.icon} alt={row?.assetId} />
          <p className="px-2">{TestCoinName(row?.assetId)}</p>
        </Box>
      ),
    },

    {
      minWidth: 200,
      field: "balance",
      valueGetter: ({ row }: TableRow) => row.balance,
      flex: 1,
      headerName: "BALANCE",
    },

    {
      minWidth: 200,
      field: "date",
      flex: 1,
      headerName: "DATE",
    },
  ];

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10000000,
    page: 0,
  });
  const [loading, setLoading] = useState(false);

  const getUserAssets = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{ data: UserAssets[] }> = await ApiHandler(
      fetchDailyUserBalances,
      data,
    );
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res?.body?.data) {
      // const balanceMap = new Map<string, TotalBalance>();
      const dateMap = new Map<string, TotalBalance>();

      res.body.data.forEach((entry, i) => {
        const { assetId, balance, createdAt, Asset } = entry;
        const balanceValue = Number(balance);

        if (assetId === "ETH_TEST5") {
          console.log({ assetId });
        }
        const date = formatDate(createdAt);
        // Create a unique key based on assetId and date
        const key = `${assetId}-${date}`;

        if (dateMap.has(key)) {
          // If the entry already exists, update the balance
          dateMap.get(key)!.balance += balanceValue;
        } else {
          // Otherwise, create a new entry in the map
          dateMap.set(key, {
            assetId,
            date,
            icon: Asset?.icon,
            balance: balanceValue,
            id: i + 1,
          });
        }
      });

      const totalBalances = Array.from(dateMap.values());

      totalBalances.sort((a, b) => {
        const dateA = a.date.split("-").reverse().join("-");
        const dateB = b.date.split("-").reverse().join("-");

        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

      setBalances(totalBalances);
    }
  };

  const { last10thDate } = getTodayAndLast10thDate();
  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayDate = todaysDate(yesterday);

  const [fromDate, setFromDate] = useState<any>(last10thDate);
  const [toDate, setToDate] = useState<any>(yesterdayDate);
  const [asset, setAsset] = useState<any>("");
  const [id, setId] = useState<any>("");

  useEffect(() => {
    if (fromDate && toDate) {
      let paramsQuery: FilterType = {
        pageSize: pagination.pageSize,
        pageNumber: pagination.page,
        fromDate: fromDate ?? last10thDate,
        toDate: toDate ?? yesterdayDate,
      };

      asset ? (paramsQuery = { ...paramsQuery, assetId: asset }) : paramsQuery;
      id ? (paramsQuery = { ...paramsQuery, id: Number(id) }) : paramsQuery;

      void getUserAssets(paramsQuery);
    }
  }, [fromDate, toDate, asset, id]);

  function handleChangeStartDate(e: any) {
    setFromDate(e.target.value);
  }

  function handleChangeEndDate(e: any) {
    setToDate(e.target.value);
  }

  const handleExport = () => {
    // Your export logic here
  };

  const onFilterChange = React.useCallback((filterModel: GridFilterModel) => {
    if (
      filterModel?.items[0]?.field === "asset_icon" &&
      filterModel?.items[0]?.value
    ) {
      setAsset(filterModel?.items[0]?.value);
    } else if (
      filterModel?.items[0]?.field === "balance" &&
      filterModel?.items[0]?.value
    ) {
      setAsset(filterModel?.items[0]?.value);
    }

    if (filterModel?.items[0]?.field === "id" && filterModel?.items[0]?.value) {
      setId(filterModel?.items[0]?.value);
    }
  }, []);

  const GridToolbar = ({ handleExport }: any) => {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport
          csvOptions={{
            fileName: "Total Balances Report",
          }}
          onClick={handleExport}
        />
      </GridToolbarContainer>
    );
  };

  return (
    <ReportTabsLayout>
      <div className=" grid grid-cols-5 gap-5 bg-[#E2E8F080] px-3 py-2">
        <div className="flex w-full flex-col">
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

        <div className="flex w-full flex-col">
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
      </div>

      <MuiDataGrid
        rows={balances}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            printOptions: { disableToolbarButton: true },
            csvOptions: {
              onclick: handleExport,
            },
          },
        }}
        filterMode="server"
        onFilterModelChange={onFilterChange}
        storageName="TotalBalance"
        columns={columns}
        // columnVisibilityModel={{
        //   id: false,
        // }}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
      />
    </ReportTabsLayout>
  );
};

export default AllTransactions;
