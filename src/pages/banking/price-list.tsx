import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import Button from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import FilterBtn from "~/assets/general/sortlines.svg";
import AddPluse from "~/assets/general/Add_Plus.svg";
import Image, { type StaticImageData } from "next/image";
import MuiSelect from "~/components/MuiSelect";
import DailogBox from "~/components/common/DailogBox";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import {
  clonePriceList,
  deletePriceList,
  fetchPriceList,
} from "~/service/ApiRequests";
import checkicon from "~/assets/general/check-one.svg";
import { enforcePermission } from "~/utils/permissions";

export interface currencyType {
  id: number;
  name: string;
}

interface filterType {
  label: string;
  name: string;
}

const filters: filterType[] = [
  { label: "Name", name: "Name" },
  { label: "Status", name: "Status" },
  { label: "Client type", name: "ClientType" },
  { label: "Standard", name: "Standard" },
  { label: "External Fee Enabled", name: "ExternalFeeEnabled" },
];

const Pricelist = () => {
  const router = useRouter();
  // const [pricelist] = useAsyncMasterStore("priceList");

  // page Navigation
  const onNavigate = useCallback(
    (path: string, data?: any) => {
      void router.push({ pathname: path, query: data });
    },
    [router],
  );

  const [priceLists, setPriceLists] = useState<PriceList[]>([]);

  const [tableLoading, setTableLoading] = useState(false);

  const getPriceList = async () => {
    setTableLoading(true);
    const [data, error]: APIResult<PriceList[]> =
      await ApiHandler(fetchPriceList);
    setTableLoading(false);
    if (error) {
      toast.error("Failed to load PriceLists");
    }

    if (data?.success) {
      setPriceLists(data.body);
    }
  };

  useEffect(() => {
    void getPriceList();
  }, []);

  const [openD, setOpenD] = React.useState(false);

  const handleDialog = () => {
    setOpenD(false);
  };

  const [checkedItems, setCheckedItems] = React.useState<string[]>([
    "Name",
    "ClientType",
    "ClientSubtype",
    "Standard",
    "ExternalFeeEnabled",
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

  // Function to handle checkbox state changes
  const handleCheckboxChange = (itemName: string) => {
    if (checkedItems.includes(itemName)) {
      setCheckedItems(checkedItems.filter((item) => item !== itemName));
    } else {
      setCheckedItems([...checkedItems, itemName]);
    }
  };

  const [successPopup, setSuccessPopup] = useState(false);
  const toggleSuccessPopup = () => {
    setSuccessPopup((prev) => !prev);
  };

  const hadleDeletePriceList = async (id: any) => {
    const [data, error] = await ApiHandler(deletePriceList, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete pricelist");
    }
    if (data?.success) {
      void getPriceList();
      // toast.success("Price List deleted successfully");
      setSuccessPopup(true);
    }
  };

  const handleClonePriceList = async (id: any) => {
    const [data, error] = await ApiHandler(clonePriceList, {
      id: id,
    });
    if (error) {
      toast.error("Failed to clone pricelist");
    }
    if (data?.success) {
      void getPriceList();
      toast.success("Price List cloned successfully");
    }
  };

  // columns
  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "NAME",
        flex: 1,
        minWidth: 100,
        renderCell: ({ row }: { row: PriceList }) => <a>{row?.name}</a>,
      },
      // {
      //   flex: 1,
      //   minWidth: 100,
      //   field: "Status",
      //   headerName: "STATUS",
      //   renderCell: ({}: { row: PriceList }) => <a>{"-"}</a>,
      // },
      {
        flex: 1,
        minWidth: 150,
        field: "clientType",
        headerName: "CLIENT TYPE",
        renderCell: ({ row }: { row: PriceList }) => (
          <a>{row?.clientType.toUpperCase()}</a>
        ),
      },
      {
        flex: 1,
        minWidth: 150,
        field: "standard",
        valueGetter: ({ row }: { row: PriceList }) =>
          row.standard ? "Yes" : "No",
        headerName: "STANDARD",
        renderCell: ({ row }: { row: PriceList }) => (
          <a>{row.standard ? "Yes" : "No"}</a>
        ),
      },
      {
        flex: 1,
        minWidth: 150,
        field: "externalFeeEnabled",
        headerName: "EXTERNAL FEE ENABLED",
        valueGetter: ({ row }: { row: PriceList }) =>
          row.externalFeeEnabled ? "Yes" : "No",
        renderCell: ({ row }: { row: PriceList }) => (
          <a>{row.externalFeeEnabled ? "Yes" : "No"}</a>
        ),
      },
      {
        field: "actions",
        headerName: "ACTION",
        type: "actions",
        width: 80,
        getActions: ({ row }: { row: PriceList }) => [
          <GridActionsCellItem
            key="view"
            label="View"
            onClick={() => {
              onNavigate(`/banking/price-list/${row.id}`);
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
              onNavigate(`/banking/price-list/price-list-form`, {
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
            onClick={() => {
              enforcePermission("delete", [
                () => void hadleDeletePriceList(row?.id),
              ]);

              // onNavigate(`/banking/price-list/price-list-form`, {
              //   id: row.id,
              // });
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
            key="clone"
            label="Clone"
            onClick={() => {
              enforcePermission("edit", [
                () => void handleClonePriceList(row?.id),
              ]);
              // onNavigate(`/banking/price-list/price-list-form`, {
              //   id: row.id,
              // });
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
    ],
    [onNavigate],
  );

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

  return (
    <div className="">
      <DailogBox
        maxWidth={"xs"}
        open={successPopup}
        handleClose={toggleSuccessPopup}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h2 className="text-2xl font-semibold text-black">
            {`Price list deleted`}
          </h2>
          <p>{`Price list was deleted successfully`}</p>
          <Button
            className="btn-solid w-full text-white"
            title="Close"
            onClick={toggleSuccessPopup}
          />
        </div>
      </DailogBox>
      <div className="flex items-center justify-between pb-8 pt-4">
        <div className="flex w-full items-center gap-2 ">
          <p className=" text-2xl font-bold text-[#1E293B]">Price list</p>
        </div>
        <div className="flex w-full items-center justify-end gap-4">
          {/* <p className="textLight">Filters</p>

          <button
            onClick={handleClick}
            className=" rounded-lg border border-[#E2E8F0] bg-white p-3"
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

          <Button
            onClick={() => {
              onNavigate("/banking/price-list/price-list-form");
            }}
            className=" btn-solid"
            title="Add new"
          >
            <Image src={AddPluse as StaticImageData} alt="Add new button" />
          </Button>
        </div>
      </div>
      {/* <div className="flex w-full items-center gap-2 py-4">
        <p className=" text-sm font-semibold">Selected items(2)</p>
        <div>
          <MuiSelect placeHolder="Select item" options={options} value="" />
        </div>
      </div> */}

      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            loading={tableLoading}
            storageName="pricelist"
            rows={priceLists}
            columns={columns}
            slotProps={{
              toolbar: { csvOptions: { fileName: "Price list Report" } },
            }}
            // columnVisibilityModel={{
            //   Name: checkedItems.includes("Name"),
            //   Status: checkedItems.includes("Status"),
            //   ClientType: checkedItems.includes("ClientType"),
            //   ClientSubtype: checkedItems.includes("ClientSubtype"),
            //   Standard: checkedItems.includes("Standard"),
            //   ExternalFeeEnabled: checkedItems.includes("ExternalFeeEnabled"),
            //   FxMarkupFees: checkedItems.includes("FxMarkupFees"),
            //   TransferFees: checkedItems.includes("TransferFees"),
            //   RecurringFees: checkedItems.includes("RecurringFees"),
            // }}
          />
        </Box>
      </div>
      {/* Dialog box */}
      <DailogBox open={openD} handleClose={handleDialog} />
    </div>
  );
};

export default Pricelist;
