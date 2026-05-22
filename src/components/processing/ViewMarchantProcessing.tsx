import React, { useEffect, useState } from "react";
import MuiButton from "~/components/common/Button";
import { Drawer, IconButton } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import toast from "react-hot-toast";
import { getCheckoutMerchantsById } from "~/service/api/checkoutMerchant";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import CloseIcon from "@mui/icons-material/Close";

type propType = {
  onClose: () => void;
  openAdd: string;
  getById: string;
  acquirers: Acquirer[];
};

// Start ViewMerchantProcessing
const ViewMerchantProcessing = ({ onClose, getById, acquirers }: propType) => {
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<Merchant>();
  const [paymentMethods] = useAsyncMasterStore("paymentMethods");

  const getMerchants = async () => {
    setLoading(true);
    const [data, error]: APIResult<Merchant> = await getCheckoutMerchantsById(
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
      <div className="my-2 w-[45vw] p-5">
        <div className=" flex items-center justify-between pb-4 pt-4 ">
          <p className=" text-2xl font-medium">View Merchant</p>
          <IconButton
            onClick={() => {
              onClose();
            }}
          >
            <CloseIcon className="cursor-pointer" />
          </IconButton>
        </div>
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
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className=" mt-1 font-bold">Display Name</p>
              <p className=" mt-1">{merchants?.projectName}</p>
            </div>
            <div>
              <p className=" mt-1 font-bold">URL</p>
              <p className=" mt-1">{merchants?.webURL}</p>
            </div>
            <div>
              <p className=" mt-1 font-bold">Owner</p>
              <p className=" mt-1">{merchants?.User?.firstname}</p>
            </div>
            <div>
              <p className=" mt-1 font-bold">Private Key</p>
              <div className="mt-1 flex items-center">
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
              <p className=" mt-1 font-bold">Public Key</p>
              <div className="mt-1 flex items-center">
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
              <p className=" mt-1 font-bold">Callback URL</p>
              <p className=" mt-1">{merchants?.callbackURL}</p>
            </div>
            <div>
              <p className=" mt-1 font-bold">Payout type</p>
              <p className=" mt-1">{merchants?.payoutType}</p>
            </div>

            <div></div>

            <div className="col-span-2">
              <p className="mt-1 font-bold">Acquirers</p>

              <div className="mt-2 space-y-2">
                {merchants?.mappings?.length ? (
                  merchants?.mappings?.map((item, idx) => {
                    const paymentMethodName =
                      paymentMethods?.find(
                        (pm: any) => pm.id === item?.paymentMethod,
                      )?.name ?? "N/A";

                    const acquirerName =
                      acquirers?.find((ac: any) => ac.id === item?.acquirer)
                        ?.acquirer ?? "N/A";

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <div>
                          <p className="text-sm text-gray-600">
                            Payment Method
                          </p>
                          <p className="font-medium">{paymentMethodName}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Acquirer</p>
                          <p className="font-medium">{acquirerName}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="mt-1 text-gray-500">No mappings found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default ViewMerchantProcessing;
