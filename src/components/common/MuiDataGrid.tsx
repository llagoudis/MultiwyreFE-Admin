import React, { useEffect, useState } from "react";
import {
  DataGrid,
  gridClasses,
  GridToolbar,
  type DataGridProps,
} from "@mui/x-data-grid";
import { Box, LinearProgress } from "@mui/material";
import LinearBuffer from "./MuiLoading";

type MuiDataGridProps = DataGridProps & {
  storageName?: string;
  wrapText?: boolean;
  detailsCell?: boolean;
};

const MuiDataGrid = ({
  rows,
  columns,
  checkboxSelection,
  disableRowSelectionOnClick,
  // columnVisibilityModel,
  hideFooterPagination,
  rowModesModel,
  onRowModesModelChange,
  onRowEditStop,
  slots,
  slotProps,
  // onColumnVisibilityModelChange,
  editMode,
  processRowUpdate,
  onPaginationModelChange,
  loading,
  storageName,
  wrapText,
  detailsCell,
  ...props
}: MuiDataGridProps) => {
  const handleColumnVisibilityChange = (columns: any) => {
    setColumns(columns);
    const columnsJSON = JSON.stringify(columns);
    localStorage.setItem(storageName ?? "", columnsJSON);
  };

  const [col, setColumns] = useState<any>(null);
  useEffect(() => {
    const storedColumnsJSON = localStorage.getItem(storageName ?? "");
    if (storedColumnsJSON) {
      const storedColumns = JSON.parse(storedColumnsJSON);
      setColumns(storedColumns);
    }
  }, []);

  return (
    <Box>
      {/* {loading ? (
        <LinearBuffer />
      ) : ( */}
      <DataGrid
        onColumnVisibilityModelChange={handleColumnVisibilityChange}
        editMode={editMode}
        slotProps={slotProps}
        // slotProps={{
        //   toolbar: { printOptions: { disableToolbarButton: true } },
        // }}
        hideFooterPagination={hideFooterPagination}
        slots={slots ? slots : { toolbar: GridToolbar }}
        processRowUpdate={processRowUpdate}
        onRowModesModelChange={onRowModesModelChange}
        rowModesModel={rowModesModel}
        onPaginationModelChange={onPaginationModelChange}
        sx={{
          color: "#1E293B",
          fontSize: 12,
          borderColor: "rgb(224, 224, 224)",
          "& .MuiDataGrid-columnHeader": {
            color: "#4D515A",
            fontSize: 14,
            backgroundColor: "#F8FAFC",
          },
          [`& .${gridClasses.cell}`]: {
            py: 1,
          },
        }}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        disableVirtualization={true}
        onRowEditStop={onRowEditStop}
        checkboxSelection={checkboxSelection}
        {...props}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "" : "bg-[#F2F2F2]"
        }
        columnVisibilityModel={{ id: true, ...col }}
        rows={rows}
        columns={columns}
        getRowHeight={() =>
          (wrapText ?? false) || (detailsCell ?? false) ? "auto" : undefined
        }
        className={rows?.length > 0 ? "text-[14px]" : "h-[200px] text-[14px]"}
        localeText={{
          noRowsLabel: "No data found",
        }}
        loading={loading}
      />
      {/* )} */}
    </Box>
  );
};

export default MuiDataGrid;
