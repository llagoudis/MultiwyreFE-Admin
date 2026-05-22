import React, { lazy, useState, useEffect } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import { useGlobalStore, usePersonsStore } from "~/store";
const View = lazy(() => import("./Details"));
const Documents = lazy(() => import("./documents"));
const Companies = lazy(() => import("./companies"));
const Notes = lazy(() => import("./notes"));
const LegalAgreements = lazy(() => import("./legalAgreements"));
const TwoFA = lazy(() => import("./2fa"));
const Accounts = lazy(() => import("./accounts"));
const EuroTemplate = lazy(() => import("./euroTemplates"));

const TabRoutes = [
  {
    name: "Details",
    component: View,
  },
  {
    name: "Documents",
    component: Documents,
  },
  {
    name: "Accounts",
    component: Accounts,
  },
  {
    name: "Companies",
    component: Companies,
  },
  {
    name: "2FA",
    component: TwoFA,
  },
  {
    name: "Legal Documents",
    component: LegalAgreements,
  },
  {
    name: "Notes",
    component: Notes,
  },

  {
    name: "Euro Templates",
    component: EuroTemplate,
  },
];

const UserTabLayout = () => {
  const router = useRouter();
  const userId = Array.isArray(router.query.id) ? "" : router.query.id;
  const getUserById = useGlobalStore((state) => state.getPerson);

  const persons = usePersonsStore();
  const [value, setValue] = useState<number>(0);

  const onTabChange = (activeTab: number) => {
    setValue(activeTab);
    sessionStorage.setItem("userActiveTab", `${activeTab}`);
  };

  const a11yProps = (index: number) => ({
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  });

  useEffect(() => {
    const previous = parseInt(sessionStorage.getItem("userActiveTab") ?? "0");
    previous && onTabChange(previous);

    () => sessionStorage.removeItem("userActiveTab");
  }, []);

  useEffect(() => {
    if (userId) {
      void getUserById(userId);
    }
  }, [userId, getUserById]);

  const Component: any = TabRoutes[value]!.component;

  return (
    <div className=" mt-[1rem] flex flex-col gap-3">
      <Box
        className="bg-[#F8FAFC] "
        sx={{
          boxShadow: " 0px 4px 9px 0px #0000000F",
        }}
      >
        <Tabs
          value={value}
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
          {TabRoutes.map((tab, index: number) => (
            <Tab
              key={index}
              label={tab.name}
              {...a11yProps(index)}
              onClick={() => onTabChange(index)}
            />
          ))}
        </Tabs>
      </Box>
      <Component userDetails={persons} />
    </div>
  );
};

export default UserTabLayout;
