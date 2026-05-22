import React, { useState, Fragment, type FC } from "react";
import { Box } from "@mui/material";
import Button from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import AddPluse from "~/assets/general/Add_Plus.svg";
import Image, { type StaticImageData } from "next/image";
import { ClickAwayListener, Fade, Paper, Popper } from "@mui/material";

import FilterBtn from "~/assets/general/sortlines.svg";
import Header from "~/components/common/Header";
import ViewRecurringFees from "~/components/pricelist/ViewRecurringFees";
import {
  currencyList,
  custom_price_list,
  operationalTypes,
  statuslist,
} from "~/data/country";
import FilterComponent from "~/components/common/FilterComponent";
import AddRecurringFees from "~/components/pricelist/AddRecurringFees";
import { useGlobalStore } from "~/store";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { ApiHandler } from "~/service/UtilService";
import { deleteRecurringfees } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { enforcePermission } from "~/utils/permissions";

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
// filter options
const filters: filterType[] = [
  // { label: "ID", name: "id", type: "text" },
  {
    label: "Price list",
    name: "Pricelist",
    type: "select",
    list: custom_price_list,
  },
  { label: "Name", name: "Name", type: "text" },
  {
    label: "Operation type",
    name: "Operationtype",
    type: "select",
    list: operationalTypes,
  },
  { label: "Status", name: "Status", type: "select" },
  { label: "Currency", name: "Currency", type: "select", list: currencyList },
  { label: "Percent", name: "Percent", type: "text" },
  { label: "Fixed fee", name: "FixedFee", type: "text" },
];

const initialRecurringFeesState: RecurringFees = {
  id: NaN,
  priceListId: 0,
  name: "",
  status: "",
  validFrom: "",
  validTo: "",
  currencyId: "",
  percentage: 0,
  fixedFee: 0,
  OperationType: undefined,
  operationType: 0,
  period: "",
};

const RecurringFees: FC<CommonPricelistProps> = ({ data }) => {
  const [openAdd, setOpenAdd] = useState<string>("");

  const [filterArray, setFilterArray] = useState<filterType[]>([]);
  const [recurringFeesDetails, setRecurringFeesDetails] =
    useState<RecurringFees>(initialRecurringFeesState);

  const router = useRouter();
  const priceListId = Array.isArray(router.query.id) ? "" : router.query.id;
  const getPriceList = useGlobalStore((state) => {
    return state.getPriceList;
  });

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

  const [assets] = useAsyncMasterStore("assets");
  const priceList = useGlobalStore((state) => state.pricelist);

  const handleDeleteRecurringFees = async (id: any) => {
    const [data, error] = await ApiHandler(deleteRecurringfees, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete Recurring fees");
    }
    if (data?.success) {
      void getPriceList(Number(priceListId));
      toast.success("Recurring fees deleted successfully");
    }
  };

  // columns
  const columns = [
    {
      field: "priceListName",
      headerName: "PRICE LIST",
      flex: 1,
      minWidth: 100,
      valueGetter: () => {
        return priceList.name;
      },
      renderCell: () => {
        return priceList.name;
      },
    },
    {
      field: "name",
      headerName: "NAME",
      flex: 1,
      minWidth: 100,
    },
    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "Operationtype",
    //   valueGetter: ({ row }: { row: RecurringFees }) =>
    //     row.OperationType?.displayName,

    //   headerName: "OPERATION TYPE",
    //   renderCell: ({ row }: { row: RecurringFees }) => (
    //     <a>{row.OperationType?.displayName}</a>
    //   ),
    // },
    {
      flex: 1,
      minWidth: 100,
      field: "status",
      headerName: "STATUS",
      valueGetter: ({ row }: { row: RecurringFees }) =>
        row.status ? "Active" : "Inactive",
      renderCell: ({ row }: { row: RecurringFees }) => (
        <a>{row.status ? "Active" : "Inactive"}</a>
      ),
    },

    {
      flex: 1,
      minWidth: 100,
      field: "Currency",
      valueGetter: ({ row }: { row: RecurringFees }) =>
        assets.find((obj) => obj.fireblockAssetId === row.currencyId)?.name,

      headerName: "CURRENCY",
      renderCell: ({ row }: { row: RecurringFees }) => (
        <span>
          {assets.find((obj) => obj.fireblockAssetId === row.currencyId)?.name}
        </span>
      ),
    },
    // {
    //   flex: 1,
    //   minWidth: 100,
    //   field: "percentage",
    //   headerName: "PERCENT",
    // },
    {
      flex: 1,
      minWidth: 100,
      field: "fixedFee",
      headerName: "FIXED FEE",
    },

    {
      field: "actions",
      type: "actions",
      width: 80,
      getActions: ({ row }: { row: RecurringFees }) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            setRecurringFeesDetails(row);
            setOpenAdd("view");
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
          onClick={() =>
            enforcePermission("edit", [
              () => setRecurringFeesDetails(row),
              () => setOpenAdd("edit"),
            ])
          }
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "6rem",
            fontSize: "14px",
          }}
        />,

        <GridActionsCellItem
          key="delete"
          label="Delete"
          onClick={() =>
            enforcePermission("delete", [
              () => void handleDeleteRecurringFees(row?.id),
            ])
          }
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

  return (
    <Fragment>
      {!openAdd && (
        <div className=" flex items-center justify-between pb-8 pt-4 ">
          <Header head="Recurring fees" />
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
          <Header head="Edit recurring fees " />{" "}
        </div>
      )}
      {openAdd === "addNew" && (
        <div className=" pb-8 pt-4">
          <Header head="Add recurring fees " />{" "}
        </div>
      )}

      {openAdd === "view" && (
        <div className=" pb-8 pt-4">
          <Header head="View recurring fees " />{" "}
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
                storageName="RecurringFees"
                rows={priceList.RecurringFees ?? []}
                columns={columns}
                slotProps={{
                  toolbar: {
                    csvOptions: { fileName: "Recurring fees Report" },
                  },
                }}
              />
            </Box>
          </div>
        </>
      )}
      {/* add staff  */}
      {(openAdd === "addNew" || openAdd === "edit") && (
        <AddRecurringFees
          onClose={() => {
            setOpenAdd("");
            setRecurringFeesDetails(initialRecurringFeesState);
          }}
          openAdd={openAdd}
          recurringFees={recurringFeesDetails}
        />
      )}

      {openAdd === "view" && (
        <ViewRecurringFees
          onClose={() => {
            setOpenAdd("");
          }}
          openAdd={openAdd}
          recurringFees={recurringFeesDetails}
        />
      )}
    </Fragment>
  );
};

export default RecurringFees;
