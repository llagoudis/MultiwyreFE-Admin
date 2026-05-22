import React, { useEffect, useState } from "react";
import { Box, ClickAwayListener, Fade, Paper, Popper } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";

import { useRouter } from "next/router";

import Link from "next/link";
import { findColorCode, formatDate } from "~/common/functions";
import { GridActionsCellItem } from "@mui/x-data-grid";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import {
  getEuroTemplatesById,
  updateEuroTemplate,
} from "~/service/ApiRequests";
import { getUserById } from "~/service/api/persons";
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

interface EuroTemplateProps {
  userDetails: UserStore;
}

const Accounts: React.FC<EuroTemplateProps> = ({ userDetails }) => {
  const router = useRouter();

  const userId = Array.isArray(router.query.id) ? "" : router.query.id;

  const handleEuroTemplateUpdate = async (id: any, val: any) => {
    const [data, error] = await ApiHandler(updateEuroTemplate, {
      id: id,
      isApproved: val === "approve" ? true : false,
    });
    if (error) {
      toast.error("Failed to update Euro template status");
    }
    if (data?.success) {
      //   void getPriceList(Number(priceListId));
      toast.success("Euro template status updated successfully");

      if (userId) {
        void getTemplatesById(userId);
      }
    }
  };

  const [euroTemplate, setEuroTemplates] = useState<EuroTempatesType[]>();

  async function getTemplatesById(userId: any) {
    const [data, error]: APIResult<EuroTempatesType[]> = await ApiHandler(
      getEuroTemplatesById,
      { userId },
    );

    if (error) {
      toast.error("Failed to update euro template");
    }
    if (data?.success && data?.body) {
      setEuroTemplates(data?.body);
    }
  }

  useEffect(() => {
    //

    void getTemplatesById(userId);
  }, []);

  // columns
  const columns = [
    { field: "id", headerName: "ID", width: 50, hideable: false },
    {
      field: "IBAN",
      headerName: "IBAN",
      flex: 1,
      minWidth: 250,
      renderCell: (params: { row: { IBAN: string } }) => (
        <p>{params?.row?.IBAN}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "customerName",
      headerName: "CUSTOMER NAME",
      renderCell: (params: { row: { customerName: string } }) => (
        <p>{params?.row?.customerName}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "isApproved",
      headerName: "STATUS",
      valueGetter: (params: { row: { isApproved: boolean } }) =>
        params?.row?.isApproved ? "APPROVED" : "NOT APPROVED",
      renderCell: (params: { row: { isApproved: boolean } }) => (
        <p>
          {params?.row?.isApproved ? (
            <span className="font-bold text-[#1CBDAB]">Approved</span>
          ) : (
            <span className="font-bold text-[#FF0000]">Not Approved</span>
          )}
        </p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "templateName",
      headerName: "TEMPLATE NAME",
      renderCell: (params: { row: { templateName: string } }) => (
        <p>{params?.row?.templateName}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "customerAddress",
      headerName: "CUSTOMER ADDRESS",
    },
    {
      flex: 1,
      minWidth: 150,
      field: "customerZipcode",
      headerName: "CUSTOMER ZIPCODE",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "customerCity",
      headerName: "CUSTOMER CITY",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "customerCountry",
      headerName: "CUSTOMER COUNTRY",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "swift",
      headerName: "SWIFT",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "bankName",
      headerName: "BANK NAME",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "bankAddress",
      headerName: "BANK ADDRESS",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "bankLocation",
      headerName: "BANK LOCATION",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "bankCountry",
      headerName: "BANK COUNTRY",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "description",
      headerName: "DESCRIPTION",
    },

    {
      flex: 1,
      minWidth: 150,
      field: "reference",
      headerName: "REFERENCE",
    },
    {
      minWidth: 150,
      field: "createdAt",
      headerName: "CREATED AT",

      renderCell: (params: { row: { createdAt: string } }) => (
        <p>{formatDate(params?.row?.createdAt)}</p>
      ),
    },
    // {
    //   flex: 1,
    //   minWidth: 100,
    //   field: "Primary",
    //   headerName: "PRIMARY",
    //   renderCell: (params: { row: { assetId: string } }) => (
    //     <p>
    //       {params?.row?.assetId === "EUR" ? (
    //         <span className="font-bold text-[#1CBDAB]">Yes</span>
    //       ) : (
    //         <span className="font-bold text-[#FF0000]">No</span>
    //       )}
    //     </p>
    //   ),
    // },

    {
      field: "actions",
      type: "actions",
      headerName: "ACTIONS",

      width: 100,
      getActions: ({ row }: { row: EuroTempatesType }) => [
        <GridActionsCellItem
          key="approve"
          onClick={() => {
            enforcePermission("edit", [
              () => void handleEuroTemplateUpdate(row?.id, "approve"),
            ]);
          }}
          label="Approve"
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
          key="reject"
          onClick={() => {
            enforcePermission("edit", [
              () => void handleEuroTemplateUpdate(row?.id, "reject"),
            ]);
          }}
          label="Reject"
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
    <>
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            wrapText={true}
            storageName="euro_templates_users"
            rows={euroTemplate ?? []}
            columns={columns}
            slotProps={{
              toolbar: { csvOptions: { fileName: "EuroTemplates" } },
            }}
          />
        </Box>
      </div>
    </>
  );
};

export default Accounts;
