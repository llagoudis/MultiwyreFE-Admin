import React, { lazy, Suspense, useEffect, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import Loading from "~/components/common/PageLoaderFallback";
import { useGlobalStore, useLimitStore } from "~/store";

const Details = lazy(() => import("./view/Details"));
const Limits = lazy(() => import("./view/Limits"));

const TabEntries = [
  {
    name: "Details",
    path: "/exchange/limits/${id}/details",
    component: Details,
  },
  {
    name: "Exchange Limits",
    path: "/exchange/limits/${id}/exchangeLimits",
    component: Limits,
  },
];

const PriceListTabsLayout = () => {
  const router = useRouter();
  const path = router.asPath;
  const id = Array.isArray(router.query.id) ? "" : router.query.id;
  const getLimitList = useGlobalStore((state) => state.getLimitList);
  const limitList: Limits = useLimitStore();

  const [currentTab, setCurrentTab] = useState(() => {
    const tab = path.split("/");
    const tabDictionary: KeyString = {
      exchangeLimits: 1,
    };
    const currentTab: keyof typeof tabDictionary = tab[tab.length - 1] ?? "";

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

  const Component = TabEntries[currentTab]!.component;

  useEffect(() => {
    if (id) {
      void getLimitList(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="flex flex-col gap-3">
      <Box
        sx={{
          marginTop: "1rem",
          position: "sticky",
          top: 0,
          paddingBottom: "1rem",
          background: "#fff",
          zIndex: "99",
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
              <Tab key={index} label={item.name} {...a11yProps(index)} />
            ))}
          </Tabs>
        </Box>
      </Box>

      <Suspense fallback={<Loading />}>
        <Component data={limitList} />
      </Suspense>
    </div>
  );
};

export default PriceListTabsLayout;
