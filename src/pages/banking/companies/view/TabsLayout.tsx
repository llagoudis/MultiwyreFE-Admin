import React, { lazy, useState, useEffect, Suspense } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import { getCompanyById } from "~/service/api/company";
import Loading from "~/components/common/PageLoaderFallback";
import { useCompanyStore } from "~/store";

const View = lazy(() => import("./view"));
const Documents = lazy(() => import("./documents"));
const Staff = lazy(() => import("./staff"));
const Notes = lazy(() => import("./notes"));
const EuroTemplates = lazy(() => import("./euroTemplates"));
const LegalAgreements = lazy(() => import("./legalAgreements"));
const Counterparties = lazy(() => import("./counterParties"));
const Accounts = lazy(() => import("./accounts"));
const AccountProvider = lazy(() => import("./accountProviderConfiguration"));

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
    name: "Staff",
    component: Staff,
  },
  {
    name: "CounterParties",
    component: Counterparties,
  },
  {
    name: "Legal Agreements",
    component: LegalAgreements,
  },
  {
    name: "Account Provide Configurations",
    component: AccountProvider,
  },
  {
    name: "Notes",
    component: Notes,
  },

  {
    name: "Euro Templates",
    component: EuroTemplates,
  },
];

const CompanyTabsLayout = () => {
  const router = useRouter();
  const companyId = String(router.query.id ?? "");

  const companyData: CompanyDetailsType = useCompanyStore();

  const [value, setValue] = useState<number>(0);

  const onTabChange = (activeTab: number) => {
    setValue(activeTab);
    sessionStorage.setItem("companiesActiveTab", `${activeTab}`);
  };

  const a11yProps = (index: number) => ({
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  });

  useEffect(() => {
    const previouse = parseInt(
      sessionStorage.getItem("companiesActiveTab") ?? "0",
    );
    previouse && onTabChange(previouse);

    return () => sessionStorage.removeItem("companiesActiveTab");
  }, []);

  useEffect(() => {
    if (companyId && companyId !== String(companyData.company.id)) {
      void getCompanyById(companyId);
    }
  }, [companyData.company.id, companyId]);

  const Component = TabRoutes[value]!.component;

  if (companyData.company.id !== parseInt(companyId)) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
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
          <Box>
            <Tabs
              value={value}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                boxShadow: " 0px 4px 9px 0px #0000000F",
                bgcolor: "#F8FAFC",
              }}
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
        </Box>
        <Component data={companyData} />
      </div>
    </Suspense>
  );
};

export default CompanyTabsLayout;
