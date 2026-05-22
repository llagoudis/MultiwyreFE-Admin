import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Snackbar,
  Typography,
  TextField,
  Dialog,
} from "@mui/material";
import checkicon from "~/assets/general/check-one.svg";
import Sheld from "~/assets/general/sheld.svg";
import SaveIcon from "@mui/icons-material/Save";

import React, { useState } from "react";
import Header from "~/components/common/Header";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import Button from "~/components/common/Button";
import Image, { type StaticImageData } from "next/image";
import Edit from "../assets/general/edit.svg";
import { type GridCellParams } from "@mui/x-data-grid";
import MuiButton from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";

type Accordiondata = {
  summary: string;
  panel: string;
  component?: React.ReactNode;
};

interface TableRow {
  id: string;
  name?: string;
  created?: string;
  apikey?: string;
  secretkey?: string;
}

const rows = [
  {
    id: 1,
    name: "Amar",
    created: "12/12/2023 12:30AM",
    apikey: "Aksahsas@#!21212",
    secretkey: "Aksahsas@#!21212",
  },

  {
    id: 2,
    name: "Justin",
    created: "12/12/2023 12:30AM",
    apikey: "Justin@#!21212",
    secretkey: "Justin@#!21212",
  },
];

const ExchangeApi = () => {
  const [open, setOpen] = useState(false);

  const [edit, setEdit] = useState<string>();

  const handleEditRow = (id: string) => {
    setEdit((edit) => (edit === id ? "" : id));
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      // flex: 1,
    },
    {
      field: "name",
      headerName: "API NAME",
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return params.row.id === edit ? (
          <TextField size="small" defaultValue={params.row.name} />
        ) : (
          <>{params.value}</>
        );
      },
    },
    {
      flex: 1,

      field: "created",
      headerName: "DATE & TIME",
      renderCell: (params: GridCellParams) => {
        return params.row.id === edit ? (
          <TextField
            size="small"
            type="date"
            defaultValue={params.row.created}
          />
        ) : (
          <>{params.value}</>
        );
      },
    },
    {
      flex: 1,

      field: "apikey",
      headerName: "API KEY",
      renderCell: (params: GridCellParams) => {
        return params.row.id === edit ? (
          <TextField size="small" defaultValue={params.row.apikey} />
        ) : (
          <>{params.value}</>
        );
      },
    },
    {
      flex: 1,

      field: "secretkey",
      headerName: "SECRET KEY",
      renderCell: (params: GridCellParams) => {
        return params.row.id === edit ? (
          <TextField size="small" defaultValue={params.row.secretkey} />
        ) : (
          <>{params.value}</>
        );
      },
    },
    {
      width: 50,

      field: "action",
      headerName: "",
      renderCell: (params: { row: TableRow }) => {
        return (
          <Box
            onClick={() => handleEditRow(params?.row?.id)}
            className="flex w-full cursor-pointer items-center justify-end"
          >
            {params.row.id === edit ? (
              <SaveIcon />
            ) : (
              <Image src={Edit as StaticImageData} alt="" />
            )}
          </Box>
        );
      },
    },
  ];

  const [openDialog, setOpenDialog] = useState("");

  return (
    <div>
      {/* delete 1 */}
      <Dialog
        open={openDialog === "delete"}
        onClose={() => {
          setOpenDialog("");
        }}
      >
        <div className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex  justify-between border-b-2 border-[#DFDDDD] pb-4 ">
            <p className=" text-sm font-bold sm:text-base lg:text-lg">
              Authorise action with 2FA
            </p>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-b-2 border-[#DFDDDD] py-4 md:flex-row">
            <Image src={Sheld as StaticImageData} alt="Sheld" />
            <div>
              <p className=" text-lg font-semibold">
                Enter your
                <span className=" font-bold text-[#C1922E]">2FA code</span>{" "}
                authorize this action.
              </p>
              <input
                className="mt-2 w-full rounded-md px-4 py-2 outline outline-1 outline-[#c4c4c4] placeholder:text-sm placeholder:font-normal "
                type="text"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-6 ">
            <button
              className=" cursor-pointer text-sm font-bold"
              onClick={() => {
                setOpenDialog("");
              }}
            >
              Cancel
            </button>
            <MuiButton
              className=" btn-solid bg-[#217EFD]"
              title={"Continue"}
              onClick={() => {
                setOpenDialog("deletedSuccess");
              }}
            />
          </div>
        </div>
      </Dialog>
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
          <p>The API was Deleted successfully</p>

          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={() => {
              setOpenDialog("");
            }}
          ></Button>
        </div>
      </DailogBox>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setOpen(false)}
        autoHideDuration={1000}
        message="Copied to clipboard"
      />
      <MuiDataGrid
        hideFooterPagination={true}
        storageName={"API"}
        rows={rows}
        columns={columns}
      />

      {/* <Box className="flex items-center justify-between ">
        <p className="w-3/4 font-semibold">Generate new keys</p>
        <Box className=" flex w-full items-center gap-2">
          <TextField
            className="w-full"
            name="generate_new_key "
            size="small"
            placeholder="Enter Service name"
          ></TextField>

          <MuiButton
            title="Generate Keys"
            className="btn-solid  w-3/12"
          ></MuiButton>
        </Box>
      </Box> */}
    </div>
  );
};

// const EmailProviderApi = () => {
//   return <>hello</>;
// };
// const SmsApi = () => {
//   return <>hello</>;
// };
// const WalletApi = () => {
//   return <>hello</>;
// };

// accordian data
const data: Accordiondata[] = [
  { summary: "Exchange API", panel: "panel1", component: <ExchangeApi /> },
  {
    summary: "Email provider API",
    panel: "panel2",
    component: <ExchangeApi />,
  },
  { summary: "SMS API", panel: "panel3", component: <ExchangeApi /> },
  { summary: "Wallet API", panel: "panel4", component: <ExchangeApi /> },
];

const Api = () => {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div>
      <div className="my-4">
        <Header head="API" />
      </div>

      {data.map((item, i) => (
        <>
          <Accordion
            key={i}
            expanded={expanded === item.panel}
            onChange={handleChange(item.panel)}
            className="mb-3 rounded-md border-2 shadow-none"
          >
            <AccordionSummary
              style={{ backgroundColor: "#E2E8F080" }}
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                {item.summary}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>{item.component}</AccordionDetails>
          </Accordion>
        </>
      ))}
    </div>
  );
};

export default Api;
