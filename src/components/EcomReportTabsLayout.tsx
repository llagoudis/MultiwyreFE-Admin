import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const EcomReportTabsLayout = ({ children }: Props) => {
  const router = useRouter();
  const { pathname } = router;
  const projectFeesEnabled =
    process.env.NEXT_PUBLIC_FEATURE_PROJECT_FEES === "true";

  const [value, setValue] = React.useState(() => {
    if (pathname === "/reports/merchantTurnover") {
      return 1;
    } else if (pathname === "/reports/projectFees") {
      return 2;
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
              value={0}
              onClick={() => {
                handleNavigate("/reports/ecomFees");
              }}
              label="Total Fees"
              {...a11yProps(0)}
            />
            <Tab
              value={1}
              onClick={() => {
                handleNavigate("/reports/merchantTurnover");
              }}
              label="Merchant Turnover"
              {...a11yProps(1)}
            />
            {projectFeesEnabled && (
              <Tab
                value={2}
                onClick={() => {
                  handleNavigate("/reports/projectFees");
                }}
                label="Project Fees"
                {...a11yProps(2)}
              />
            )}
          </Tabs>
        </Box>
      </Box>
      {children}
    </div>
  );
};

export default EcomReportTabsLayout;
