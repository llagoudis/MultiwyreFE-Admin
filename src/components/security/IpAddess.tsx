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
  fetchIpAddress,
  fetchPriceList,
  upBlockIpAdderss,
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

const IpAddess = () => {
  const router = useRouter();
  // const [pricelist] = useAsyncMasterStore("priceList");

  // page Navigation
  const onNavigate = useCallback(
    (path: string, data?: any) => {
      void router.push({ pathname: path, query: data });
    },
    [router],
  );

  const [IpAddress, setIpAddress] = useState<IPAddress[]>([]);

  const [tableLoading, setTableLoading] = useState(false);

  const getIpAddress = async () => {
    setTableLoading(true);
    const [data, error]: APIResult<IPAddress[]> =
      await ApiHandler(fetchIpAddress);
    setTableLoading(false);
    if (error) {
      toast.error("Failed to load IpAddress");
    }

    if (data?.success) {
      setIpAddress(data.body);
    }
  };

  useEffect(() => {
    void getIpAddress();
  }, []);

  const [openD, setOpenD] = React.useState(false);

  const handleDialog = () => {
    setOpenD(false);
  };

  const [successPopup, setSuccessPopup] = useState(false);
  const toggleSuccessPopup = () => {
    setSuccessPopup((prev) => !prev);
  };

  const handleUnBlockIpAddress = async (id: any) => {
    const [data, error] = await ApiHandler(upBlockIpAdderss, {
      id,
    });
    if (error) {
      toast.error("Failed to Unblock IP Address");
    }
    if (data?.success) {
      void getIpAddress();
      setSuccessPopup(true);
    }
  };

  // columns
  const columns = useMemo(
    () => [
      {
        flex: 1,
        minWidth: 150,
        field: "IPAddress",
        headerName: "IP Address",
      },
      {
        flex: 1,
        minWidth: 150,
        field: "attempts",
        headerName: "ATTEMPTS TRIED",
      },
      {
        flex: 1,
        minWidth: 150,
        field: "bloked",
        headerName: "STATUS",
        valueGetter: ({ row }: { row: IPAddress }) =>
          row.blocked ? "BLOCKED" : "UNBLOCKED",
        renderCell: ({ row }: { row: IPAddress }) => (
          <a>{row.blocked ? "BLOCKED" : "UNBLOCKED"}</a>
        ),
      },
      {
        field: "actions",
        headerName: "ACTION",
        type: "actions",
        width: 80,
        getActions: ({ row }: { row: IPAddress }) => [
          <GridActionsCellItem
            key="unblock"
            label="Unblock"
            onClick={() => {
              enforcePermission("edit", [
                () => void handleUnBlockIpAddress(row?.id),
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
            {`IP Address unblocked successfully`}
          </h2>

          <Button
            className="btn-solid w-full text-white"
            title="Close"
            onClick={toggleSuccessPopup}
          />
        </div>
      </DailogBox>
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            loading={tableLoading}
            storageName="iPaddress"
            rows={IpAddress}
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

export default IpAddess;
