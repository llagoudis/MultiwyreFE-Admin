import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const PersonTabsLayout = ({ children }: Props) => {
  const router = useRouter();
  const { pathname } = router;

  const [value, setValue] = React.useState(() => {
    if (pathname === "/banking/persons/view/documents") {
      return 1;
    } else if (pathname === "/banking/persons/view/accounts") {
      return 2;
    } else if (pathname === "/banking/persons/view/companies") {
      return 3;
    } else if (pathname === "/banking/persons/view/2fa") {
      return 4;
    } else if (pathname === "/banking/persons/view/legalAgreements") {
      return 5;
    } else if (pathname === "/banking/persons/view/notes") {
      return 6;
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
              label="Details"
              {...a11yProps(0)}
              onClick={() => {
                handleNavigate("/banking/persons/view");
              }}
            />
            <Tab
              label="Documents"
              onClick={() => {
                handleNavigate("/banking/persons/view/documents");
              }}
              {...a11yProps(1)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/banking/persons/view/accounts");
              }}
              label="Accounts"
              {...a11yProps(2)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/banking/persons/view/companies");
              }}
              label="Companies"
              {...a11yProps(3)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/banking/persons/view/2fa");
              }}
              label="2FA"
              {...a11yProps(4)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/banking/persons/view/legalAgreements");
              }}
              label="Legal Agreements"
              {...a11yProps(5)}
            />
            <Tab
              onClick={() => {
                handleNavigate("/banking/persons/view/notes");
              }}
              label="Notes"
              {...a11yProps(6)}
            />
          </Tabs>
        </Box>
      </Box>
      {children}
    </div>
  );
};

export default PersonTabsLayout;
