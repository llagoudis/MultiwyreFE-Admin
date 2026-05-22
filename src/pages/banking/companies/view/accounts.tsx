import Image, { type StaticImageData } from "next/image";
import React, { type FC, Fragment, useState, useEffect } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";

import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import AddPluse from "~/assets/general/Add_Plus.svg";

import { useRouter } from "next/router";
import MuiButton from "~/components/common/Button";
import Header from "~/components/common/Header";
import FilterComponent from "~/components/common/FilterComponent";
import Link from "next/link";

export interface currencyType {
  id: number;
  name: string;
}
type list = {
  label: string;
  value: string;
};

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

export interface filterType {
  label: string;
  name: string;
  type: string;
  list?: list[];
}

export const stateList = [
  { label: "New", value: "New" },
  { label: "Awaiting Inspection", value: "Awaiting Inspection" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Expired", value: "Expired" },
];

// filter options
const filters: filterType[] = [
  { label: "Number", name: "Number", type: "text" },
  { label: "Name", name: "Name", type: "text" },
  { label: "Holder", name: "Holder", type: "text" },
  { label: "Type", name: "Type", type: "text" },
  { label: "Primary", name: "Primary", type: "text" },
  { label: "Status", name: "Status", type: "select", list: stateList },
  { label: "Provider", name: "Provider", type: "text" },
  { label: "Provider Currency", name: "Provider_currency", type: "text" },
  { label: "Provider Number", name: "Provider_number", type: "text" },
];

const Accounts: FC<defaultCompanyProps> = ({ data }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const [open, setOpen] = React.useState(false);

  // popper handle change function
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((open) => !open);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const [filterArray, setFilterArray] = useState<filterType[]>([]);

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

  const columns = [
    {
      field: "accountNumber",
      headerName: "NUMBER",
      flex: 1,
      minWidth: 150,
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
      flex: 1,
      minWidth: 400,
      field: "assetAddress",
      headerName: "PROVIDER NUMBER",
      renderCell: (params: { row: any }) => (
        <p className="font-bold">{params?.row?.assetAddress}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "Type",
      valueGetter: (params: { row: { assetId: string } }) =>
        params?.row?.assetId === "EUR" ? "Standard" : "Crypto",
      headerName: "TYPE",
      renderCell: (params: { row: { assetId: string } }) => (
        <span>{params?.row?.assetId === "EUR" ? "Standard" : "Crypto"}</span>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "Currency",
      headerName: "PROVIDER CURRENCY",
      valueGetter: (params: { row: any }) => params?.row?.Asset?.name,

      renderCell: (params: { row: any }) => (
        <p className=" font-bold">{params?.row?.Asset?.name}</p>
      ),
    },
    // {
    //   flex: 1,
    //   minWidth: 100,
    //   field: "name",
    //   headerName: "HOLDER",
    //   renderCell: (params: { row: any }) => <span>{params?.row?.name}</span>,
    // },
    {
      flex: 1,
      minWidth: 100,
      field: "Balance",
      headerName: "CURRENT BALANCE",
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
      flex: 1,
      minWidth: 100,
      field: "Provider_name",
      headerName: "PROVIDER NAME",
      valueGetter: () => "Fireblocks",
      renderCell: () => <span>Fireblocks</span>,
    },
    {
      flex: 1,
      minWidth: 100,
      field: "client_type",
      headerName: "CLIENT TYPE",
      renderCell: () => "User",
      valueGetter: () => "User",
    },
  ];

  const [userAssets, setUserAssets] = useState<any>([]);

  useEffect(() => {
    const list = data?.company?.UserCompanyAssociations[0];
    const assets = list?.User?.UserAssets?.map((item: any) => ({
      name: `${list?.User?.firstname} ${list?.User?.lastname}`,
      ...item,
    }));
    setUserAssets(assets);
  }, [data]);

  return (
    <Fragment>
      <div className="flex items-center justify-between py-4">
        <Header head={"Accounts"} />

        <div className="flex items-center gap-4">
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
              <ClickAwayListener onClickAway={handleClose}>
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
                        <p className="cursor-pointer font-semibold text-[#C3922E]">
                          Reset
                        </p>
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
                        ))}{" "}
                      </div>{" "}
                    </div>
                  </Paper>
                </Fade>
              </ClickAwayListener>
            )}
          </Popper>

          <MuiButton
            title="Add new"
            className="btn-solid"
            onClick={() => {
              handleNavigate("/banking/accounts/addAccount", {
                from: "create",
              });
            }}
          >
            <Image src={AddPluse as StaticImageData} alt="Add new button" />
          </MuiButton>
        </div>
      </div>

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

      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            storageName="Accounts"
            rows={userAssets}
            columns={columns}
            slotProps={{
              toolbar: { csvOptions: { fileName: "Companies Accounts" } },
            }}
          />
        </Box>
      </div>
    </Fragment>
  );
};

export default Accounts;
