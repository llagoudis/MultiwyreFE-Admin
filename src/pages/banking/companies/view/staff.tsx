import Image, { type StaticImageData } from "next/image";
import React, { type FC, useState, Fragment } from "react";
import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import FilterBtn from "~/assets/general/sortlines.svg";
import AddPluse from "~/assets/general/Add_Plus.svg";
import MuiButton from "~/components/common/Button";
import { useRouter } from "next/router";
import Header from "~/components/common/Header";
import FilterComponent from "~/components/common/FilterComponent";
import DeleteStaffPopup from "../../company-staff/DeleteStaffPopup";
import { useCompanyStore } from "~/store";
import { enforcePermission } from "~/utils/permissions";
import Link from "next/link";

export interface currencyType {
  id: number;
  name: string;
}

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
  { label: "Company", name: "company", type: "text" },
  { label: "Person", name: "person", type: "text" },
  { label: "Access Roles", name: "access_roles", type: "text" },
  { label: "Enabled", name: "enabled", type: "text" },
];

const Staff: FC<defaultCompanyProps> = ({ data }) => {
  const company = data?.company;
  const associatedStaff = company?.UserCompanyAssociations || [];
  const router = useRouter();

  const [currentDelete, setCurrentDelete] = useState("");

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  // open close for mui popper
  const [open, setOpen] = React.useState(false);
  const [filterArray, setFilterArray] = useState<filterType[]>([]);

  const toggleDelete = (associationId?: string) => {
    setCurrentDelete(associationId ?? "");
  };

  const onDeleteConfirm = () => {
    useCompanyStore.setState((prev) => {
      const nextState = [...prev.company.UserCompanyAssociations];

      const idx = nextState.findIndex(
        (item) => String(item.id) === currentDelete,
      );

      nextState.splice(idx, 1);

      return {
        ...prev,
        company: { ...prev.company, UserCompanyAssociations: nextState },
      };
    });
    toggleDelete();
  };

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

  // page Navigation
  const handleNavigate = (
    path: string,
    data?: Record<string, string | number>,
  ) => {
    void router.push({
      pathname: path,
      query: data,
    });
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
      field: "companyName",
      headerName: "COMPANY",
      valueGetter: () => company.companyName,

      renderCell: () => (
        <a>
          <span className="text-[#1CBDAB]">{company.companyName}</span>
        </a>
      ),
    },

    {
      flex: 1,
      minWidth: 180,
      field: "person",
      headerName: "PERSON",
      valueGetter: (params: { row: any }) =>
        params.row?.UserByAzureId?.firstname +
        " " +
        params.row?.UserByAzureId?.lastname,
      renderCell: (params: { row: UserCompanyAssociations }) => (
        <Link
          href={`/banking/individuals/view/${params?.row?.UserByAzureId?.azureId}`}
          className="text-blue-600 underline"
        >
          {`${params?.row?.UserByAzureId?.firstname ?? ""} ${params?.row.UserByAzureId?.lastname ?? ""}`}
        </Link>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "access_roles",
      valueGetter: (params: { row: UserCompanyAssociations }) => {
        const isViewer = params.row?.roles.includes("ex_user_viewer");

        return isViewer ? "Viewer" : "Admin";
      },
      headerName: "ACCESS ROLES",
      renderCell: (params: { row: UserCompanyAssociations }) => {
        const isViewer = params.row?.roles.includes("ex_user_viewer");

        return (
          <a>
            <span>{isViewer ? "Viewer" : "Admin"}</span>
          </a>
        );
      },
    },
    {
      flex: 1,
      minWidth: 150,
      field: "enabled",
      headerName: "Enabled",
      valueGetter: (params: { row: { enabled: boolean } }) =>
        params?.row?.enabled ? "Yes" : "No",
      renderCell: (params: { row: { enabled: boolean } }) => (
        <a>
          <span>{params?.row?.enabled ? "Yes" : "No"}</span>
        </a>
      ),
    },

    {
      field: "actions",
      type: "actions",
      width: 100,
      headerName: "ACTIONS",
      getActions: ({ row }: { row: CompanyStaff }) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            handleNavigate("/banking/company-staff/view", {
              id: row.id,
              from: "company",
            });
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
          key="edit"
          label="Edit"
          onClick={() => {
            handleNavigate("/banking/company-staff/form", {
              from: "company",
              id: row.id,
            });
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
          key="delete"
          label="Delete"
          showInMenu
          onClick={() => {
            enforcePermission("delete", [() => toggleDelete(String(row.id))]);
          }}
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            color: "#FF0000",
            width: "6rem",
            fontSize: "14px",
          }}
        />,
      ],
    },
  ];

  return (
    <Fragment>
      {/* filters  */}
      <DeleteStaffPopup
        associationId={currentDelete}
        onClose={() => toggleDelete()}
        onConfirm={onDeleteConfirm}
      />
      <div className="flex items-center justify-between py-4">
        <Header head={"Staff"} />
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
            className="btn-solid"
            title="Add new"
            onClick={() => {
              handleNavigate("/banking/company-staff/form", {
                from: "company",
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
            storageName="Staff"
            rows={associatedStaff}
            columns={columns}
            checkboxSelection={true}
          />
        </Box>
      </div>
    </Fragment>
  );
};

export default Staff;
