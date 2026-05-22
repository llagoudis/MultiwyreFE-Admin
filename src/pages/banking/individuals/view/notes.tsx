/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Image, { type StaticImageData } from "next/image";
import React, { useState } from "react";
import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import FilterBtn from "~/assets/general/sortlines.svg";
import AddPluse from "~/assets/general/Add_Plus.svg";
import AddNotes from "~/pages/banking/individuals/AddNotes";
import MuiButton from "~/components/common/Button";
import FilterComponent from "~/components/common/FilterComponent";
import { formatDate, formatDateTime } from "~/common/functions";
import { enforcePermission } from "~/utils/permissions";

export interface currencyType {
  id: number;
  name: string;
}

type dataType = {
  id: string;
  text: string;
  administrators: string;
  createdat: string;
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

const filters: filterType[] = [
  { label: "Id", name: "id", type: "text" },
  { label: "Text", name: "text", type: "text" },
  { label: "Notify Administrators", name: "administrators", type: "text" },
  { label: "Created at", name: "createdat", type: "date" },
];

const Notes = () => {
  const [openDialog, setopenDialog] = useState(false);

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

  // mui popper position
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  // open close for mui popper
  const [open, setOpen] = React.useState(false);

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

  // data grid rows
  const rows: dataType[] = [
    {
      id: "3228983289328",
      text: "This is test note",
      administrators: "Some administrators",
      createdat: "12.08.2023 12:00:00 Pm",
    },
  ];

  // datagrid columns
  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      minWidth: 100,
    },
    {
      flex: 1,
      minWidth: 120,
      field: "text",
      headerName: "TEXT",
      renderCell: (params: { row: { text: string } }) => (
        <a>
          <span className="font-semibold text-black">{params?.row?.text}</span>
        </a>
      ),
    },

    {
      flex: 1,
      minWidth: 180,
      field: "administrators",
      headerName: "NOTIFY ADMINISTRATORS",
    },

    {
      flex: 1,
      minWidth: 180,
      field: "createdat",
      headerName: "CREATED AT",
      renderCell: (params: { row: { createdat: string } }) => (
        <a>
          <span className="font-semibold text-black">
            {formatDate(params?.row?.createdat)}
          </span>
        </a>
      ),
    },
  ];

  return (
    <>
      {/* filters  */}
      {!openDialog && (
        <div className="flex items-center justify-end pb-8 pt-4">
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

            <MuiButton
              title="Add new"
              className="btn-solid"
              onClick={() => {
                enforcePermission("write", [() => setopenDialog(true)]);
              }}
            >
              <Image src={AddPluse as StaticImageData} alt="Add new button" />
            </MuiButton>
          </div>
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
      {!openDialog && (
        <div className="tableComponent">
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              storageName="ind_notes"
              rows={rows}
              columns={columns}
            />
          </Box>
        </div>
      )}

      {/* add staff  */}
      {openDialog && (
        <AddNotes
          onClose={() => {
            setopenDialog(false);
          }}
        />
      )}
    </>
  );
};

export default Notes;
