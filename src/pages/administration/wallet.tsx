import React from "react";
import MuiButton from "~/components/common/Button";
import Header from "~/components/common/Header";
import BTC from "~/assets/walleticons/btc.svg";
import ETH from "~/assets/walleticons/eth.svg";
import USTD from "~/assets/walleticons/ustd.svg";
import TRX from "~/assets/walleticons/trx.svg";
import USDC from "~/assets/walleticons/USDC.svg";
import EUR from "~/assets/walleticons/eur.svg";
import { Box, Tab, Tabs, TextField } from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import checkedIconSuccess from "~/assets/walleticons/checkimage.svg";
import Activities from "~/components/wallets/Activities";
import PendingApprovals from "~/components/wallets/PendingApprovals";
import checkedIconDanger from "~/assets/walleticons/checkedicon_danger.svg";
import DailogBox from "~/components/common/DailogBox";
import clockicon from "~/assets/walleticons/clock.svg";
import Tooltip from "@mui/material/Tooltip";

const Wallet = () => {
  const walletData = [
    {
      address: "BTC Wallet Address",
      color: "#EF902F",
      bgcolor: "#F8A13833",
      name: "BTC",
      image: BTC,
      checked: true,
      value: "0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK",
    },
    {
      address: "USTD Wallet Address",
      name: "USTD",
      color: "#26A17B",
      bgcolor: "#11986E33",
      image: USTD,
      value: "0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK",
      checked: true,
    },

    {
      address: "ETH Wallet Address",
      color: "#5C77BA",
      name: "ETH",
      image: ETH,
      checked: true,
      value: "0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK",

      bgcolor: "#D3E5FF",
    },
    {
      address: "USDC Wallet Address",
      color: "#5C77BA",
      bgcolor: "#D3E5FF",
      value: "0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK",
      name: "USDC",
      image: USDC,
      checked: true,
    },
    {
      address: "TRX Wallet Address",
      color: "#EB0826",
      bgcolor: "#EA072533",
      value: "0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK",
      name: "TRX",
      image: TRX,
      checked: false,
      tooltip: "Approval Pending Click here to see Approval List",
    },
    {
      address: "EUR Wallet Address",
      value: "0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK",
      color: "#5C77BA",
      bgcolor: "#D3E5FF",
      name: "EUR",
      image: EUR,
      checked: false,
      tooltip: "Approval Pending Click here to see Approval List",
    },
  ];

  const dailogData = [
    {
      name: "Name Surname",
      approve: "Approved",
      date: "12-Sep-2023 08:23:22",
    },
    {
      name: "Name Surname",
      approve: "Approved",
      date: "12-Sep-2023 08:23:22",
    },
    {
      name: "Name Surname",
      approve: "Pending",
      date: "12-Sep-2023 08:23:22",
    },
    {
      name: "Name Surname",
      approve: "Pending",
      date: "12-Sep-2023 08:23:22",
    },
  ];

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 3 }}>
            <>{children}</>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [openD, setOpenD] = React.useState(false);

  const handleClose = () => {
    setOpenD(!openD);
  };

  const [disabled, setDisabled] = React.useState(true);

  return (
    <div>
      {/* dailog section  */}
      <DailogBox
        open={openD}
        handleClose={handleClose}
        dailogHeader="Pending Approvals"
      >
        <div>
          {dailogData.map((item, i) => (
            <div
              key={i}
              className="flex justify-between border-b px-1 py-4 text-black"
            >
              <p>{item.name}</p>
              <p>{item.approve}</p>
              <p>{item.date}</p>
              {item.approve === "Approved" ? (
                <Image
                  src={checkedIconSuccess as StaticImageData}
                  alt={"checked"}
                />
              ) : (
                <Image
                  className="cursor-pointer"
                  title="show"
                  src={clockicon as StaticImageData}
                  alt={"checked"}
                />
              )}
            </div>
          ))}
          <p></p>
        </div>
      </DailogBox>

      {/* header */}
      <div className="flex items-center justify-between py-4">
        <Header head="Wallet Management" />
        <div className="flex items-center gap-4">
          <MuiButton
            title={`${disabled ? "Edit Address" : "Save Address"}`}
            onClick={() => {
              setDisabled(!disabled);
            }}
            className="btn-solid"
          ></MuiButton>
        </div>
      </div>

      {/* data  */}
      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
        {walletData.map((item, i) => (
          <div key={i}>
            <label htmlFor={item.name}>{item.address}</label>
            <TextField
              id={item.name}
              disabled={disabled}
              size="small"
              defaultValue={item.value}
              fullWidth
              className="mt-2"
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 100, paddingLeft: 0, margin: 0 },
                startAdornment: (
                  <div
                    style={{ backgroundColor: `${item.bgcolor}` }}
                    className=" mr-4 flex items-center gap-3 rounded-l-3xl rounded-r-xl py-1 pr-10"
                  >
                    <Image
                      src={item.image as StaticImageData}
                      alt={item.name}
                    />

                    <p
                      className="font-semibold"
                      style={{ color: `${item.color}` }}
                    >
                      {item.name}
                    </p>
                  </div>
                ),
                endAdornment: (
                  <>
                    {item.checked ? (
                      <Image
                        src={checkedIconSuccess as StaticImageData}
                        alt={"checked"}
                      />
                    ) : (
                      <Tooltip
                        className="cursor-pointer"
                        title={item.tooltip}
                        placement="right"
                        arrow
                      >
                        <Image
                          onClick={handleClose}
                          src={checkedIconDanger as StaticImageData}
                          alt={"checked"}
                        />
                      </Tooltip>
                    )}
                  </>
                ),
              }}
            />
          </div>
        ))}
      </div>

      <br />

      {/* tabs  */}
      <Box
        sx={{
          marginTop: "3rem",
          boxShadow: " 0px 4px 9px 0px #0000000F",
          bgcolor: "#F8FAFC",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{
            style: {
              backgroundColor: "#D97D54",

              borderRadius: "10px",
              padding: "2px",
            },
          }}
        >
          <Tab label="ACTIVITIES" {...a11yProps(0)} />
          <Tab
            label={
              <div className="flex items-center gap-2">
                PENDING APPROVALS
                <p className="mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C3922E] text-white">
                  2
                </p>
              </div>
            }
            {...a11yProps(1)}
          />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <Activities />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <PendingApprovals />
      </CustomTabPanel>
    </div>
  );
};

export default Wallet;
