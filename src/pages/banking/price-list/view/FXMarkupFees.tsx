import React, { useState, Fragment, type FC } from "react";
import { useGlobalStore, usePriceStore } from "~/store";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import Image, { type StaticImageData } from "next/image";
import { ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import Button from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import AddPluse from "~/assets/general/Add_Plus.svg";
import FilterBtn from "~/assets/general/sortlines.svg";
import Header from "~/components/common/Header";
import FilterComponent from "~/components/common/FilterComponent";
import { currencyList, operationalTypes, statuslist } from "~/data/country";
import AddFxMarkupFees from "~/components/pricelist/AddFxMarkupFees";
import ViewAddFxMarkupFees from "~/components/pricelist/ViewAddFxMarkupFees";
import {
  createFXMarkupFees,
  updateFXMarkupFees,
} from "~/service/api/pricelists";
import toast from "react-hot-toast";
import { deleteFxmarkup } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { useRouter } from "next/router";
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

// filter options
const filters: filterType[] = [
  { label: "ID", name: "id", type: "text" },
  { label: "Price list", name: "Pricelist", type: "text" },
  { label: "Name", name: "Name", type: "text" },
  {
    label: "Operation type",
    name: "Operationtype",
    type: "select",
    list: operationalTypes,
  },
  { label: "Status", name: "Status", type: "select", list: statuslist },
  {
    label: "From Currency",
    name: "FromCurrency",
    type: "select",
    list: currencyList,
  },
  {
    label: "To Currency",
    name: "ToCurrency",
    type: "select",
    list: currencyList,
  },
  { label: "Percentage", name: "Percentage", type: "text" },
];

type FxRow = { row: FXMarkup };

const initMarkupState = {
  id: "",
  priceListId: "",
  name: "",
  operationType: "",
  status: false,
  validFrom: "",
  validTo: "",
  fromCurrencyId: "",
  toCurrencyId: "",
  percent: "",
  createdAt: "",
  updatedAt: "",
};
const FxMarkupFees: FC<CommonPricelistProps> = () => {
  const [filterArray, setFilterArray] = useState<filterType[]>([]);
  const [openAdd, setOpenAdd] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const priceListId = Array.isArray(router.query.id) ? "" : router.query.id;
  const getPriceList = useGlobalStore((state) => {
    return state.getPriceList;
  });

  const pricelist = useGlobalStore((state) => state.pricelist);

  const [fxMarkupDetails, setFxMarkupDetails] =
    useState<FXMarkup>(initMarkupState);
  const [open, setOpen] = React.useState(false);

  // mui popper position
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

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

  const [assets] = useAsyncMasterStore("assets");

  const handleDeleteFxMarkup = async (id: any) => {
    const [data, error] = await ApiHandler(deleteFxmarkup, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete fxmarkup");
    }
    if (data?.success) {
      toast.success("Fxmarkup deleted successfully");
      void getPriceList(Number(priceListId));
    }
  };

  const columns = [
    {
      field: "priceList",
      headerName: "PRICE LIST",
      flex: 1,
      minWidth: 100,
      valueGetter: () => {
        return pricelist.name;
      },
      renderCell: () => {
        return pricelist.name;
      },
    },
    {
      field: "name",
      headerName: "NAME",
      flex: 1,
      minWidth: 100,
    },
    {
      flex: 1,
      minWidth: 150,
      field: "operationType",
      headerName: "OPERATION TYPE",
      valueGetter: ({ row }: FxRow) =>
        row.operationType === "CurrencyConversion"
          ? "Currency conversion"
          : "---",
      renderCell: ({ row }: FxRow) =>
        row.operationType === "CurrencyConversion"
          ? "Currency conversion"
          : "---",
    },
    {
      flex: 1,
      minWidth: 100,
      field: "status",
      headerName: "STATUS",
      renderCell: ({ row }: FxRow) => (row.status ? "Active" : "Inactive"),
      valueGetter: ({ row }: FxRow) => (row.status ? "Active" : "Inactive"),
    },
    {
      flex: 1,
      minWidth: 100,
      field: "fromCurrencyId",
      headerName: "FROM CURRENCY",
      valueGetter: (params: any) => params.value,
      renderCell: (params: any) => (
        <span>
          {assets.find((obj) => obj.fireblockAssetId === params.value)?.name}
        </span>
      ),
    },
    {
      flex: 1,
      minWidth: 100,
      field: "toCurrencyId",
      headerName: "TO CURRENCY",
      valueGetter: (params: any) => params.value,
      renderCell: (params: any) => (
        <span>
          {assets.find((obj) => obj.fireblockAssetId === params.value)?.name}
        </span>
      ),
    },
    {
      flex: 1,
      minWidth: 100,
      field: "percent",
      headerName: "PERCENTAGE",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "ACTION",

      width: 80,
      getActions: ({ row }: FxRow) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            setFxMarkupDetails(row);
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
          key="delete"
          label="Delete"
          onClick={() => {
            enforcePermission("delete", [
              () => void handleDeleteFxMarkup(row?.id),
            ]);
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
            enforcePermission("edit", [
              () => setFxMarkupDetails(row),
              () => setOpenAdd("edit"),
            ]);
          }}
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

  const onSubmit = async (formValues: any) => {
    const {
      fromCurrencyId,
      name,
      id,
      percent,
      priceList,
      status,
      toCurrencyId,
      validFrom,
      validTo,
      priceListId,
      operationType,
    } = formValues;
    const requestBody = {
      operationType,
      fromCurrencyId,
      name,
      toCurrencyId,
      validFrom,
      validTo,
      percent,
      priceList,
      status: status === "Active",
      priceListId,
      id,
    };
    setLoading(true);
    await (
      openAdd === "edit"
        ? updateFXMarkupFees(requestBody)
        : createFXMarkupFees(requestBody)
    ).then(([res]) => {
      if (res?.success) {
        setLoading(false);
        res?.message && toast.success(res?.message);
        if (openAdd === "addNew") {
          usePriceStore.setState((prev) => {
            return {
              ...prev,
              FxMarkupFees: [res.body, ...(prev?.FxMarkupFees ?? [])],
            };
          });
        } else {
          usePriceStore.setState((prev) => {
            const newMarkupFees = [...(prev.FxMarkupFees ?? [])];
            newMarkupFees.splice(
              newMarkupFees.findIndex((obj: any) => obj.id === formValues.id),
              1,
            );
            return {
              ...prev,
              FxMarkupFees: [res.body, ...newMarkupFees],
            };
          });
        }
        setOpenAdd("");
        setFxMarkupDetails({ ...initMarkupState });
      }
    });
  };

  return (
    <Fragment>
      {!openAdd && (
        <div className=" flex items-center justify-between pb-8 pt-4 ">
          <Header head="FX Markup fees " />
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

      {openAdd === "edit" && (
        <div className=" pb-8 pt-4">
          <Header head="Edit FXmarkup fees " />{" "}
        </div>
      )}
      {openAdd === "addNew" && (
        <div className=" pb-8 pt-4">
          <Header head="Add FXmarkup fees " />{" "}
        </div>
      )}

      {openAdd === "view" && (
        <div className=" pb-8 pt-4">
          <Header head="View FXmarkup fees " />{" "}
        </div>
      )}
      {/* datagrid  */}
      {!openAdd && (
        <>
          <div className="tableComponent">
            <Box sx={{ width: "100%" }}>
              <MuiDataGrid
                storageName="FxMarkupFees"
                rows={pricelist.FxMarkupFees ?? []}
                columns={columns}
                slotProps={{
                  toolbar: {
                    csvOptions: { fileName: "FX Markup fees Report" },
                  },
                }}
              />
            </Box>
          </div>
        </>
      )}
      {/* add staff  */}
      {(openAdd === "addNew" || openAdd === "edit") && (
        <AddFxMarkupFees
          onClose={() => {
            setOpenAdd("");
            setFxMarkupDetails({ ...initMarkupState });
          }}
          fxMarkupDetails={fxMarkupDetails}
          onSubmit={onSubmit}
          openAdd={openAdd}
          loading={loading}
        />
      )}

      {openAdd === "view" && (
        <ViewAddFxMarkupFees
          onClose={() => {
            setOpenAdd("");
          }}
          fxMarkupDetails={fxMarkupDetails}
        />
      )}
    </Fragment>
  );
};

export default FxMarkupFees;
