import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";
import { Box, Fade, Paper, Popper, ClickAwayListener } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import AddPluse from "~/assets/general/Add_Plus.svg";
import MuiButton from "~/components/common/Button";
import { getAllUserAssets } from "~/service/api";
import Link from "next/link";

export interface currencyType {
  id: number;
  name: string;
}

type dataType = {
  id: number;
  number: number;
  client_type: string;
  client: string;
  holder: string;
  provider_name: string;
  account_type: string;
  primary: boolean;
  status: string;
  provider: string;
  provider_number: number;
  provider_currency: string;
  dormant: string;
  balance: string;
};

interface filterType {
  label: string;
  name: string;
}

// filter options
const filters: filterType[] = [
  { label: "Number", name: "number" },
  { label: "Provider Number", name: "provider_number" },
  { label: "Account Type", name: "account_type" },
  { label: "Status", name: "status" },
  { label: "Provider Name", name: "provider_name" },
  { label: "Provider currency", name: "provider_currency" },
  { label: "Client type", name: "client_type" },
  { label: "Holder", name: "holder" },
  { label: "Dormant", name: "dormant" },
  { label: "Balance reconsillation ", name: "balance" },
];

const Account = () => {
  const router = useRouter();
  const [tableLoading, setTableLoading] = useState(false);

  // filter checked items
  const [checkedItems, setCheckedItems] = useState<string[]>([
    "number",
    "client_type",
    "client",
    "holder",
    "provider_name",
    "account_type",
    "primary",
    "status",
    "provider",
  ]);

  // mui popper position
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // filter open
  const [open, setOpen] = useState(false);
  const [userAssets, setUserAssets] = useState<any>([]);

  // popper handle change function
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((open) => !open);
  };

  // popper open and close
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  // Function to handle checkbox state changes
  const handleCheckboxChange = (itemName: string) => {
    if (checkedItems.includes(itemName)) {
      setCheckedItems(checkedItems.filter((item) => item !== itemName));
    } else {
      setCheckedItems([...checkedItems, itemName]);
    }
  };

  // columns
  const columns = [
    // { field: "id", headerName: "ID", width: 50, hideable: false },
    {
      field: "accountNumber",
      headerName: "NUMBER",
      flex: 1,
      minWidth: 100,
      renderCell: (params: { row: { accountNumber: string } }) => (
        <Link
          href={`/banking/account/view/${params?.row?.accountNumber}`}
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
        <p className="font-bold">
          {params?.row?.assetAddress}
        </p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      valueGetter: (params: { row: any }) =>
        params?.row?.User?.firstname + " " + params?.row?.User?.lastname,
      field: "firstname",
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
      field: "Type",
      valueGetter: (params: { row: any }) =>
        params?.row?.assetId === "EUR" ? "Standard" : "Crypto",
      headerName: "TYPE",
      renderCell: (params: { row: { assetId: string } }) => (
        <span>{params?.row?.assetId === "EUR" ? "Standard" : "Crypto"}</span>
      ),
    },
    {
      flex: 1,
      minWidth: 100,
      field: "Currency",
      valueGetter: (params: { row: any }) => params?.row?.Asset?.name,
      headerName: "PROVIDER CURRENCY",
      renderCell: (params: { row: any }) => (
        <p className=" font-bold">{params?.row?.Asset?.name}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 100,
      field: "Status",
      headerName: "STATUS",
      valueGetter: (params: { row: any }) =>
        params?.row?.User?.active ? "ACTIVE" : "INACTIVE",
      renderCell: (params: { row: any }) => (
        <span>{params?.row?.User?.active ? "ACTIVE" : "INACTIVE"}</span>
      ),
    },
    {
      flex: 1,
      minWidth: 100,
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
              `/banking/account/view/${params?.row?.accountNumber}`,
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
            handleNavigate("/banking/account/addAccount", {
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

  const getUserAssets = async () => {
    setTableLoading(true);
    const [data] = await getAllUserAssets();
    setTableLoading(false);
    if (data?.success) {
      setUserAssets(data.body);
    }
  };

  useEffect(() => {
    void getUserAssets();
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

          <Popper
            open={open}
            anchorEl={anchorEl}
            placement={"bottom-end"}
            transition
          >
            {({ TransitionProps }) => (
              <ClickAwayListener onClickAway={handleClose}>
                <Fade {...TransitionProps} timeout={350}>
                  <Paper
                    sx={{
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: 350,
                      maxWidth: 250,
                      overflowY: "scroll",
                      gap: 2,
                    }}
                  >
                    <div className="flex flex-col gap-3 px-2">
                      <p className="flex items-center justify-between">
                        <p className="font-semibold ">Filters</p>
                        <p className="cursor-pointer font-semibold text-[#C3922E]">
                          Reset
                        </p>
                      </p>

                      <p className="text-xs font-semibold">
                        Choose columns you want to see{" "}
                      </p>

                      <div className="flex flex-col gap-2">
                        {filters.map((item, i) => (
                          <div key={i} className="flex items-center">
                            <input
                              type="checkbox"
                              disabled={item.name === "id"}
                              checked={
                                checkedItems.includes(item.name) || false
                              }
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

          <MuiButton
            className="btn-solid"
            title="Add new"
            onClick={() => {
              handleNavigate("/banking/account/addAccount", {
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
            loading={tableLoading}
            rows={userAssets}
            storageName="banking_accounts"
            columns={columns}
            // columnVisibilityModel={{
            //   id: false,
            //   number: checkedItems.includes("number"),
            //   client: checkedItems.includes("client"),
            //   client_type: checkedItems.includes("client_type"),
            //   holder: checkedItems.includes("holder"),
            //   provider_name: checkedItems.includes("provider_name"),
            //   account_type: checkedItems.includes("account_type"),
            //   primary: checkedItems.includes("primary"),
            //   status: checkedItems.includes("status"),
            //   provider: checkedItems.includes("provider"),
            //   provider_currency: checkedItems.includes("provider_currency"),
            //   provider_number: checkedItems.includes("provider_number"),
            //   dormant: checkedItems.includes("dormant"),
            //   balance: checkedItems.includes("balance"),
            // }}
          />
        </Box>
      </div>
    </div>
  );
};

export default Account;
