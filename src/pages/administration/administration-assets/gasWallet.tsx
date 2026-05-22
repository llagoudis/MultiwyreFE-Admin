import React, { useEffect, useState, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import { useForm } from "react-hook-form";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import toast from "react-hot-toast";
import { IoMdCopy } from "react-icons/io";
import Image from "next/image";
import { sliceNumber } from "~/common/functions";

// Adjusted to reflect real data
export interface Asset {
  id: number;
  fireblockAssetId: string;
  name: string;
  icon: string;
  krakenAssetId: string;
}

export interface WalletData {
  assetId: any;
  id: number;
  adminUserId: string;
  asset: Asset;
  assetAddress: string;
  balance: string;
  bgcolor: string;
  color: string;
  createdAt: string;
  privateKey: string;
  publicKey: string | null;
  vaultId: string;
}

export interface currencyType {
  id: number;
  name: string;
}

interface AdminWallets extends CommonKeys {
  assetId: string;
  address: string;
  privateKey: string;
  publicKey: string | null;
  balance: string;
  icon: string;
  id: number;
  name: string;
}

type TableRow = { row: AdminWallets };

interface Props {
  data: any;
  walletsLoading: boolean;
}

const GasWallet = ({ data, walletsLoading }: Props) => {
  const [wallets, setAdminWallets] = useState<AdminWallets[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  // Removed unused state
  // const [loading, setLoading] = useState(false);

  // Removed unused variables
  // const {
  //   control,
  //   handleSubmit,
  //   reset,
  //   formState: { errors },
  // } = useForm({
  //   defaultValues: {
  //     amount: "",
  //     destinationAddress: "",
  //   },
  // });

  const mapWallets = (data: WalletData[]): AdminWallets[] => {
    return data.map((wallet) => ({
      assetId: wallet.assetId,
      address: wallet.assetAddress,
      balance: wallet.balance,
      icon: wallet.asset.icon,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      id: wallet.id,
      name: wallet.asset.name,
    }));
  };

  // Use useCallback to memoize getWallets function
  const getWallets = useCallback(() => {
    setTableLoading(true);

    if (data.length > 0) {
      const realWallets = mapWallets(data);
      setAdminWallets(realWallets);
      setTableLoading(false);
    }
  }, [data]);

  useEffect(() => {
    void getWallets();
  }, [getWallets]); // Include getWallets in the dependency array

  const columns = [
    {
      field: "assetId",
      minWidth: 200,
      flex: 1,
      headerName: "Currency",
      renderCell: (params: TableRow) => {
        const getPlatformName = (url: string) => {
          const match = url.match(/\(([^)]+)\)/);
          return match ? match[1] : "unknown";
        };

        const platformName: any = getPlatformName(params.row.icon);
        const platformSrcMap: Record<string, string> = {
          polygon:
            "https://cryptoprocessingstorage.blob.core.windows.net/static-images/polygon.svg",
          bsc: "https://cryptoprocessingstorage.blob.core.windows.net/static-images/bsc.svg",
          trc20:
            "https://cryptoprocessingstorage.blob.core.windows.net/static-images/trx.svg",
        };

        const newSrc = platformSrcMap[platformName] ?? params.row.icon;

        return (
          <div className="flex items-center gap-5">
            <Image src={newSrc} alt={params.row.name} width={25} height={25} />
            <p>{params?.row?.assetId}</p>
          </div>
        );
      },
    },
    {
      field: "address",
      minWidth: 410,
      headerName: "Address",
      flex: 1,
      renderCell: (params: TableRow) => (
        <div className="flex w-full items-center justify-between">
          <p>{params?.row?.address}</p>
          <IconButton
            onClick={() =>
              navigator.clipboard.writeText(params?.row?.address ?? "")
            } // Use nullish coalescing operator
          >
            <IoMdCopy />
          </IconButton>
        </div>
      ),
    },
    {
      field: "balance",
      minWidth: 60,
      headerName: "Balance",
      flex: 1,
      valueGetter: ({ row }: TableRow) => sliceNumber(row.balance, 6),
      renderCell: (params: TableRow) => {
        const balance = parseFloat(params?.row?.balance);
        const bal = balance.toFixed(6);
        return (
          <div className="flex w-full items-center justify-between">
            <p>{bal}</p>
          </div>
        );
      },
    },
    {
      field: "privateKey",
      minWidth: 60,
      headerName: "Private Key",
      flex: 1,
      renderCell: (params: TableRow) => (
        <div>
          <IconButton
            onClick={() =>
              navigator.clipboard.writeText(params?.row?.privateKey ?? "")
            } // Use nullish coalescing operator
          >
            <IoMdCopy />
          </IconButton>
        </div>
      ),
    },
    {
      field: "publicKey",
      minWidth: 60,
      headerName: "Public Key",
      flex: 1,
      renderCell: (params: TableRow) => (
        <div>
          <IconButton
            onClick={() =>
              navigator.clipboard.writeText(params?.row?.publicKey ?? "")
            } // Use nullish coalescing operator
          >
            <IoMdCopy />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <div className="tableComponent">
        <Box sx={{ p: 3, bgcolor: "white" }}>
          <MuiDataGrid
            rows={wallets}
            columns={columns}
            loading={walletsLoading}
            getRowId={(row) => row.id}
            autoHeight
            sx={{
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default GasWallet;
