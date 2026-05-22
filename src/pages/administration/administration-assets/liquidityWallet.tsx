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

type TableRow = { row: AdminWallets };

interface Props {
  data: any;
  walletsLoading: boolean;
}

const LiquidityWallets = ({ data, walletsLoading }: Props) => {
  const [wallets, setAdminWallets] = useState<AdminWallets[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<AdminWallets | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [reloadTransactions, setReloadTransactions] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      destinationAddress: "",
    },
  });

  const mapWallets = (data: WalletData[]): AdminWallets[] => {
    return data.map((wallet) => ({
      assetId: wallet.asset.fireblockAssetId,
      address: wallet.assetAddress,
      balance: wallet.balance,
      icon: wallet.asset.icon,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      id: wallet.id,
      name: wallet.asset.name,
    }));
  };

  const getWallets = useCallback(() => {
    setTableLoading(true);

    if (data.length > 0) {
      const realWallets = mapWallets(data);
      setAdminWallets(realWallets);
      setTableLoading(false);
    }
  }, [data]); // Add data as a dependency

  useEffect(() => {
    void getWallets();
  }, [getWallets]); // Include getWallets in the dependency array

  const handleTransferClick = (wallet: AdminWallets) => {
    setSelectedWallet(wallet);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    reset();
  };

  const columns = [
    {
      field: "assetId",
      minWidth: 200,
      flex: 1,
      headerName: "Currency",
      renderCell: (params: TableRow) => (
        <div className="flex items-center gap-5">
          <Image
            src={params.row.icon}
            alt={params.row.name}
            width={25}
            height={25}
          />
          <p>{params?.row?.assetId}</p>
        </div>
      ),
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
            }
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
            }
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
            }
          >
            <IoMdCopy />
          </IconButton>
        </div>
      ),
    },
    // {
    //   field: "transfer",
    //   minWidth: 60,
    //   headerName: "Transfer",
    //   flex: 1,
    //   renderCell: (params: TableRow) => (
    //     <div>
    //       <IconButton
    //         title="Transfer"
    //         onClick={() => handleTransferClick(params?.row)}
    //       >
    //         <IoArrowUpCircleOutline />
    //       </IconButton>
    //     </div>
    //   ),
    // },
  ];

  const onSubmit = async (data: {
    amount: any;
    destinationAddress: string;
  }) => {
    setLoading(true);
    const { amount, destinationAddress } = data;

    const reqBody: submissionType = {
      assetId: selectedWallet?.assetId ?? "",
      amount: amount,
      sourceAddress: selectedWallet?.address ?? "",
      destinationAddress,
    };

    const [res] = await ApiHandler(adminWithdraw, reqBody);

    setLoading(false);
    if (res?.success) {
      handleDialogClose();
      void getWallets();
      setReloadTransactions((prev) => !prev);
      toast.success("Transaction Submitted");
    }
  };

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

      {/* <div className="my-5 text-2xl font-semibold">Recent Transactions</div> */}

      {/* <TableComponentMaster reload={reloadTransactions} /> */}

      {/* <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle className="flex items-center gap-2">
          <Image
            src={selectedWallet?.icon ?? ""}
            width={25}
            height={25}
            alt=""
          />
          <p>
            {selectedWallet?.assetId ?? ""} {"  "} withdraw
          </p>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount and the destination address for the transfer.
          </DialogContentText>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="amount"
              control={control}
              rules={{ required: "Amount is required" }}
              render={({ field }) => (
                <TextField
                  autoFocus
                  margin="dense"
                  label="Amount"
                  type="number"
                  fullWidth
                  variant="standard"
                  {...field}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />
            <Controller
              name="destinationAddress"
              control={control}
              rules={{ required: "Destination address is required" }}
              render={({ field }) => (
                <TextField
                  margin="dense"
                  label="Destination Address"
                  type="text"
                  fullWidth
                  variant="standard"
                  {...field}
                  error={!!errors.destinationAddress}
                  helperText={errors.destinationAddress?.message}
                />
              )}
            />
            <DialogActions>
              <MuiButton className="btn-outline" onClick={handleDialogClose}>
                Cancel
              </MuiButton>
              <MuiButton className="btn-solid" loading={loading} type="submit">
                Transfer
              </MuiButton>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default LiquidityWallets;
