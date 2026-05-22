import React, { lazy, Suspense, useEffect, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import Loading from "~/components/common/PageLoaderFallback";
import { useGlobalStore, usePriceStore } from "~/store";

const Details = lazy(() => import("~/pages/banking/price-list/view/Details"));
const TransferFees = lazy(
  () => import("~/pages/banking/price-list/view/TransferFees"),
);
const RecurringFees = lazy(
  () => import("~/pages/banking/price-list/view/RecurringFees"),
);
const IssueCardFees = lazy(
  () => import("~/pages/banking/price-list/view/IssuedCardFees"),
);
const FxMarkupFees = lazy(
  () => import("~/pages/banking/price-list/view/FXMarkupFees"),
);
const Cashback = lazy(() => import("~/pages/banking/price-list/view/Cashback"));
const ChangeVerificationFees = lazy(
  () => import("~/pages/banking/price-list/view/ChangeVerificationLevelFees"),
);

const TabEntries = [
  {
    name: "Details",
    path: "/banking/price-list/${id}/details",
    component: Details,
  },
  {
    name: "Transfer fees",
    path: "/banking/price-list/${id}/transferFees",
    component: TransferFees,
  },
  {
    name: "Recurring Fees",
    path: "/banking/price-list/${id}/recurringFees",
    component: RecurringFees,
  },
  {
    name: "Issued Card Fees",
    path: "/banking/price-list/${id}/issuedCardFees",
    component: IssueCardFees,
  },
  {
    name: "FX Markup fees",
    path: "/banking/price-list/${id}/fxMarkupFees",
    component: FxMarkupFees,
  },
  {
    name: "Cashback",
    path: "/banking/price-list/${id}/cashback",
    component: Cashback,
  },
  {
    name: "Change Verification level fees",
    path: "/banking/price-list/${id}/changeVerificationLevelFees",
    component: ChangeVerificationFees,
  },
];

const PriceListTabsLayout = () => {
  const router = useRouter();
  const path = router.asPath;
  const id = Array.isArray(router.query.id) ? "" : router.query.id;
  const getPriceList = useGlobalStore((state) => state.getPriceList);
  const pricelist: PriceList = usePriceStore();

  const [currentTab, setCurrentTab] = useState(() => {
    const tab = path.split("/");
    const tabDictionary: KeyString = {
      transferFees: 1,
      recurringFees: 2,
      issuedCardFees: 3,
      fxMarkupFees: 4,
      cashback: 5,
      changeVerificationLevelFees: 6,
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
      void getPriceList(Number(id));
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
        <Component data={pricelist} />
      </Suspense>
    </div>
  );
};

export default PriceListTabsLayout;
