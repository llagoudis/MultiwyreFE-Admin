import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AutoLogout from "~/components/security/AutoLogout";
import LoginSecurity from "~/components/security/LoginSecurity";
import { ApiHandler } from "~/service/UtilService";
import { useForm } from "react-hook-form";
import { fetchSecurity, updateSecurity } from "~/service/ApiRequests";
import { useEffect, useState } from "react";
import IpAddess from "~/components/security/IpAddess";

// import Companies from "../companies";

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

type formData = {
  file: string;
  companyLegalName: string;
  email: string;
};

export default function Security() {
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<formData>();
  const [first, setfirst] = useState();

  const [security, setSecurity] = useState<Security>();
  async function fetchSecurityDetails() {
    console.log("called");

    const [res, error]: APIResult<Security> = await ApiHandler(fetchSecurity);

    if (res?.body) {
      setSecurity(res?.body);
    }
  }

  useEffect(() => {
    void fetchSecurityDetails();
  }, []);

  return (
    <div>
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
                marginTop: "1rem",
                borderRadius: "10px",
                padding: "2px",
              },
            }}
          >
            <Tab label="LOGIN SECURITY" {...a11yProps(0)} />
            <Tab label="AUTO LOGOUT" {...a11yProps(1)} />
            <Tab label="BLOCKLIST" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <CustomTabPanel value={value} index={0}>
          <LoginSecurity
            data={security}
            fetchUpdatedSecuriy={() => {
              void fetchSecurityDetails();
            }}
          />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <AutoLogout
            fetchUpdatedSecuriy={() => {
              void fetchSecurityDetails();
            }}
            data={security}
          />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <IpAddess />
        </CustomTabPanel>
      </Box>
    </div>
  );
}
