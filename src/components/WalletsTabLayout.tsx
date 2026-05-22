import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const WalletsTabLayout = ({ children }: Props) => {
  const router = useRouter();
  const { pathname } = router;

  console.log("pathname: ", pathname);
  const [value, setValue] = React.useState(() => {
    if (pathname === "/e-commerce/wallets/customerWallets") {
      return 0;
    } else if (pathname === "/e-commerce/wallets/merchantWallets") {
      return 1;
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
              label="Customer Wallets"
              {...a11yProps(0)}
              onClick={() => {
                handleNavigate("/e-commerce/wallets/customerWallets");
              }}
            />
            <Tab
              label="Merchant Wallets"
              onClick={() => {
                handleNavigate("/e-commerce/wallets/merchantWallets");
              }}
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>
      </Box>
      {children}
    </div>
  );
};

export default WalletsTabLayout;
