import React, { useEffect, useState } from "react";
import MuiButton from "~/components/common/Button";
import { Drawer, IconButton } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import toast from "react-hot-toast";
import { getMerchantsById } from "~/service/api/ecommerce";

type propType = {
  onClose: () => void;
  openAdd: string;
  getById: string;
};

// Start ViewMerchant
const ViewMerchant = ({ onClose, getById, openAdd: openScreen }: propType) => {
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<Merchant>();

  const getMerchants = async () => {
    setLoading(true);
    const [data, error]: APIResult<Merchant> = await getMerchantsById(
      Number(getById),
    );
    setLoading(false);
    if (error) {
      toast.error("Failed to load PriceLists");
    }
    if (data?.success) {
      setMerchants(data.body);
    }
  };

  useEffect(() => {
    if (getById) {
      void getMerchants();
    }
  }, [getById]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      // console.log("Copied:", value);
    } catch (error) {
      // console.error("Error copying:", error);
    }
  };

  return (
    <Drawer anchor={"right"} open={true}>
      <div className="my-4 w-[35vw] p-5">
        <p className=" text-2xl font-medium">View Merchant</p>

        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Stack
              sx={{ color: "#217EFD", minWidth: "4rem", alignItems: "center" }}
              spacing={4}
            >
              <CircularProgress size="3rem" color="inherit" />
            </Stack>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className=" mt-4 font-bold">Display Name</p>
              <p className=" mt-4">{merchants?.projectName}</p>
            </div>
            <div>
              <p className=" mt-4 font-bold">URL</p>
              <p className=" mt-4">{merchants?.webURL}</p>
            </div>
            <div>
              <p className=" mt-4 font-bold">Owner</p>
              <p className=" mt-4">{merchants?.User?.firstname}</p>
            </div>
            <div>
              <p className=" mt-4 font-bold">Private Key</p>
              <div className="mt-4 flex items-center">
                <p>****************</p>
                <IconButton
                  onClick={() => handleCopy(merchants?.privateKey ?? "")}
                  edge="end"
                >
                  <ContentCopyIcon />
                </IconButton>
              </div>
            </div>
            <div>
              <p className=" mt-4 font-bold">Public Key</p>
              <div className="mt-4 flex items-center">
                <p>****************</p>
                <IconButton
                  onClick={() => handleCopy(merchants?.publicKey ?? "")}
                  edge="end"
                >
                  <ContentCopyIcon />
                </IconButton>
              </div>
            </div>
            <div>
              <p className=" mt-4 font-bold">Callback URL</p>
              <p className=" mt-4">{merchants?.callbackURL}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <MuiButton
            className="btn-outlined"
            title="Close"
            onClick={() => {
              onClose();
            }}
          ></MuiButton>
        </div>
      </div>
    </Drawer>
  );
};

export default ViewMerchant;
