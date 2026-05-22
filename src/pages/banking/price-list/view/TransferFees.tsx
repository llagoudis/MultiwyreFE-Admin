import React, { useState, Fragment, type FC, useEffect } from "react";
import { Box } from "@mui/material";
import Button from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import { GridActionsCellItem } from "@mui/x-data-grid";
import AddPluse from "~/assets/general/Add_Plus.svg";
import Image, { type StaticImageData } from "next/image";
import AddTransferFee from "~/components/pricelist/addTransfers";
import FilterBtn from "~/assets/general/sortlines.svg";
import Header from "~/components/common/Header";
import ViewTransferFee from "~/components/pricelist/ViewTransferFee";
import { currencyList, operationalTypes, statuslist } from "~/data/country";
import FilterComponent from "~/components/common/FilterComponent";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { useGlobalStore, usePriceStore } from "~/store";
import {
  createTransferFees,
  updateTransferFees,
} from "~/service/api/pricelists";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { deleteTransferfees } from "~/service/ApiRequests";
import { useRouter } from "next/router";
import { enforcePermission } from "~/utils/permissions";

type TransferFeesRow = { row: TransferFees };
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
  { label: "Currency", name: "Currency", type: "select", list: currencyList },
  { label: "Percent", name: "Percent", type: "text" },
  { label: "Fixed fee", name: "FixedFee", type: "text" },
  { label: "Minimum fee", name: "MinimumFee", type: "text" },
  { label: "Maximum fee", name: "MaximumFee", type: "text" },
];

const initTransferState = {
  id: NaN,
  priceListId: 0,
  name: "",
  status: "",
  validFrom: "",
  validTo: "",
  currencyId: "",
  percent: 0,
  fixedFee: 0,
  minimumFee: null,
  maximumFee: null,
  transferGroup: "",
  beneficiaryGroup: "",
  paymentMethod: "",
  createdAt: "",
};

const TransferFees: FC<CommonPricelistProps> = ({ data }) => {
  const [filterArray, setFilterArray] = useState<filterType[]>([]);
  const [masterPricelist] = useAsyncMasterStore("priceList");
  const [assets] = useAsyncMasterStore("assets");
  const [openAdd, setOpenAdd] = useState("");
  const [open, setOpen] = React.useState(false);
  const priceList = useGlobalStore((state) => state.pricelist);
  const [loading, setLoading] = useState(false);

  // const priceListName = masterPricelist.filter(
  //   (priceList) => priceList.id === data?.id,
  // )[0]?.name;

  const pricelist = useGlobalStore((state) => state.pricelist);

  // mui popper position
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const router = useRouter();
  const priceListId = Array.isArray(router.query.id) ? "" : router.query.id;
  const getPriceList = useGlobalStore((state) => {
    return state.getPriceList;
  });

  const [transferFeesDetails, setTransferFeesDetails] =
    useState<TransferFees>(initTransferState);

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
  const [operationTypeArray] = useAsyncMasterStore("operationType");
  const onSubmit = async (formValues: TransferFees) => {
    setLoading(true);
    const [res, error] =
      openAdd === "edit"
        ? await updateTransferFees({
            ...formValues,
            id: transferFeesDetails.id,
            status: formValues.status === "active",
          })
        : await createTransferFees({
            ...formValues,
            status: formValues.status === "active",
          });
    if (res?.success) {
      setLoading(false);
      const OperationType = operationTypeArray?.find(
        (obj) => obj.id === formValues.operationType,
      );
      res?.message && toast.success(res?.message);
      if (openAdd === "addNew") {
        usePriceStore.setState((prev) => {
          return {
            ...prev,
            TransferFees: [
              { ...res.body, OperationType },
              ...(prev.TransferFees ?? []),
            ],
          };
        });
      }
      if (openAdd === "edit") {
        usePriceStore.setState((prev) => {
          const newArray = [...(prev.TransferFees ?? [])];
          newArray.splice(
            newArray.findIndex((obj: any) => obj.id === transferFeesDetails.id),
            1,
          );
          return {
            ...prev,
            TransferFees: [{ ...res.body, OperationType }, ...newArray],
          };
        });
      }
    }
    if (error) {
    }
    setOpenAdd("");
    setTransferFeesDetails({ ...initTransferState });
  };

  const handleDeleteTransferFees = async (id: any) => {
    const [data, error] = await ApiHandler(deleteTransferfees, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete Transfer fees");
    }
    if (data?.success) {
      void getPriceList(Number(priceListId));
      usePriceStore.setState((prev) => prev);
      toast.success("Transfer fees deleted successfully");
    }
  };

  // columns
  const columns = [
    {
      field: "Pricelist",
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
      valueGetter: ({ row }: { row: TransferFees }) =>
        row.OperationType?.displayName,
      renderCell: ({ row }: { row: TransferFees }) => (
        <a>{row.OperationType?.displayName}</a>
      ),
    },
    {
      flex: 1,
      minWidth: 100,
      field: "status",
      headerName: "STATUS",
      renderCell: ({ row }: { row: TransferFees }) => (
        <a>{row.status ? "Active" : "Inactive"}</a>
      ),
      valueGetter: ({ row }: { row: TransferFees }) =>
        row.status ? "Active" : "Inactive",
    },

    {
      flex: 1,
      minWidth: 100,
      field: "currencyId",
      headerName: "CURRENCY",
      valueGetter: ({ row }: { row: RecurringFees }) =>
        assets.find((obj) => obj.fireblockAssetId === row.currencyId)?.name,
      renderCell: ({ row }: { row: RecurringFees }) => (
        <span>
          {assets.find((obj) => obj.fireblockAssetId === row.currencyId)?.name}
        </span>
      ),
    },
    {
      flex: 1,
      minWidth: 100,
      field: "percent",
      headerName: "PERCENT",
    },
    {
      flex: 1,
      minWidth: 100,
      field: "fixedFee",
      headerName: "FIXED FEE",
    },
    {
      flex: 1,
      minWidth: 100,
      field: "paymentMethod",
      headerName: "PAYMENT METHOD",
      renderCell: ({ row }: { row: TransferFees }) => (
        <p>{row.paymentMethod}</p>
      ),
    },
    {
      field: "actions",
      headerName: "ACTION",
      type: "actions",
      width: 80,
      getActions: ({ row }: TransferFeesRow) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            setTransferFeesDetails(row);
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
          onClick={() => {
            enforcePermission("edit", [
              () => setTransferFeesDetails(row),
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

        <GridActionsCellItem
          key="delete"
          label="Delete"
          onClick={() => {
            enforcePermission("delete", [
              () => void handleDeleteTransferFees(row?.id),
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
          <Header head="Transfer fees" />
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
              onClick={() => {
                enforcePermission("write", [() => setOpenAdd("addNew")]);
              }}
            >
              <Image src={AddPluse as StaticImageData} alt="Add new button" />
            </Button>
          </div>
        </div>
      )}

      {openAdd === "edit" && (
        <div className=" pb-8 pt-4">
          <Header head="Edit transfer fees" />{" "}
        </div>
      )}
      {openAdd === "addNew" && (
        <div className=" pb-8 pt-4">
          <Header head="Add transfer fees" />{" "}
        </div>
      )}

      {openAdd === "view" && (
        <div className=" pb-8 pt-4">
          <Header head="View transfer fees" />{" "}
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
                storageName="TransactionFees"
                rows={priceList?.TransferFees ?? []}
                columns={columns}
                slotProps={{
                  toolbar: { csvOptions: { fileName: "Transfer fees Report" } },
                }}
              />
            </Box>
          </div>
        </>
      )}
      {/* add staff  */}
      {(openAdd === "addNew" || openAdd === "edit") && (
        <AddTransferFee
          onClose={() => {
            setOpenAdd("");
          }}
          transferFees={transferFeesDetails}
          onSubmit={onSubmit}
          openAdd={openAdd}
          priceList={priceList}
          loading={loading}
        />
      )}

      {openAdd === "view" && (
        <ViewTransferFee
          onClose={() => {
            setOpenAdd("");
          }}
          transferFees={transferFeesDetails}
          openAdd={openAdd}
        />
      )}
    </Fragment>
  );
};

export default TransferFees;
