"use client";
import React, { useState, useMemo, Fragment, useCallback } from "react";
import { changeDocumentStatus } from "~/service/api";
import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import { findColorCode } from "~/common/functions";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { statuslist } from "~/data/country";
import Image, { type StaticImageData } from "next/image";
import Button from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import AddPluse from "~/assets/general/Add_Plus.svg";
import AddDocument from "~/components/documents/AddDocument";
import MuiSelect from "~/components/MuiSelect";
import RequestDemo from "~/components/common/RequestDemo";
import FilterComponent from "~/components/common/FilterComponent";
import ConfirmationPopup from "~/components/documents/ConfirmationPopup";
import SuccessPopup from "~/components/documents/SuccessPopup";
import Header from "../common/Header";
import toast from "react-hot-toast";
import { useCompanyStore, usePersonsStore } from "~/store";
import { enforcePermission } from "~/utils/permissions";
// import FilterBtn from "~/assets/general/sortlines.svg";

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

const options = [
  {
    value: "delete",
    label: "Delete",
  },
  {
    value: "download",
    label: "Download",
  },
];

// filter options
const filters: filterType[] = [
  { label: "ID", name: "id", type: "text" },
  { label: "Type", name: "Type", type: "text" },
  { label: "State", name: "State", type: "select", list: statuslist },
  { label: "Country Code", name: "CountryCode", type: "text" },
  { label: "Number", name: "Number", type: "text" },
  { label: "Issued By", name: "IssuedBy", type: "text" },
  { label: "Issued Date", name: "IssuedDate", type: "date" },
  { label: "Valid Until", name: "ValidUntil", type: "date" },
];

interface addDocumentStateType {
  visible: boolean;
  data: Documents | undefined;
}

interface rowType {
  row: Documents;
}

type actionStateEnum =
  | "approved"
  | "confirm-delete"
  | "delete"
  | "confirm-reject"
  | "reject"
  | "";

interface DocumentsTableProps {
  data: Array<Documents>;
  userEmail?: string | undefined;
  companyMail?: string;
}
const DocumentsTable: React.FC<DocumentsTableProps> = ({
  data,
  userEmail,
  companyMail,
}) => {
  const isIndividual = window?.location?.pathname.includes("individuals");
  const [filterArray, setFilterArray] = useState<filterType[]>([]);
  //

  // mui popper position
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  // open close for mui popper
  const [open, setOpen] = React.useState(false);

  const [addDocument, setAddDocument] = useState<addDocumentStateType>({
    visible: false,
    data: undefined,
  });

  const [actionState, setActionState] = useState<{
    value: actionStateEnum;
    id: string | number | undefined;
  }>({ value: "", id: "" });

  const [requestDocumentPopup, setRequestDocumentPopup] = useState(false);

  const toggleRequestDocument = () => {
    setRequestDocumentPopup((prev) => !prev);
  };

  const toggleDocumentForm = (data: Documents | undefined = undefined) => {
    setAddDocument((prev) => ({
      ...prev,
      visible: data ? true : !prev.visible,
      data,
    }));
  };

  const onAction = useCallback(
    async (action: actionStateEnum | "clear", id?: string | number) => {
      if (action === "clear") {
        setActionState((prev) => ({
          ...prev,
          id: "",
          value: "",
        }));
        return;
      }
      //Final that States Calls the API directly
      if (["approved", "confirm-delete", "confirm-reject"].includes(action)) {
        const stateEnums: Record<string, "DELETE" | "APPROVED" | "REJECTED"> = {
          approved: "APPROVED",
          "confirm-delete": "DELETE",
          "confirm-reject": "REJECTED",
        };
        const currentAction = stateEnums[action];
        const docId = action === "approved" && id ? id : actionState.id;

        const [result, err] =
          currentAction && docId
            ? await documentDbAction(docId, currentAction)
            : [{ success: false }];

        if (result?.success) {
          setActionState((prev) => ({ ...prev, value: action, id: undefined }));
          if (isIndividual) {
            usePersonsStore.setState((prev) => {
              const documents = [...prev.documents];

              if (docId && currentAction) {
                const idx = documents.findIndex((item) => item.id === docId);

                if (currentAction === "DELETE") {
                  documents.splice(idx, 1);
                } else {
                  documents[idx]!.status = currentAction;
                }
              }

              return {
                ...prev,
                documents: [...documents],
              };
            });
          } else {
            useCompanyStore.setState((prev) => {
              const relatedDocuments = [...prev.relatedDocuments];

              if (docId) {
                const idx = relatedDocuments.findIndex(
                  (item) => item.id === docId,
                );
                if (currentAction === "DELETE") {
                  relatedDocuments.splice(idx, 1);
                } else if (
                  currentAction === "APPROVED" ||
                  currentAction === "REJECTED"
                ) {
                  relatedDocuments[idx]!.status = currentAction;
                }
              }

              return {
                ...prev,
                relatedDocuments: [...relatedDocuments],
              };
            });
          }
        }

        if (err) {
          toast.error(
            `Failed to ${
              action === "confirm-delete"
                ? "delete document"
                : "change document status"
            }`,
          );
        }
      } else {
        setActionState((prev) => ({
          ...prev,
          value: action,
          id,
        }));
      }
    },
    [actionState.id, isIndividual],
  );

  const documentDbAction = async (
    id: string | number,
    action: "DELETE" | "APPROVED" | "REJECTED",
  ) => {
    return await changeDocumentStatus(id, action);
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

  const applyFilter = () => {
    //
  };

  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget);
  //   setOpen((open) => !open);
  // };

  const handleClosePoper = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const columns = useMemo(() => {
    return [
      {
        field: "Type",
        headerName: "DOCUMENT TYPE",
        valueGetter: ({ row }: rowType) => {
          return row?.documentType.split(/(?=[A-Z])/).join(" ") || "-";
        },
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }: rowType) => (
          <p className="capitalize">
            {row?.documentType.split(/(?=[A-Z])/).join(" ") || "-"}
          </p>
        ),
      },
      {
        flex: 1,
        minWidth: 120,
        field: "status",
        headerName: "STATUS",
        renderCell: ({ row }: rowType) => (
          <p className={findColorCode(row?.status)}>{row?.status ?? "---"}</p>
        ),
      },
      {
        flex: 1,
        minWidth: 50,
        field: "File",
        headerName: "FILE",
        valueGetter: ({ row }: rowType) => {
          return row?.documentLink;
        },
        renderCell: ({ row }: rowType) => (
          <a
            href={row?.documentLink}
            target="_blank"
            className="font-bold text-[#C3922E] underline"
          >
            {row?.documentLink ? "Link" : "---"}
          </a>
        ),
      },
      // {
      //   flex: 1,
      //   minWidth: 120,
      //   field: "CountryCode",
      //   valueGetter: ({ row }: rowType) => {
      //     return row?.Country?.countryCode ?? "---";
      //   },
      //   headerName: "COUNTRY CODE",
      //   renderCell: ({ row }: rowType) => (
      //     <p className="">{row?.Country?.countryCode ?? "---"}</p>
      //   ),
      // },
      {
        flex: 1,
        minWidth: 150,
        field: "documentNumber",
        headerName: "DOCUMENT NUMBER",
        renderCell: ({ row }: rowType) => (
          <p className="">{row?.documentNumber ?? "---"}</p>
        ),
      },
      {
        flex: 1,
        minWidth: 100,
        field: "country",
        valueGetter: ({ row }: rowType) => {
          return row?.Country?.name ?? "---";
        },
        headerName: "COUNTRY",
        renderCell: ({ row }: rowType) => (
          <p className="">{row?.Country?.name ?? "---"}</p>
        ),
      },
      {
        flex: 1,
        minWidth: 100,
        field: "issuedDate",
        headerName: "ISSUED DATE",
        renderCell: ({ row }: rowType) => (
          <p className="">{row?.issuedDate ?? "---"}</p>
        ),
      },
      {
        flex: 1,
        minWidth: 150,
        field: "validTill",
        headerName: "VALID UNTIL",
        renderCell: ({ row }: rowType) => (
          <p className="">{row?.validTill ?? "---"}</p>
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Action",
        width: 80,
        getActions: ({ row }: { row: Documents }) => {
          const actions = [
            <GridActionsCellItem
              key="edit"
              label="Edit"
              onClick={() => {
                enforcePermission("edit", [() => toggleDocumentForm(row)]);
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
              key="approve"
              label="Approve"
              onClick={() => {
                enforcePermission("edit", [
                  () => void onAction("approved", row.id),
                ]);
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
              key="reject"
              label="Reject"
              onClick={() => {
                enforcePermission("edit", [
                  () => void onAction("reject", row.id),
                ]);
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
              key="requestNew"
              label="Request new"
              showInMenu
              onClick={() => {
                enforcePermission("edit", [() => toggleRequestDocument()]);
              }}
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
                enforcePermission("delete", [() => onAction("delete", row.id)]);
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
  }, [onAction]);

  return (
    <Fragment>
      {/* Approve */}
      <SuccessPopup
        open={actionState.value === "approved"}
        onClose={() => onAction("clear")}
        header="Approved"
        message="The document was approved successfull"
      />

      {/* Delete Confirmation */}
      <ConfirmationPopup
        open={actionState.value === "delete"}
        onClose={() => onAction("clear")}
        onConfirm={() => onAction("confirm-delete")}
        header="Are you sure want to delete this document?"
        subHeader="By doing this action the document will be removed permanently. Are
        you sure you want to reject this document"
      />

      {/* Delete Success */}
      <SuccessPopup
        open={actionState.value === "confirm-delete"}
        onClose={() => onAction("clear")}
        header="Deleted"
        message="The document was Deleted successfully"
      />

      {/* Reject Confirmation */}
      <ConfirmationPopup
        open={actionState.value === "reject"}
        onClose={() => onAction("clear")}
        onConfirm={() => onAction("confirm-reject")}
        header="Are you sure want to reject this document?"
        subHeader="By doing this action the document will be removed permanently. Are
        you sure you want to reject this document"
      />

      {/* Reject Success */}
      <SuccessPopup
        open={actionState.value === "confirm-reject"}
        onClose={() => onAction("clear")}
        header="Rejected"
        message="The document was rejected successfully"
      />
      {/* End */}

      {!addDocument.visible && (
        <div>
          <div className="flex items-center justify-between pb-8 pt-4">
            {isIndividual ? (
              <div className="flex w-full items-center gap-2">
                <p className=" text-sm font-semibold">Selected items(2)</p>
                <div>
                  <MuiSelect
                    placeHolder="Select item"
                    options={options}
                    value={""}
                  />
                </div>
              </div>
            ) : (
              <Header head={"Documents"} />
            )}
            <div className="flex w-full items-center justify-end gap-4">
              {/* <button
                className="rounded-lg border border-[#E2E8F0] bg-white p-3"
                onClick={handleClick}
              >
                <Image src={FilterBtn as StaticImageData} alt="filter" />
              </button> <p className="textLight">Filters</p>
              */}

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
                            <p className="cursor-pointer text-[#C3922E]">
                              Reset
                            </p>
                          </p>
                          <p className="text-xs font-semibold">
                            Choose columns you want to see
                          </p>
                          <div className="flex flex-col gap-2">
                            {filters.map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center px-2 "
                              >
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
                onClick={() => {
                  enforcePermission("write", [() => toggleDocumentForm()]);
                }}
                className="btn-solid"
              >
                <Image src={AddPluse as StaticImageData} alt="Add new" />
              </Button>
            </div>
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
      {!addDocument.visible && (
        <Fragment>
          <div className="tableComponent">
            <Box sx={{ width: "100%" }}>
              <MuiDataGrid
                checkboxSelection={isIndividual}
                storageName={"Documents_table"}
                rows={data}
                columns={columns}
              />
            </Box>
          </div>
          {/* Dialog box */}
          <RequestDemo
            open={requestDocumentPopup}
            userEmail={userEmail}
            companyMail={companyMail}
            handleClose={toggleRequestDocument}
          />
        </Fragment>
      )}

      {addDocument.visible && (
        <AddDocument
          values={addDocument.data}
          onClose={() => toggleDocumentForm()}
        />
      )}
    </Fragment>
  );
};

export default DocumentsTable;
