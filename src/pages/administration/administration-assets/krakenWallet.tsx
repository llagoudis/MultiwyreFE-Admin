import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";

import MuiButton from "~/components/common/Button";
import { IoMdCopy } from "react-icons/io";
import { IoArrowUpCircleOutline } from "react-icons/io5";
import Image from "next/image";
// import TableComponent from "./TableComponentMaster"; // Commented out unused import
// import USDT from "~/assets/walleticons/ustd.svg"; // Commented out unused import
import { adminWithdraw } from "~/service/ApiRequests";
import TableComponentMaster from "./TableComponentMaster";
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

type submissionType = {
  amount: number;
  sourceAddress: string;
  destinationAddress: string;
  assetId: string;
};

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

type TableRow = { row: krakenBalance };

interface Props {
  data: any;
  walletsLoading: boolean;
}

const KrakenWallets = ({ data, walletsLoading }: Props) => {
  // Include getWallets in the dependency array

  const columns = [
    {
      field: "assetId",
      // minWidth: 200,
      flex: 1,
      headerName: "Currency",
      valueGetter: ({ row }: TableRow) => {
        return row?.id;
      },
      renderCell: (params: TableRow) => (
        <div className="flex items-center gap-5">
          <Image
            src={params.row.image}
            alt={params.row.id}
            width={25}
            height={25}
          />
          <p>{params?.row?.id}</p>
        </div>
      ),
    },

    {
      field: "balance",

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
      field: "euroBalance",
      // minWidth: 60,
      headerName: "Euro Balance",
      flex: 1,
      valueGetter: ({ row }: TableRow) =>
        sliceNumber(Number(row.euroBalance), 6),

      renderCell: (params: TableRow) => {
        const balance = Number(params?.row?.euroBalance);
        const bal = balance.toFixed(6);
        return (
          <div className="flex w-full items-center justify-between">
            <p>{bal}</p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-[100%]">
      <div className="tableComponent">
        <Box sx={{ p: 3, bgcolor: "white", width: "100%" }}>
          <MuiDataGrid
            rows={data}
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

export default KrakenWallets;
