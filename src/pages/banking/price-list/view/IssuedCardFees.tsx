import React, { useState, Fragment, type FC } from "react";
import { Box } from "@mui/material";
import Button from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import AddPluse from "~/assets/general/Add_Plus.svg";
import Image, { type StaticImageData } from "next/image";
import Header from "~/components/common/Header";
import ViewIssueCardFees from "~/components/pricelist/ViewIssueCardFees";
import FilterComponent from "~/components/common/FilterComponent";
import { ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import { currencyList, operationalTypes, statuslist } from "~/data/country";
import AddIssueCardFees from "~/components/pricelist/AddIssueCardFees";
import { enforcePermission } from "~/utils/permissions";

export interface currencyType {
  id: number;
  name: string;
}

type dataType = {
  id: number;
  Pricelist: string;
  Name: string;
  Operationtype: string;
  Status: string;
  Currency: string;
  Percent: string;
  FixedFee: string;
  MinimumFee: string;
  MaximumFee: string;
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
  // { label: "ID", name: "id", type: "text" },
  { label: "Price list", name: "Pricelist", type: "text" },
  { label: "Name", name: "Name", type: "text" },
  {
    label: "Operation type",
    name: "Operationtype",
    type: "select",
    list: operationalTypes,
  },
  { label: "Status", name: "Status", type: "select", list: statuslist },
  { label: "Currency", name: "Currency", type: "select", list: currencyList },
  { label: "Percent", name: "Percent", type: "text" },
  { label: "Fixed fee", name: "FixedFee", type: "text" },
  { label: "Minimum fee", name: "MinimumFee", type: "text" },
  { label: "Maximum fee", name: "MaximumFee", type: "text" },
];

const IssueCardFees: FC<CommonPricelistProps> = () => {
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

  const [openAdd, setOpenAdd] = useState("");

  const [open, setOpen] = React.useState(false);

  // popper handle change function
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((open) => !open);
  };

  // popper open and close
  const handleClosePopper = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  // mui popper position
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  // rows
  const rows: dataType[] = [
    {
      id: 1,
      Pricelist: "External cry..",
      Name: "External cry..",
      Operationtype: "Outgoing transfer",
      Status: "yes",
      Currency: "USTD",
      Percent: "0",
      FixedFee: "10",
      MinimumFee: "0",
      MaximumFee: "0",
    },
  ];
  // columns
  const columns = [
    {
      field: "Pricelist",
      headerName: "PRICE LIST",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "Name",
      headerName: "NAME",
      flex: 1,
      minWidth: 100,
    },
    {
      flex: 1,
      minWidth: 150,
      field: "Operationtype",
      headerName: "OPERRATION TYPE",
    },
    {
      flex: 1,
      minWidth: 100,
      field: "Status",
      headerName: "STATUS",
    },

    {
      flex: 1,
      minWidth: 100,
      field: "Currency",
      headerName: "CURRENCY",
    },
    {
      flex: 1,
      minWidth: 100,
      field: "Percent",
      headerName: "PERCENT",
    },
    {
      flex: 1,
      minWidth: 100,
      field: "FixedFee",
      headerName: "FIXED FEE",
    },
    {
      flex: 1,
      minWidth: 100,
      field: "MinimumFee",
      headerName: "MINIMUM FEE",
    },
    {
      flex: 1,
      minWidth: 100,
      field: "MaximumFee",
      headerName: "MAXIMUM FEE",
    },

    {
      headerName: "ACTION",

      field: "actions",
      type: "actions",
      width: 80,
      getActions: () => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => setOpenAdd("view")}
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
          onClick={() => enforcePermission("edit", [() => setOpenAdd("edit")])}
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #cdcdcd",
            width: "6rem",
            fontSize: "14px",
          }}
        />,

        // <GridActionsCellItem
        //   key="clone"
        //   label="Clone"
        //   showInMenu
        //   sx={{
        //     margin: "0 1rem",
        //     padding: "5px 0",
        //     borderBottom: "1px solid #cdcdcd",
        //     width: "6rem",
        //     fontSize: "14px",
        //   }}
        // />,
      ],
    },
  ];

  return (
    <Fragment>
      {!openAdd && (
        <div className=" flex items-center justify-between pb-8 pt-4 ">
          <Header head="Issue card fees" />
          <div className=" flex items-center gap-4">
            {/* <button
              onClick={handleClick}
              className="rounded-lg border border-[#E2E8F0] bg-white p-3"
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
                <ClickAwayListener onClickAway={handleClosePopper}>
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
              title="Add new"
              className=" btn-solid"
              onClick={() =>
                enforcePermission("write", [() => setOpenAdd("addNew")])
              }
            >
              <Image src={AddPluse as StaticImageData} alt="Add new button" />
            </Button>
          </div>
        </div>
      )}

      {openAdd === "edit" && (
        <div className=" pb-8 pt-4">
          <Header head="Edit Issue card fees" />{" "}
        </div>
      )}
      {openAdd === "addNew" && (
        <div className=" pb-8 pt-4">
          <Header head="Add Issue card fees " />{" "}
        </div>
      )}

      {openAdd === "view" && (
        <div className=" pb-8 pt-4">
          <Header head="View Issue card fees" />{" "}
        </div>
      )}

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

      {/* datagrid  */}
      {!openAdd && (
        <>
          <div className="tableComponent">
            <Box sx={{ width: "100%" }}>
              <MuiDataGrid
                storageName="IssueCardFees"
                checkboxSelection
                rows={rows}
                columns={columns}
                slotProps={{
                  toolbar: {
                    csvOptions: { fileName: "Issue card fees Report" },
                  },
                }}
              />
            </Box>
          </div>
        </>
      )}
      {/* add staff  */}
      {(openAdd === "addNew" || openAdd === "edit") && (
        <AddIssueCardFees
          onClose={() => {
            setOpenAdd("");
          }}
        />
      )}

      {openAdd === "view" && (
        <ViewIssueCardFees
          onClose={() => {
            setOpenAdd("");
          }}
        />
      )}
    </Fragment>
  );
};

export default IssueCardFees;
