import React, { useState, Fragment, type FC } from "react";
import { Box } from "@mui/material";
import Button from "~/components/common/Button";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import AddPluse from "~/assets/general/Add_Plus.svg";
import Image, { type StaticImageData } from "next/image";
import Header from "~/components/common/Header";
import { currencyList, operationalTypes, statuslist } from "~/data/country";
import FilterComponent from "~/components/common/FilterComponent";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { useGlobalStore, useLimitStore } from "~/store";
import {
  createTransferFees,
  updateTransferFees,
} from "~/service/api/pricelists";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { deleteTransferfees } from "~/service/ApiRequests";
import { useRouter } from "next/router";
import AddExchangeLimits from "~/components/limits/AddExchangeLimits";
import {
  createExchangeLimit,
  deleteExchangeLimit,
  updateExchangeLimit,
} from "~/service/api/exchangeLimits";
import ViewTransferFee from "~/components/pricelist/ViewTransferFee";
import ViewExchangeLimits from "~/components/limits/ViewExchangeLimits";
import { enforcePermission } from "~/utils/permissions";

type ExchangeLimitsRow = { row: ExchangeLimits };
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
  limitListId: 0,
  name: "",
  status: "",
  currencyId: "",
  createdAt: "",
  amount: "",
  exchangeLimit: "",
  exchangeType: "",
};

interface CommonPricelistProps {
  data: Limits;
}

const TransferFees: FC<CommonPricelistProps> = () => {
  const [filterArray, setFilterArray] = useState<filterType[]>([]);
  const [assets] = useAsyncMasterStore("assets");
  const [openAdd, setOpenAdd] = useState("");
  const [loading, setLoading] = useState(false);

  const limitList = useGlobalStore((state) => state.limitList);

  const router = useRouter();
  const limitListId = Array.isArray(router.query.id) ? "" : router.query.id;
  const getLimitList = useGlobalStore((state) => {
    return state.getLimitList;
  });

  const [exchangeLimitDetails, setExchangeFeesDetails] =
    useState<ExchangeLimits>();

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

  const onSubmit = async (formValues: ExchangeLimits) => {
    setLoading(true);

    const [res, error] =
      openAdd === "edit"
        ? await updateExchangeLimit({
            ...formValues,
            id: exchangeLimitDetails?.id,
          })
        : await createExchangeLimit(formValues);

    if (res?.success) {
      setLoading(false);

      res?.message && toast.success(res?.message);
      if (openAdd === "addNew") {
        useLimitStore.setState((prev) => {
          return {
            ...prev,
            ExchangeLimits: [{ ...res.body }, ...(prev.ExchangeLimits ?? [])],
          };
        });
      }
      if (openAdd === "edit") {
        useLimitStore.setState((prev) => {
          const newArray = [...(prev.ExchangeLimits ?? [])];
          newArray.splice(
            newArray.findIndex(
              (obj: any) => obj.id === exchangeLimitDetails?.id,
            ),
            1,
          );
          return {
            ...prev,
            ExchangeLimits: [{ ...res.body }, ...newArray],
          };
        });
      }
    }
    if (error) {
    }
    setOpenAdd("");
    setExchangeFeesDetails({ ...initTransferState });
  };

  const handleDeleteExchangeLimit = async (id: any) => {
    const [data, error] = await ApiHandler(deleteExchangeLimit, {
      id: id,
    });
    if (error) {
      toast.error("Failed to delete Exchange Limit");
    }
    if (data?.success) {
      void getLimitList(Number(limitListId));
      useLimitStore.setState((prev) => prev);
      toast.success("Exchange deleted successfully");
    }
  };

  // columns
  const columns = [
    {
      field: "name",
      headerName: "Limit List",
      flex: 1,
      minWidth: 100,
      valueGetter: () => {
        return limitList.name;
      },
      renderCell: () => {
        return limitList.name;
      },
    },
    {
      field: "amount",
      headerName: "AMOUNT",
      flex: 1,
      minWidth: 100,
    },

    {
      field: "exchangeType",
      headerName: "EXCHANGE TYPE",
      flex: 1,
      minWidth: 100,
    },

    {
      field: "exchangeLimit",
      headerName: "EXCHANGE LIMIT",
      flex: 1,
      minWidth: 100,
    },

    {
      flex: 1,
      minWidth: 100,
      field: "status",
      headerName: "STATUS",
      renderCell: ({ row }: { row: ExchangeLimits }) => (
        <a>{row.status ? "Active" : "Inactive"}</a>
      ),
      valueGetter: ({ row }: { row: ExchangeLimits }) =>
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
      field: "actions",
      headerName: "ACTION",
      type: "actions",
      width: 80,
      getActions: ({ row }: ExchangeLimitsRow) => [
        <GridActionsCellItem
          key="view"
          label="View"
          onClick={() => {
            setExchangeFeesDetails(row);
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
              () => setExchangeFeesDetails(row),
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
              () => void handleDeleteExchangeLimit(row?.id),
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
  ];

  return (
    <Fragment>
      {!openAdd && (
        <div className=" flex items-center justify-between pb-8 pt-4 ">
          <Header head="Exchange Limits" />
          <div className=" flex items-center gap-4">
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
          <Header head="Edit Exchange Limits" />{" "}
        </div>
      )}
      {openAdd === "addNew" && (
        <div className=" pb-8 pt-4">
          <Header head="Add Exchange Limits" />{" "}
        </div>
      )}

      {openAdd === "view" && (
        <div className=" pb-8 pt-4">
          <Header head="View Exchange Limits" />{" "}
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
                storageName="exchangeLimits"
                rows={limitList?.ExchangeLimits ?? []}
                columns={columns}
                slotProps={{
                  toolbar: { csvOptions: { fileName: "Exhange Limits" } },
                }}
              />
            </Box>
          </div>
        </>
      )}
      {/* add staff  */}
      {(openAdd === "addNew" || openAdd === "edit") && (
        <AddExchangeLimits
          onClose={() => {
            setOpenAdd("");
          }}
          exchangeLimits={exchangeLimitDetails}
          onSubmit={onSubmit}
          openAdd={openAdd}
          limitList={limitList}
          loading={loading}
        />
      )}

      {openAdd === "view" && (
        <ViewExchangeLimits
          onClose={() => {
            setOpenAdd("");
          }}
          exchangeLimits={exchangeLimitDetails}
          openAdd={openAdd}
        />
      )}
    </Fragment>
  );
};

export default TransferFees;
