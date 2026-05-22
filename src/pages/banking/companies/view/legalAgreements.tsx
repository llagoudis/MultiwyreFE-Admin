import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import React, { useState, type FC, Fragment } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";
import AddPluse from "~/assets/general/Add_Plus.svg";
import AddLegalAgreements from "~/pages/banking/companies/AddLegalAgreements";
import MuiButton from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import Header from "~/components/common/Header";
import { documentType } from "~/data/country";
import FilterComponent from "~/components/common/FilterComponent";
import { enforcePermission } from "~/utils/permissions";

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
  { label: "Client", name: "client", type: "text" },
  { label: "Agreed At", name: "agreedAt", type: "date" },
  {
    label: "Document Type",
    name: "documment_type",
    type: "select",
    list: documentType,
  },
  { label: "Ip Address", name: "ip_address", type: "text" },
];

const LegalAgreements: FC<defaultCompanyProps> = ({ data }) => {
  const legalAgreements = data?.legalAgreements || [];

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
  };

  const applyFilter = (values: any) => {
    console.log("values: ", values);
  };
  const [openDialog, setopenDialog] = React.useState(false);

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
      field: "addedDate",
      headerName: "AGREED AT",
    },

    {
      flex: 1,
      minWidth: 180,
      field: "DocumentType",
      valueGetter: (params: { row: any }) =>
        params?.row?.DocumentType?.displayName || "-",
      renderCell: (params: { row: LegalAgreements }) => (
        <a>
          <span className="font-semibold text-black">
            {params?.row?.DocumentType?.displayName || "-"}
          </span>
        </a>
      ),
      headerName: "DOCUMENT TYPE",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "ipAddress",
      headerName: "IP ADDRESS",
      renderCell: (params: { row: LegalAgreements }) => (
        <a>
          <span className="font-semibold text-black">
            {params?.row?.ipAddress}
          </span>
        </a>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "documentLink",
      headerName: "LINK",
      renderCell: (params: { row: LegalAgreements }) => (
        <a
          href={params?.row?.documentLink}
          target="_blank"
          className="font-bold text-[#C3922E] underline"
        >
          Link
        </a>
      ),
    },
  ];

  return (
    <Fragment>
      {/* filters  */}
      {!openDialog && (
        <div className="flex items-center justify-between py-4">
          <Header head={"Legal agreement"} />
          <div className="flex items-center gap-4">
            {/* <p className="textLight">Filters</p>
            <button
              className=" rounded-lg border border-[#E2E8F0] bg-white p-3"
              onClick={handleClick}
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
                          Choose columns you want to see
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

            {legalAgreements.length > 0 && (
              <MuiButton title="Download" className="btn-solid"></MuiButton>
            )}

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
              storageName="legalAgreements"
              rows={legalAgreements}
              columns={columns}
            />
          </Box>
        </div>
      )}

      {/* add */}
      {openDialog && (
        <AddLegalAgreements
          onClose={() => {
            setopenDialog(false);
          }}
        />
      )}
    </Fragment>
  );
};

export default LegalAgreements;
