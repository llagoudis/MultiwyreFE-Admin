import React, { Fragment, useState } from "react";
import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import { formatDate } from "~/common/functions";
import Image, { type StaticImageData } from "next/image";
import FilterBtn from "~/assets/general/sortlines.svg";
import AddPluse from "~/assets/general/Add_Plus.svg";
import AddLegalAgreements from "~/pages/banking/individuals/AddLegalAgreements";
import MuiButton from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import FilterComponent from "~/components/common/FilterComponent";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { deleteLegalAgreement } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { useGlobalStore } from "~/store";
import { useRouter } from "next/router";
import { enforcePermission } from "~/utils/permissions";

type list = {
  label: string;
  value: string;
};

interface addLegalAgrrementStateType {
  visible: boolean;
  data: LegalAgreements | undefined;
}

export interface filterType {
  label: string;
  name: string;
  type: string;
  list?: list[];
}

const filters: filterType[] = [
  { label: "Id", name: "id", type: "text" },
  { label: "Agreed At", name: "agreedAt", type: "date" },
  { label: "Document Type", name: "documentType", type: "text" },
  { label: "Ip Address", name: "ipAddress", type: "text" },
];

interface LegalAgreementsProps {
  userDetails: UserStore;
}

type TableRow = { row: LegalAgreements };

const LegalAgreements: React.FC<LegalAgreementsProps> = ({ userDetails }) => {
  const legalAgreements = userDetails?.LegalAgreements;
  const router = useRouter();
  const userId = Array.isArray(router.query.id) ? "" : router.query.id;
  const getUserById = useGlobalStore((state) => state.getPerson);
  const [filterArray, setFilterArray] = React.useState<filterType[]>([]);

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
    //
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

  const [legalAgreement, setLegalAgreement] =
    useState<addLegalAgrrementStateType>({
      visible: false,
      data: undefined,
    });

  const toggleLegalAgreementForm = (
    data: LegalAgreements | undefined = undefined,
  ) => {
    setLegalAgreement((prev) => ({
      ...prev,
      visible: data ? true : !prev.visible,
      data,
    }));
  };

  const onDelete = async (id: string | number) => {
    const [response, err] = await deleteLegalAgreement(id);
    if (err) {
      toast.error("Failed to delete legalAgreement!!");
    }
    if (response?.success) {
      if (userId) {
        void getUserById(userId);
      }
      toast.success("Legal agreement deleted successfully");
    }
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
      renderCell: ({ row }: TableRow) => <p>{formatDate(row.addedDate)}</p>,
    },
    {
      flex: 1,
      minWidth: 180,
      field: "documentType",
      valueGetter: ({ row }: TableRow) => row?.DocumentType.displayName,

      renderCell: ({ row }: TableRow) => (
        <a>
          <span className="font-semibold text-black">
            {row?.DocumentType.displayName}
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
      renderCell: (params: { row: { ipAddress: string } }) => (
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

    {
      field: "actions",
      type: "actions",
      headerName: "Action",
      width: 80,
      getActions: ({ row }: { row: LegalAgreements }) => {
        const actions = [
          <GridActionsCellItem
            key="edit"
            label="Edit"
            onClick={() => {
              enforcePermission("edit", [() => toggleLegalAgreementForm(row)]);
            }}
            showInMenu
            sx={{
              margin: "0 1rem",
              padding: "5px 0",
              borderBottom: "1px solid #E1DCDC",
              width: "6rem",
              fontSize: "14px",
            }}
          />,

          <GridActionsCellItem
            key="delete"
            label="Delete"
            onClick={() => {
              enforcePermission("delete", [() => void onDelete(row.id)]);
            }}
            showInMenu
            sx={{
              margin: "0 1rem",
              padding: "5px 0",
              width: "6rem",
              fontSize: "14px",
            }}
          />,
        ];

        if (row.status === "APPROVED") {
          actions.splice(1, 1);
        } else if (row.status === "REJECTED") {
          actions.splice(2, 1);
        }

        return actions;
      },
    },
  ];

  return (
    <Fragment>
      {/* filters  */}
      {!legalAgreement.visible && (
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
                enforcePermission("write", () => toggleLegalAgreementForm());
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
      {!legalAgreement.visible && (
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
      {/* add staff  */}
      {legalAgreement.visible && (
        <AddLegalAgreements
          values={legalAgreement.data}
          onClose={() => toggleLegalAgreementForm()}
        />
      )}
    </Fragment>
  );
};

export default LegalAgreements;
