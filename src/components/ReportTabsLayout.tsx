import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const ReportTabsLayout = ({ children }: Props) => {
  const router = useRouter();
  const { pathname } = router;

  const [value, setValue] = React.useState(() => {
    if (pathname === "/reports/currencyTurnover") {
      return 1;
    } else if (pathname === "/reports/fees") {
      return 2;
    } else if (pathname === "/reports/chargedFees") {
      return 3;
    } else if (pathname === "/reports/balances") {
      return 4;
    } else if (pathname === "/reports/totalBalances") {
      return 5;
    }
    return 0;
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // page Navigation
  const handleNavigate = (path: string) => {
    router
      .push(path)
      .then(() => {
        // The navigation was successful
      })
      .catch((error) => {
        // Handle any errors that occur during navigation
        console.error(error);
      });
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <div className="flex flex-col gap-3">
      <Box
        sx={{
          marginTop: "1rem",
        }}
      >
        <Box
          sx={{
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
            <Tab
              label="All transactions"
              {...a11yProps(0)}
              onClick={() => {
                handleNavigate("/reports/allTransactions");
              }}
            />
            <Tab
              label="Currency Turnover"
              onClick={() => {
                handleNavigate("/reports/currencyTurnover");
              }}
              {...a11yProps(1)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/reports/fees");
              }}
              label="TOTAL FEES"
              {...a11yProps(2)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/reports/chargedFees");
              }}
              label="Charged Fees"
              {...a11yProps(3)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/reports/balances");
              }}
              label="Balances"
              {...a11yProps(4)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/reports/totalBalances");
              }}
              label="Total Balances"
              {...a11yProps(5)}
            />
          </Tabs>
        </Box>
      </Box>
      {children}
    </div>
  );
};

export default ReportTabsLayout;
