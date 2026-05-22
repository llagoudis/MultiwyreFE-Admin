import React, { useState } from "react";
import { Box } from "@mui/material";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import MuiButton from "~/components/common/Button";
import AddTemplate from "./administrators/addTemplate";
import DailogBox from "~/components/common/DailogBox";
import Button from "~/components/common/Button";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";

const NotificationTemplate = () => {
  const [openAdd, setOpenAdd] = React.useState("");
  const [openDialog, setOpenDialog] = useState("");
  const rows = [
    {
      id: 1,
      template_name: "Email Template",
      description: "This is a sample template",
    },
    {
      id: 2,
      template_name: "Template2",
      description: "This is a test description for testing...",
    },
  ];

  // columns
  const columns = [
    {
      field: "template_name",
      minWidth: 200,
      flex: 1,
      headerName: "TEMPLATE NAME",
    },
    {
      field: "description",
      minWidth: 150,
      headerName: "DESCRIPTION",
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "ACTIONS",
      width: 100,
      getActions: () => [
        <GridActionsCellItem
          key="edit"
          onClick={() => setOpenAdd("edit")}
          label="Edit"
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
            setOpenDialog("delete");
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
    <div className="">
      {!openAdd && (
        <div className="mt-1 flex items-center justify-between py-4">
          <p className="pageHeader">Notification Templates</p>

          <MuiButton
            title="Add new"
            className="btn-solid"
            onClick={() => setOpenAdd("create")}
          ></MuiButton>
        </div>
      )}
      {/* datagrid */}
      {!openAdd && (
        <div className="tableComponent">
          <Box sx={{ width: "100%" }}>
            <MuiDataGrid
              rows={rows}
              columns={columns}
              storageName={"NotificationTemplate"}
            />
          </Box>
        </div>
      )}
      {/* add admin  */}
      {openAdd === "create" && (
        <AddTemplate
          from="create"
          onClose={() => {
            setOpenAdd("");
          }}
        />
      )}
      {/* edit admin  */}
      {openAdd === "edit" && (
        <AddTemplate
          from="edit"
          onClose={() => {
            setOpenAdd("");
          }}
        />
      )}

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
            Are you sure want to delete this Notification template?
          </h2>
          <p>
            By doing this action the Notification template will be removed
            permanently. Are you sure you want to remove this Notification
            template?
          </p>
          <div className="flex justify-end gap-4">
            <Button
              className="btn-outlined "
              title="No, cancel"
              onClick={() => {
                setOpenDialog("");
              }}
            ></Button>
            <Button
              className="btn-solid text-white"
              title="Yes, confirm"
              onClick={() => {
                setOpenDialog("deletedSuccess");
              }}
            ></Button>
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
          <p>The Notification template was Deleted successfully</p>

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

export default NotificationTemplate;
