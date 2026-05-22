import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { BsPlus } from "react-icons/bs";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import AddThreshold from "~/components/limits/AddThreshold";
import MuiButton from "~/components/common/Button";
import { deleteThreshold, getLimitsById } from "~/service/api/limits";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import { enforcePermission } from "~/utils/permissions";

const LimitsLayout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [thresholdData, setThresholdData] = useState<Threshold[]>([]);
  const [selectedThresholdId, setSelectedThresholdId] = useState(null);
  const id = router.query.id as any;
  const [dailog, setDailog] = useState(false);

  // console.log("thresholdData", thresholdData);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data: APIResult<Limits> = await getLimitsById(id);
      const limitsByIdThresh: Threshold[] = data[0]?.body?.Thresholds ?? [];
      const formattedData =
        limitsByIdThresh.map((item: Threshold) => ({
          id: item.id ?? "",
          thresholdType: item.thresholdType ?? "",
          transferDirection: item.transferDirection ?? "",
          amount: item.amount ?? "",
          currency: item.currency ?? "",
          period: item.period ?? "",
          periodCount: item.periodCount ?? "",
          // affects_only_a_single_person: item.affectsSingleTransaction
          //   ? "Yes"
          //   : "No",
          actionTypes: item.actionTypes ?? "",
        })) ?? [];

      setThresholdData(formattedData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      // Handle error
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (id) {
      void fetchData();
    }
  }, [id]);

  const handleChange = () => {
    setSelectedThresholdId(null);
    setDailog(!dailog);
    if (!dailog) {
      void fetchData();
    }
  };

  const handleEditThreshold = (id: any) => {
    setSelectedThresholdId(id);
    setDailog(true);
  };

  const hadleDeleteLimit = async (id: any) => {
    setLoading(true);
    const [data, error] = await ApiHandler(deleteThreshold, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete Threshold");
    }
    if (data?.success) {
      void fetchData();
      toast.success("Threshold Deleted successfully");
    }
  };

  // columns
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
    },
    {
      field: "thresholdType",
      headerName: "THRESHOLD TYPE",
      minWidth: 150,
    },
    {
      minWidth: 180,
      field: "transferDirection",
      headerName: "TRANSFER DIRECTION",
      valueGetter: ({ row }: { row: Threshold }) =>
        row?.transferDirection ? row?.transferDirection : "Exchange",
      renderCell: ({ row }: { row: Threshold }) => (
        <p>{row?.transferDirection ? row?.transferDirection : "Exchange"}</p>
      ),
    },

    {
      minWidth: 100,
      field: "amount",
      headerName: "AMOUNT",
    },
    {
      minWidth: 150,
      field: "currency",
      headerName: "CURRENCY",
    },
    {
      flex: 1,
      minWidth: 90,
      field: "period",
      headerName: "PERIOD",
    },
    {
      flex: 1,
      minWidth: 120,
      field: "periodCount",
      headerName: "PERIOD COUNT",
    },
    {
      flex: 1,
      minWidth: 120,
      field: "actionTypes",
      headerName: "ACTION TYPE",
    },
    // {
    //   flex: 1,
    //   minWidth: 200,
    //   field: "affects_only_a_single_person",
    //   headerName: "AFFECTS SINGLE TRANSACTION",
    // },

    {
      field: "actions",
      type: "actions",
      headerName: "ACTIONS",
      getActions: ({ row }: { row: Limits }) => [
        <GridActionsCellItem
          key="edit"
          label="Edit"
          showInMenu
          onClick={() => {
            enforcePermission("edit", [() => handleEditThreshold(row)]);
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
            enforcePermission("delete", [() => void hadleDeleteLimit(row?.id)]);
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

  return (
    <div className="my-4 flex flex-col gap-3">
      <AddThreshold
        open={dailog}
        handleChange={handleChange}
        thresholdData={selectedThresholdId}
        allThresholdData={thresholdData}
      />

      <div className="w-full border border-[#00000030] ">
        <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
          <h2 className="subHeader">Thresholds</h2>

          <MuiButton
            title="Add New"
            className="btn-solid"
            onClick={() => {
              enforcePermission("write", [() => handleChange()]);
            }}
          >
            {/* <p className=" text-xs font-normal">Add New</p> */}
            <BsPlus size={20} />
          </MuiButton>
        </div>
      </div>

      {/* datagrid */}
      <div className="tableComponent">
        <Box sx={{ width: "100%" }}>
          <MuiDataGrid
            storageName="Cashback"
            rows={thresholdData}
            columns={columns}
            loading={loading}
          />
        </Box>
      </div>
    </div>
  );
};

export default LimitsLayout;
