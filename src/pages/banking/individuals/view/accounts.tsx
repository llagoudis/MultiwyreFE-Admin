import React, { useEffect, useState } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";
import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import AddPluse from "~/assets/general/Add_Plus.svg";
import Image, { type StaticImageData } from "next/image";
import Button from "~/components/common/Button";
import { useRouter } from "next/router";
import { statuslist } from "~/data/country";
import FilterComponent from "~/components/common/FilterComponent";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import Link from "next/link";
import { findColorCode } from "~/common/functions";
import toast from "react-hot-toast";
import {
  deleteUserAsset,
  updateUserAssetAccountStatus,
} from "~/service/api/accounts";

export interface currencyType {
  id: number;
  name: string;
}

type dataType = {
  id: number;
  Number: string;
  Name: string;
  Holder: string;
  Type: string;
  Primary: boolean;
  Status: string;
  Provider: string;
  Provider_currency: string;
  Provider_number: string;
};

type list = {
  label: string;
  value: string;
};

export interface filterType {
  label: string;
  name: string;
  type: string;
  list?: list[];
}

// filter options
const filters: filterType[] = [
  { label: "Number", name: "Number", type: "text" },
  { label: "Name", name: "Name", type: "text" },
  { label: "Holder", name: "Holder", type: "text" },
  { label: "Type", name: "Type", type: "text" },
  { label: "Primary", name: "Primary", type: "text" },
  { label: "Status", name: "Status", type: "select", list: statuslist },
  { label: "Provider", name: "Provider", type: "text" },
  { label: "Provider Currency", name: "Provider_currency", type: "text" },
  { label: "Provider Number", name: "Provider_number", type: "text" },
];

interface LegalAgreementsProps {
  userDetails: UserStore;
}

const Accounts: React.FC<LegalAgreementsProps> = ({ userDetails }) => {
  const [filterArray, setFilterArray] = useState<filterType[]>([]);

  const [accountRows, setAccountRows] = useState<any[]>([]);
  useEffect(() => {
    setAccountRows(
      (userDetails?.UserAssets ?? []).map((item: any) => ({
        ...item,
        status: item?.accountStatus ?? "PENDING",
      })),
    );
  }, [userDetails]);

  const setStatus = async (id: number | string, status: "APPROVED" | "REJECTED") => {
    const [res] = await updateUserAssetAccountStatus(id, status);
    if (!res?.success) {
      toast.error("Failed to update account status");
      return;
    }
    setAccountRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, status, accountStatus: status } : r)),
    );
    toast.success(`Account ${status.toLowerCase()}`);
  };
  const deleteRow = async (id: number | string) => {
    if (!window.confirm("Delete this account? This cannot be undone from this screen.")) {
      return;
    }
    const [res] = await deleteUserAsset(id);
    if (!res?.success) {
      toast.error("Failed to delete account");
      return;
    }
    setAccountRows((rs) => rs.filter((r) => r.id !== id));
    toast.success("Account deleted");
  };

  const handleCheckboxChange = (itemName: string) => {
    // Check if an object with the matching "name" property exists in filterArray
    const itemExists = filterArray.some((item) => item.name === itemName);

    if (itemExists) {
      // Remove the object from filterArray
      const updatedFilterArray = filterArray.filter(
        (item) => item.name !== itemName,
      );
      setFilterArray(updatedFilterArray);
    } else {
      // Find the filter object from the filters array based on itemName
      const filterToAdd = filters.find((filter) => filter.name === itemName);

      if (filterToAdd) {
        // Add the found filter object to filterArray
        setFilterArray([...filterArray, filterToAdd]);
      }
    }
    // Call updateFilterArray after modifying filterArray
  };

  const applyFilter = (values: any) => {
    console.log("values: ", values);
  };

  // mui popper position
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const [open, setOpen] = React.useState(false);

  // popper handle change function
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((open) => !open);
  };

  // rows
  const rows: dataType[] = [
    {
      id: 1,
      Number: "123123123",
      Name: "Amar",
      Holder: "Name",
      Type: "Primary account",
      Primary: true,
      Status: "New",
      Provider: "None",
      Provider_currency: "EUR",
      Provider_number: "1231231231",
    },
    {
      id: 2,
      Number: "123123123",
      Name: "Somename",
      Holder: "Name",
      Type: "Primary account",
      Primary: true,
      Status: "New",
      Provider: "None",
      Provider_currency: "EUR",
      Provider_number: "1231231231",
    },
    {
      id: 3,
      Number: "123123123",
      Name: "Somename",
      Holder: "Name",
      Type: "Primary account",
      Primary: true,
      Status: "New",
      Provider: "None",
      Provider_currency: "EUR",
      Provider_number: "1231231231",
    },
    {
      id: 4,
      Number: "123123123",
      Name: "Somename",
      Holder: "Name",
      Type: "Primary account",
      Primary: false,
      Status: "New",
      Provider: "None",
      Provider_currency: "EUR",
      Provider_number: "1231231231",
    },
  ];

  const router = useRouter();
  // page Navigation
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

  const [assets] = useAsyncMasterStore("assets");

  // columns
  const copyAddress = (addr?: string) => {
    if (!addr) return;
    void navigator.clipboard.writeText(addr).then(
      () => toast.success("Address copied"),
      () => toast.error("Copy failed"),
    );
  };

  const columns = [
    {
      flex: 0.7,
      minWidth: 110,
      field: "status",
      headerName: "STATUS",
      renderCell: (params: { row: { status: string } }) => {
        const status = String(params?.row?.status ?? "");
        const pending = status.toUpperCase() === "PENDING";
        return (
          <span
            className={`${findColorCode(status as never) ?? "p-2 font-bold"}${
              pending ? " rounded bg-amber-100 px-2 py-0.5" : ""
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      field: "asset",
      headerName: "ASSET",
      flex: 1,
      minWidth: 140,
      valueGetter: (params: { row: any }) =>
        `${params?.row?.assetId ?? ""} ${params?.row?.Asset?.name ?? ""}`.trim(),
      renderCell: (params: { row: any }) => (
        <div className="leading-tight">
          <p className="font-bold text-[#1E293B]">{params?.row?.assetId ?? "—"}</p>
          <p className="truncate text-xs text-slate-500">
            {params?.row?.Asset?.name ?? ""}
          </p>
        </div>
      ),
    },
    {
      flex: 1.6,
      minWidth: 260,
      field: "assetAddress",
      headerName: "WALLET ADDRESS",
      renderCell: (params: { row: any }) => {
        const addr = params?.row?.assetAddress ?? "";
        const pending =
          String(params?.row?.status ?? "").toUpperCase() === "PENDING";
        return (
          <div
            className={`flex w-full max-w-full items-start gap-2 overflow-hidden ${
              pending ? "rounded bg-amber-50/80 px-1 py-0.5" : ""
            }`}
          >
            <p className="min-w-0 flex-1 break-all font-semibold leading-snug">
              {addr || "—"}
            </p>
            {addr ? (
              <button
                type="button"
                className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                onClick={(e) => {
                  e.stopPropagation();
                  copyAddress(addr);
                }}
              >
                Copy
              </button>
            ) : null}
          </div>
        );
      },
    },
    {
      flex: 0.6,
      minWidth: 90,
      field: "Type",
      valueGetter: (params: { row: { assetId: string } }) =>
        params?.row?.assetId === "EUR" ? "Standard" : "Crypto",
      headerName: "TYPE",
      renderCell: (params: { row: { assetId: string } }) => (
        <span>{params?.row?.assetId === "EUR" ? "Standard" : "Crypto"}</span>
      ),
    },
    {
      flex: 0.8,
      minWidth: 110,
      field: "Balance",
      headerName: "BALANCE",
      valueGetter: (params: { row: any }) =>
        params?.row?.Asset?.name === "Bitcoin"
          ? parseFloat(params.row.balance).toFixed(
              params.row.balance === "0" ? 2 : 6,
            )
          : parseFloat(params.row.balance).toFixed(2),
      renderCell: (params: { row: any }) => (
        <span>
          {params?.row?.Asset?.name === "Bitcoin"
            ? parseFloat(params.row.balance).toFixed(
                params.row.balance === "0" ? 2 : 6,
              )
            : parseFloat(params.row.balance).toFixed(2)}
        </span>
      ),
    },
    {
      field: "accountNumber",
      headerName: "NUMBER",
      flex: 0.7,
      minWidth: 100,
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
      field: "__actions",
      headerName: "ACTIONS",
      minWidth: 200,
      flex: 0,
      sortable: false,
      filterable: false,
      renderCell: (params: { row: { id: number | string } }) => (
        <div className="flex items-center gap-1">
          <button
            className="rounded bg-green-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-green-600"
            onClick={() => setStatus(params.row.id, "APPROVED")}
          >
            Approve
          </button>
          <button
            className="rounded border border-red-400 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
            onClick={() => setStatus(params.row.id, "REJECTED")}
          >
            Reject
          </button>
          <button
            className="rounded bg-red-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-600"
            onClick={() => deleteRow(params.row.id)}
          >
            Del
          </button>
        </div>
      ),
    },
  ];

  // filter closing
  const handleClosePoper = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-end pb-8 pt-4">
        <div className="flex w-fit items-center justify-end gap-4">
          {/* <p className="textLight">Filters</p>
          <button
            onClick={handleClick}
            className=" rounded-lg border border-[#E2E8F0] bg-white p-3"
          >
            <Image src={FilterBtn as StaticImageData} alt="filter" />
          </button> */}

          <Popper
            open={open}
            anchorEl={anchorEl}
            placement={"bottom-end"}
            transition
          >
            {({ TransitionProps }) => (
              <ClickAwayListener onClickAway={handleClosePoper}>
                <Fade {...TransitionProps} timeout={350}>
                  <Paper
                    sx={{
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: 300,
                      overflowY: "scroll",
                      gap: 2,
                    }}
                  >
                    <div className="flex flex-col gap-3 px-2">
                      <p className="flex items-center justify-between">
                        <p className="font-semibold ">Filters</p>
                        <p className="cursor-pointer text-[#C3922E]">Reset</p>
                      </p>
                      <p className="text-xs font-semibold">
                        Choose columns you want to see{" "}
                      </p>
                      <div className="flex flex-col gap-2">
                        {filters.map((item, i) => (
                          <div key={i} className="flex items-center px-2 ">
                            <input
                              type="checkbox"
                              disabled={item.name === "id"}
                              checked={filterArray.some(
                                (val) => val.name === item.name,
                              )}
                              onChange={() => {
                                handleCheckboxChange(item.name);
                              }}
                              className={"cursor-pointer accent-black"}
                              id={item.name}
                            />
                            <label
                              className="cursor-pointer px-2"
                              htmlFor={`${item.name}`}
                            >
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Paper>
                </Fade>
              </ClickAwayListener>
            )}
          </Popper>

          <Button
            className="btn-solid"
            title="Add new"
            onClick={() => {
              handleNavigate("/banking/accounts/addAccount", {
                from: "create",
              });
            }}
          >
            <Image src={AddPluse as StaticImageData} alt="Add new button" />
          </Button>
        </div>
      </div>

      {/* dropdown filter  */}
      {filterArray?.length !== 0 && (
        <FilterComponent
          handleCheckboxChange={handleCheckboxChange}
          fields={filterArray}
          onCloseFilter={applyFilter}
          onReset={() => {
            setFilterArray([]);
          }}
        />
      )}

      <div className="tableComponent w-full min-w-0 overflow-x-auto">
        <p className="mb-2 text-sm text-slate-500">
          Use <b>ASSET</b> + <b>WALLET ADDRESS</b> to identify the right wallet
          (pending rows are highlighted).
        </p>
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            storageName="IndividualAccounts_v2"
            rows={accountRows}
            columns={columns}
            wrapText
            slotProps={{
              toolbar: { csvOptions: { fileName: "Individuals Accounts" } },
            }}
          />
        </Box>
      </div>
    </>
  );
};

export default Accounts;
