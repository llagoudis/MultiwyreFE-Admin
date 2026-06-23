import React, { useEffect, useState, startTransition } from "react";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { getAllMerchantWallets } from "~/service/ApiRequests";
import {
  ExportCsv,
  formatDateTime,
  getTodayAndLast10thDate,
} from "~/common/functions";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import CopyButton from "../../../assets/general/copyicon.svg";
import {
  type GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Image from "next/image";
import WalletsTabLayout from "~/components/WalletsTabLayout";

interface Merchant {
  projectId: number;
  projectName: string;
}

interface Project {
  id: number;
  Merchant: Merchant;
  address: string;
  assetId: string;
  balance: string;

  privateKey: string;
  publicKey: string;
  createdAt: string;
}

type TableRow = { row: UserAssets };
const MerchantWallets = () => {
  const { todayDate, last10thDate } = getTodayAndLast10thDate();
  const [fromDate, setFromDate] = useState<any>("");
  const [toDate, setToDate] = useState<any>("");

  const maskAddress = (address?: string): string => {
    if (address && address.length < 16) {
      // throw new Error("Address is too short to mask");
    }
    const firstFour = address ? address.slice(0, 16) : "";
    const masked = `${firstFour}...`;
    return masked;
  };

  const onCopy = (text: any) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // showMessage('Copied to clipboard!');
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        //
      });
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "createdAt",
      headerName: "DATE",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.createdAt, true) ?? "---"}</p>
      ),
    },
    {
      minWidth: 200,
      field: "projectId",
      flex: 1,
      headerName: "PROJECT ID",
      renderCell: ({ row }: TableRow) => (
        <p>{row?.Merchant?.projectName ?? "---"}</p>
      ),
    },

    {
      minWidth: 200,
      field: "assetId",
      flex: 1,
      headerName: "ASSETID",
    },
    {
      flex: 1,
      minWidth: 220,
      field: "assetAddress",
      headerName: "ADDRESS",
      renderCell: ({ row }: TableRow) => (
        <p className=" flex w-full justify-between">
          {maskAddress(row?.assetAddress)}{" "}
          <span
            className=" mr-2 cursor-pointer"
            onClick={() => onCopy(row?.assetAddress)}
          >
            <Image className=" cursor-pointer" src={CopyButton} alt="copy" />
          </span>
        </p>
      ),
    },
    // {
    //   flex: 1,
    //   minWidth: 200,
    //   field: "privateKey",
    //   headerName: "PRIVATE KEY",
    //   renderCell: ({ row }: TableRow) => (
    //     <p className=" flex w-full justify-between">
    //       {maskAddress(row?.privateKey)}
    //       <span
    //         className=" mr-2 cursor-pointer"
    //         onClick={() => onCopy(row?.privateKey)}
    //       >
    //         <Image className=" cursor-pointer" src={CopyButton} alt="copy" />
    //       </span>
    //     </p>
    //   ),
    // },
    // {
    //   flex: 1,
    //   minWidth: 200,
    //   field: "publicKey",
    //   headerName: "PUBLIC KEY",
    //   renderCell: ({ row }: TableRow) => (
    //     <p className=" flex w-full justify-between">
    //       {maskAddress(row?.publicKey)}
    //       <span
    //         className=" mr-2 cursor-pointer"
    //         onClick={() => onCopy(row?.publicKey)}
    //       >
    //         <Image className=" cursor-pointer" src={CopyButton} alt="copy" />
    //       </span>
    //     </p>
    //   ),
    // },
    {
      flex: 1,
      minWidth: 200,
      field: "balance",
      headerName: "BALANCE",
    },
  ];

  const [wallets, setWallets] = useState<Project[]>([]);

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 25,
    page: 0,
  });
  const [pageCount, setPageCount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState({
    field: "",
    sort: "",
  });
  const [state, setState] = React.useState({
    id: undefined,
    assetAddress: undefined,
    assetId: undefined,
    balance: undefined,

    privateKey: undefined,
    publicKey: undefined,
    createdAt: undefined,
    projectId: undefined,
  });

  const {
    id,
    assetAddress,
    assetId,
    balance,

    privateKey,
    publicKey,
    createdAt,
    projectId,
  } = state;

  const getReports = async (data: FilterType) => {
    setLoading(true);
    const [res, error]: APIResult<{
      data: Project[];
      pagination: Pagination;
    }> = await ApiHandler(getAllMerchantWallets, data);
    setLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body?.data) {
      startTransition(() => {
        setPageCount(res?.body?.pagination?.totalItems);
        setWallets(res.body?.data);
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
    if (id) paramsQuery.id = id;
    if (createdAt) paramsQuery.createdAt = createdAt;
    if (assetAddress) paramsQuery.assetAddress = assetAddress;
    if (assetId) paramsQuery.assetId = assetId;
    if (balance) paramsQuery.balance = balance;

    if (privateKey) paramsQuery.privateKey = privateKey;
    if (publicKey) paramsQuery.publicKey = publicKey;
    if (projectId) paramsQuery.adprojectname = projectId;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;
    startTransition(() => {
      void getReports(paramsQuery);
    });
  }, [
    pagination,
    fromDate,
    toDate,
    id,
    assetAddress,
    assetId,
    balance,

    privateKey,
    publicKey,
    createdAt,
    projectId,
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

    if (id) paramsQuery.id = id;
    if (createdAt) paramsQuery.createdAt = createdAt;
    if (assetAddress) paramsQuery.assetAddress = assetAddress;
    if (assetId) paramsQuery.assetId = assetId;
    if (balance) paramsQuery.balance = balance;

    if (privateKey) paramsQuery.privateKey = privateKey;
    if (publicKey) paramsQuery.publicKey = publicKey;
    if (projectId) paramsQuery.adprojectname = projectId;
    if (sort) paramsQuery.field = sort.field;
    if (sort) paramsQuery.sort = sort.sort;

    const [res, error]: APIResult<{
      data: UserAssets[];
      pagination: Pagination;
    }> = await ApiHandler(getAllMerchantWallets, paramsQuery);

    if (error) {
      return;
    }

    const reportHeaderval: TransactionReport[] = [];

    res?.body?.data?.map((row) => {
      reportHeaderval.push({
        ID: row?.id,
        "CREATED AT": formatDateTime(row?.createdAt),
        "PROJECT ID": row?.Merchant?.projectId,
        "PROJECT NAME": row?.Merchant?.projectName,
        CURRENCY: row?.assetId,
        ADDRESS: row?.assetAddress,
        "PRIVATE KEY": row?.privateKey,
        "PUBLIC KEY": row?.publicKey,
        BALANCE: row?.balance,
      });
    });

    void ExportCsv(reportHeaderval, "Wallets");
  }

  function handleClear() {
    setState({
      id: undefined,
      assetAddress: undefined,
      assetId: undefined,
      balance: undefined,
      privateKey: undefined,
      publicKey: undefined,
      createdAt: undefined,
      projectId: undefined,
    });
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

  const onFilterChange = React.useCallback(
    (filterModel: any) => {
      setState((prevState) => ({
        ...prevState,
        [filterModel?.items[0]?.field]: filterModel?.items[0]?.value,
      }));
    },
    [setState],
  );

  return (
    <WalletsTabLayout>
      {/* <div className=" flex items-center justify-between pb-4 pt-4">
        <p className=" text-2xl font-bold">merchant</p>
      </div> */}
      <MuiDataGrid
        rows={wallets}
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
        getRowId={(row) => row.id}
        onSortModelChange={onSortChange}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
      />
    </WalletsTabLayout>
  );
};

export default MerchantWallets;
