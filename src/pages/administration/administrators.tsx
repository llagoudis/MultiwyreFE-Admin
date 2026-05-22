import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";
import {
  Box,
  Fade,
  Paper,
  Popper,
  ClickAwayListener,
  Dialog,
} from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import MuiButton from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Sheld from "~/assets/general/sheld.svg";
import { ApiHandler } from "~/service/UtilService";
import {
  deleteAdminUser,
  fetchAdministrators,
} from "~/service/api/administrator";
import toast from "react-hot-toast";
import { enforcePermission } from "~/utils/permissions";

export interface currencyType {
  id: number;
  name: string;
}

interface filterType {
  label: string;
  name: string;
}

type TableRow = { row: AdministratorUsersType };

// filter options
const filters: filterType[] = [
  { label: "Id", name: "id" },
  { label: "First name", name: "first_name" },
  { label: "Last name", name: "last_name" },
  { label: "Email", name: "email" },
  { label: "Role", name: "role" },
  { label: "Enabled", name: "enabled" },
  { label: "Two Factor Auth", name: "two_factor_auth" },
];

const Administrators = () => {
  // router
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdministratorUsersType[]>([]);

  // filter checked items
  const [checkedItems, setCheckedItems] = React.useState<string[]>([
    "id",
    "first_name",
    "last_name",
    "email",
    "role",
    "enabled",
    "two_factor_auth",
  ]);

  // mui popper position
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  // filter open
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
  const [tableLoading, setTableLoading] = useState(false);

  // Function to handle checkbox state changes
  const handleCheckboxChange = (itemName: string) => {
    if (checkedItems.includes(itemName)) {
      setCheckedItems(checkedItems.filter((item) => item !== itemName));
    } else {
      setCheckedItems([...checkedItems, itemName]);
    }
  };

  const getAdminUsers = async () => {
    setTableLoading(true);

    const [data, error]: APIResult<AdministratorUsersType[]> =
      await ApiHandler(fetchAdministrators);
    setTableLoading(false);

    if (error) {
      toast.error("Failed to load users");
    }

    if (data?.success) {
      setAdminUsers(data.body);
    }
  };

  useEffect(() => {
    void getAdminUsers();
  }, []);

  const handleDeleteAdminUser = async (id: string) => {
    //
    const [response, err] = await deleteAdminUser(id);
    if (err) {
      toast.error("Failed to update admin user!!");
    }
    if (response?.success) {
      void getAdminUsers();
      setOpenDialog("deletedSuccess");
    }
  };

  // columns
  const columns = [
    {
      field: "id",
      minWidth: 150,
      flex: 1,
      headerName: "ID",
    },
    {
      field: "firstname",
      minWidth: 200,
      flex: 1,
      headerName: "FIRST NAME",
    },
    {
      field: "lastname",
      minWidth: 150,
      headerName: "LAST NAME",
      flex: 1,
    },
    {
      flex: 1,
      minWidth: 150,
      field: "email",
      headerName: "EMAIL",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "accessRoles",
      valueGetter: ({ row }: TableRow) => {
        return `${row?.accessRoles?.displayName}`;
      },
      renderCell: ({ row }: TableRow) => (
        <a>
          <span className="font-semibold text-black">
            {row?.accessRoles?.displayName}
          </span>
        </a>
      ),
      headerName: "ROLE",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "active",
      headerName: "ENABLED",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "two_factor_auth",
      headerName: "TWO FACTOR AUTH",
    },

    {
      field: "actions",
      type: "actions",
      width: 100,
      headerName: "ACTIONS",
      getActions: ({ row }: TableRow) => [
        // <GridActionsCellItem
        //   key="Show"
        //   onClick={() => {
        //     handleNavigate("/banking/companies/accDetails");
        //   }}
        //   label="Show"
        //   showInMenu
        //   sx={{
        //     margin: "0 1rem",
        //     padding: "5px 0",
        //     borderBottom: "1px solid #cdcdcd",
        //     width: "6rem",
        //     fontSize: "14px",
        //   }}
        // />,
        <GridActionsCellItem
          key="edit"
          onClick={() => {
            enforcePermission("super-edit", [
              () =>
                void handleNavigate("/administration/administrators/create", {
                  from: "edit",
                  firstname: row.firstname,
                  lastname: row.lastname,
                  email: row.email,
                  role: row.accessRoles.id,

                  azureId: row.azureId,
                }),
            ]);
          }}
          label="Edit"
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
          key="delete2FA"
          onClick={() => {
            enforcePermission("super-delete", [() => setOpenDialog("delete")]);
          }}
          label="Delete 2FA"
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
          onClick={() => {
            enforcePermission("super-delete", [
              () => void handleDeleteAdminUser(row?.azureId ?? ""),
            ]);

            // handleNavigate("/banking/companies/accDetails");
          }}
          label="Delete"
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            borderBottom: "1px solid #cdcdcd",
            width: "6rem",
            fontSize: "14px",
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

  return (
    <div className="">
      {/* delete 1 */}
      <Dialog
        open={openDialog === "delete"}
        onClose={() => {
          setOpenDialog("");
        }}
      >
        <div className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex  justify-between border-b-2 border-[#DFDDDD] pb-4 ">
            <p className=" text-sm font-bold sm:text-base lg:text-lg">
              Authorise action with 2FA
            </p>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-b-2 border-[#DFDDDD] py-4 md:flex-row">
            <Image src={Sheld as StaticImageData} alt="Sheld" />
            <div>
              <p className=" text-lg font-semibold">
                Enter your
                <span className=" font-bold text-[#C1922E]">2FA code</span>{" "}
                authorize this action.
              </p>
              <input
                className="mt-2 w-full rounded-md px-4 py-2 outline outline-1 outline-[#c4c4c4] placeholder:text-sm placeholder:font-normal "
                type="text"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-6 ">
            <button
              className=" cursor-pointer text-sm font-bold"
              onClick={() => {
                setOpenDialog("");
              }}
            >
              Cancel
            </button>
            <MuiButton
              className=" btn-solid bg-[#217EFD]"
              title={"Continue"}
              onClick={() => {
                setOpenDialog("deletedSuccess");
              }}
            />
          </div>
        </div>
      </Dialog>
      {/* delete 2 */}

      <DailogBox
        maxWidth={"xs"}
        open={openDialog === "deletedSuccess"}
        handleClose={() => {
          setOpenDialog("");
        }}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">Deleted</h1>
          <p>The API was Deleted successfully</p>

          <MuiButton
            className="btn-solid w-full"
            title="Close"
            onClick={() => {
              setOpenDialog("");
            }}
          ></MuiButton>
        </div>
      </DailogBox>

      {/* filters  */}
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">Administrators</p>
        <div className="flex items-center gap-4">
          {/* <p className="subText text-black">Filter</p>

          <button
            className="rounded-lg border border-[#E2E8F0] bg-white p-3"
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
            title="Add new"
            className="btn-solid"
            onClick={() => {
              handleNavigate("/administration/administrators/create", {
                from: "create",
              });
            }}
          ></MuiButton>
        </div>
      </div>

      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            storageName={"administration"}
            loading={tableLoading}
            rows={adminUsers}
            columns={columns}
            // columnVisibilityModel={{
            //   id: false,
            //   first_name: checkedItems.includes("first_name"),
            //   last_name: checkedItems.includes("last_name"),
            //   email: checkedItems.includes("email"),
            //   role: checkedItems.includes("role"),
            //   enabled: checkedItems.includes("enabled"),
            //   two_factor_auth: checkedItems.includes("two_factor_auth"),
            // }}
          />
        </Box>
      </div>
    </div>
  );
};

export default Administrators;
