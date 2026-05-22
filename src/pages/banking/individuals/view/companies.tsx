/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Image, { type StaticImageData } from "next/image";
import React, { useState } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";
import AddIcon from "~/assets/general/Add_Plus.svg";
import { Box, Fade, Paper, Popper } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import { useRouter } from "next/router";
import MuiButton from "~/components/common/Button";
import FilterComponent from "~/components/common/FilterComponent";
import { stateList, verificaficationStatusList } from "~/data/country";
import { findColorCode, formatDate } from "~/common/functions";
import Link from "next/link";

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
  { label: "ID", name: "id", type: "text" },
  { label: "Name", name: "Name", type: "text" },
  { label: "Email", name: "Email", type: "text" },
  { label: "Phone", name: "Phone", type: "text" },
  {
    label: "Business Type",
    name: "BusinessType",
    type: "select",
    list: stateList,
  },
  { label: "URL", name: "Url", type: "text" },
  { label: "Owner", name: "Owner", type: "text" },
  { label: "State", name: "State", type: "select", list: stateList },
  {
    label: "Verification Status",
    name: "verification_status",
    type: "select",
    list: verificaficationStatusList,
  },
  { label: "Created at", name: "CreatedAt", type: "date" },
  {
    label: "Access roles",
    name: "access_roles",
    type: "select",
    list: stateList,
  },
  { label: "Created by agents", name: "created_by_agents", type: "text" },
];

interface CompaniesProps {
  userDetails: UserStore;
}

type CompanyRow = Row<UserCompanyAssociations>;

const Companies: React.FC<CompaniesProps> = ({ userDetails }) => {
  const router = useRouter();

  const companiesList = userDetails?.UserCompanyAssociations || [];

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
    // console.log("values: ", values);
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

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const onNavigation = (path: string, data?: any) => {
    void router.push({
      pathname: path, // Replace with the actual page path
      query: data,
    });
  };

  // page Navigation
  const handleNavigate = (path: string) => {
    router
      .push(path)
      .then(() => {
        // The navigation was successful
      })
      .catch((error) => {
        console.log("error: ", error);
        // Handle any errors that occur during navigation
      });
  };

  const columns = [
    { field: "id", headerName: "ID", minWidth: 150, hideable: false },
    {
      field: "Name",
      headerName: "NAME",
      hidden: true,
      valueGetter: ({ row }: CompanyRow) => row?.CompanyProfile?.companyName,
      minWidth: 150,
      renderCell: ({ row }: CompanyRow) => (
        <Link
          href={`/banking/companies/view/${row?.CompanyProfile?.id}`}
          className="text-blue-600 underline"
        >
          {row?.CompanyProfile?.companyName}
        </Link>
      ),
    },
    {
      minWidth: 200,
      field: "Owner",
      valueGetter: ({ row }: CompanyRow) =>
        row?.CompanyProfile?.verificationStatus,
      headerName: "OWNER",
      renderCell: ({ row }: CompanyRow) => (
        <a>{row?.CompanyProfile?.owner ?? "-"}</a>
      ),
    },
    {
      minWidth: 180,
      field: "verification_status",
      valueGetter: ({ row }: CompanyRow) =>
        row?.CompanyProfile?.verificationStatus,
      headerName: "VERIFICATION STATUS",
      renderCell: ({ row }: CompanyRow) => (
        <a
          className={findColorCode(
            row?.CompanyProfile?.verificationStatus ?? "PENDING",
          )}
        >
          {row?.CompanyProfile?.verificationStatus}
        </a>
      ),
    },
    {
      minWidth: 100,
      field: "State",
      headerName: "STATE",
      valueGetter: ({ row }: CompanyRow) =>
        row?.CompanyProfile?.CompanyEntityInfo?.state,
      renderCell: ({ row }: CompanyRow) => (
        <a>{row?.CompanyProfile?.CompanyEntityInfo?.state ?? "-"}</a>
      ),
    },
    {
      minWidth: 180,
      field: "Email",
      headerName: "EMAIL",
      valueGetter: ({ row }: CompanyRow) => row.CompanyProfile?.companyEmail,
      renderCell: ({ row }: CompanyRow) => row.CompanyProfile?.companyEmail,
    },
    {
      minWidth: 150,
      field: "Phone",
      headerName: "PHONE",
      valueGetter: ({ row }: CompanyRow) => (
        <a className="text-[#C3922E] underline">{row.CompanyProfile?.phone}</a>
      ),
      renderCell: ({ row }: CompanyRow) => (
        <a>{row.CompanyProfile?.phone ?? "-"}</a>
      ),
    },
    {
      minWidth: 150,
      field: "BusinessType",
      headerName: "BUSINESS TYPE",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "Url",
      headerName: "URL",
      valueGetter: ({ row }: CompanyRow) => row.CompanyProfile?.companyUrl,
      renderCell: ({ row }: CompanyRow) => (
        <a
          href={row.CompanyProfile?.companyUrl}
          target="_blank"
          className="font-bold text-[#C3922E] underline"
        >
          Link
        </a>
      ),
    },
    {
      minWidth: 150,
      field: "_roles",
      valueGetter: ({ row }: CompanyRow) =>
        row?.roles?.includes("ex_user_viewer") ? "Viewer" : "User",
      renderCell: ({ row }: CompanyRow) =>
        row?.roles?.includes("ex_user_viewer") ? "Viewer" : "User",
      headerName: "ROLES",
    },
    {
      minWidth: 150,
      field: "createdAt",
      headerName: "CREATED AT",
      valueGetter: ({ row }: CompanyRow) =>
        formatDate(row.CompanyProfile?.createdAt) ?? "-",
      renderCell: ({ row }: CompanyRow) =>
        formatDate(row.CompanyProfile?.createdAt) ?? "-",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 80,
      color: "red",
      getActions: ({ row }: CompanyRow) => [
        <GridActionsCellItem
          key="view"
          onClick={() => {
            onNavigation(`/banking/companies/view/${row?.CompanyProfile?.id}`);
          }}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #cdcdcd",
            width: "6rem",
            fontSize: "14px",
          }}
          label="View"
          showInMenu
        />,
        <GridActionsCellItem
          key="edit"
          label="Edit"
          onClick={() =>
            handleNavigate(
              `/banking/companies/company-form?id=${row?.CompanyProfile?.id}`,
            )
          }
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "6rem",
            fontSize: "14px",
          }}
        />,
      ],
    },
  ];

  return (
    <>
      <div className=" flex items-center justify-end pb-8 pt-4 ">
        {/* <p className=" text-2xl font-bold">Companies</p> */}
        <div className=" flex items-center gap-4">
          {/* <p className="textLight">Filters</p>
          <button
            className="rounded-lg border border-[#E2E8F0] bg-white p-3"
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
            onClick={() => {
              onNavigation("/banking/companies/company-form");
            }}
            className="btn-solid"
          >
            <Image src={AddIcon as StaticImageData} alt="Add new button" />
          </MuiButton>
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

      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            storageName="companies"
            rows={companiesList}
            columns={columns}
          />
        </Box>
      </div>
    </>
  );
};

export default Companies;
