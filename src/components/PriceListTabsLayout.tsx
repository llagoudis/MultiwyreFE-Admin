import React, { type ReactNode } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";

const TabEntries = [
  {
    name: "Details",
    path: "/banking/price-list/${id}/details",
  },
  {
    name: "Transfer fees",
    path: "/banking/price-list/${id}/transferFees",
  },
  {
    name: "Recurring Fees",
    path: "/banking/price-list/${id}/recurringFees",
  },
  {
    name: "Issued Card Fees",
    path: "/banking/price-list/${id}/issuedCardFees",
  },
  {
    name: "FX Maekup fees",
    path: "/banking/price-list/${id}/fxMarkupFees",
  },
  {
    name: "Cashback",
    path: "/banking/price-list/${id}/cashback",
  },
  {
    name: "Change Verification level fees",
    path: "/banking/price-list/${id}/changeVerificationLevelFees",
  },
];

const PriceListTabsLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const path = router.asPath;
  const id = Array.isArray(router.query.id) ? "" : router.query.id;

  const [currentTab, setCurrentTab] = React.useState(() => {
    const tab = path.split("/");
    const tabDictionary: KeyString = {
      transferFees: 1,
      recurringFees: 2,
      issuedCardFees: 3,
      fxMarkupFees: 4,
      cashback: 5,
      changeVerificationLevelFees: 6,
    };
    const currentTab = tab[tab.length - 1];
    if (currentTab && tabDictionary[currentTab]) {
      return tabDictionary[currentTab] as number;
    }

    return 0;
  });

  const onTabChange = (_: unknown, nextTab: number) => {
    setCurrentTab(nextTab);
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
            value={currentTab}
            onChange={onTabChange}
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
            {TabEntries.map((item, index) => (
              <Tab
                key={index}
                label={item.name}
                {...a11yProps(index)}
                onClick={() => {
                  void router.replace(item.path.replace("${id}", id ?? ""));
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      {children}
    </div>
  );
};

export default PriceListTabsLayout;
