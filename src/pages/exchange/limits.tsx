import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import FilterBtn from "~/assets/general/sortlines.svg";
import { Box, Fade, Paper, Popper, ClickAwayListener } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import Button from "~/components/common/Button";
import checkicon from "~/assets/general/check-one.svg";
import { ApiHandler } from "~/service/UtilService";
import { useRouter } from "next/router";

import MuiButton from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import {
  getAllExchangeLimits,
  deleteExchangeLimit,
  deleteLimitList,
} from "~/service/api/exchangeLimits";
import { formatDate } from "~/common/functions";
import toast from "react-hot-toast";
import { fetchLimitList } from "~/service/ApiRequests";
import { enforcePermission } from "~/utils/permissions";
export interface currencyType {
  id: number;
  name: string;
}

interface filterType {
  label: string;
  name: string;
}

// filter options
const filters: filterType[] = [
  { label: "Id", name: "id" },
  { label: "Provider", name: "provider" },
  { label: "Currency", name: "currency" },
  { label: "Amount", name: "amount" },
  { label: "Exchange limit type", name: "exchange_limit_type" },
  { label: "Limit type", name: "limit_type" },
  { label: "Status", name: "status" },
  { label: "Created ay", name: "created_at" },
  { label: "Updated at", name: "updated_at" },
];

const Limits = () => {
  // router
  const router = useRouter();

  // filter open
  const [limits, setLimits] = useState<any>([]);

  // naivigation
  const handleNavigate = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  const [openDialog, setOpenDialog] = useState("");
  const [deleteLimitId, setDeleteLimitId] = useState("");
  // columns
  const columns = [
    {
      field: "id",
      headerName: "Id",
      width: 200,
    },
    {
      field: "name",
      headerName: "NAME",
      width: 200,
      flex: 1,
    },

    {
      flex: 1,
      minWidth: 150,
      field: "clientType",
      headerName: "CLIENT TYPE",
      // renderCell: ({ row }: { row: Limits }) => (
      //   <a>{row?.clientType.toUpperCase()}</a>
      // ),
    },
    // {
    //   minWidth: 200,
    //   field: "provider",
    //   headerName: "PROVIDER",
    //   valueGetter: () => "Fireblocks",
    //   flex: 1,
    //   renderCell: () => <span>Fireblocks</span>,
    // },
    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "currency",
    //   valueGetter: (params: { row: any }) => params?.row?.Asset?.name,
    //   headerName: "CURRENCY",
    //   renderCell: (params: { row: any }) => (
    //     <span>{params?.row?.Asset?.name}</span>
    //   ),
    // },

    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "amount",
    //   headerName: "AMOUNT",
    // },

    // {
    //   flex: 1,
    //   minWidth: 200,
    //   field: "exchangeLimit",
    //   headerName: "EXCHANGE LIMIT TYPE",
    // },

    // {
    //   flex: 1,
    //   minWidth: 150,
    //   field: "exchangeType",
    //   headerName: "LIMIT TYPE",
    // },

    // {
    //   flex: 1,
    //   minWidth: 100,
    //   field: "status",
    //   valueGetter: (params: { row: { status: boolean } }) => {
    //     return params?.row?.status ? "Active" : "Disabled";
    //   },
    //   headerName: "STATUS",
    //   renderCell: (params: { row: { status: boolean } }) => (
    //     <span>{params?.row?.status ? "Active" : "Disabled"}</span>
    //   ),
    // },

    // {
    //   flex: 1,
    //   minWidth: 100,
    //   field: "createdAt",
    //   headerName: "CREATED AT",
    //   renderCell: (params: { row: { createdAt: string } }) => (
    //     <span>{formatDate(params?.row?.createdAt)}</span>
    //   ),
    // },

    // {
    //   flex: 1,
    //   minWidth: 200,
    //   field: "updatedAt",
    //   headerName: "UPDATED AT",
    //   renderCell: (params: { row: { updatedAt: string } }) => (
    //     <span>{formatDate(params?.row?.updatedAt)}</span>
    //   ),
    // },

    {
      field: "actions",
      type: "actions",

      getActions: (params: { row: { id: number } }) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            handleNavigate(`/exchange/limits/${params?.row?.id}`);
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
          showInMenu
          onClick={() => {
            handleNavigate(`/exchange/limits/view/editLimit`, {
              id: params?.row?.id,
            });
          }}
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
              () => setDeleteLimitId(params?.row?.id.toString()),
              () => setOpenDialog("delete"),
            ]);
          }}
          showInMenu
          sx={{
            margin: "0 1rem",
            padding: "5px 0",
            width: "6rem",
            fontSize: "14px",
            color: "red",
          }}
        />,
      ],
    },
  ];
  const [loading, setLoading] = useState<"TABLE" | "DELETE" | "">("");

  const exchangeLimitId = parseInt(deleteLimitId);
  const submit = async () => {
    setLoading("DELETE");

    //console.log("Value from Frontend  - ",exchangeLimitId);
    const [data, error] = await deleteLimitList(exchangeLimitId);
    setLoading("");
    if (error) {
      toast.error("Failed to delete Limit");
      console.log(error);
    }
    if (data?.success) {
      setOpenDialog("deleteSuccess");
      void getExchangeLimits();
    }
  };

  const getExchangeLimits = async () => {
    setLoading("TABLE");

    const [data, error]: APIResult<Limits[]> = await ApiHandler(fetchLimitList);
    setLoading("");

    if (data?.success) {
      setLimits(data?.body);
    }
  };

  useEffect(() => {
    void getExchangeLimits();
  }, []);

  return (
    <div className="">
      {/* filters  */}
      <div className="flex items-center justify-between py-4">
        <p className="pageHeader">Exchange</p>
        <div className="flex items-center gap-4">
          <MuiButton
            title="Add New"
            className="btn-solid"
            onClick={() => {
              handleNavigate("/exchange/limits/view/addLimit");
            }}
          />
        </div>
      </div>

      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            storageName="Limits"
            rows={limits}
            columns={columns}
            loading={loading === "TABLE"}
            slotProps={{
              toolbar: { csvOptions: { fileName: "Exchange Limits Report" } },
            }}
          />
        </Box>
      </div>

      {/* delete 1 */}
      <DailogBox
        maxWidth={"sm"}
        open={openDialog === "delete"}
        handleClose={() => {
          setOpenDialog("");
        }}
      >
        <div className="flex flex-col gap-4 ">
          <h2 className="text-xl font-semibold text-black">
            Are you sure want to delete this Exchange limit?
          </h2>
          <p>
            By doing this action the exchange limit will be removed permanently.
            Are you sure you want to remove this exchange limit?
          </p>
          <div className="flex justify-end gap-4">
            <Button className="btn-outlined " title="No, cancel"></Button>
            <MuiButton
              className="btn-solid text-white"
              title="Yes, confirm"
              loading={loading === "DELETE"}
              onClick={submit}
            ></MuiButton>
          </div>
        </div>
      </DailogBox>
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
          <p>The Exchange limit was Deleted successfully</p>

          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={() => {
              setOpenDialog("");
            }}
          ></Button>
        </div>
      </DailogBox>
    </div>
  );
};

export default Limits;
