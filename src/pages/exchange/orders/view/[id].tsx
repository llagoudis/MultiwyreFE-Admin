import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDateTime, hasEuroBankDetails } from "~/common/functions";
import MuiButton from "~/components/common/Button";
import { euroBankDetailsMap } from "~/components/common/EuroBankBlock";
import HeaderLayout from "~/components/common/HeaderLayout";
import {
  fetchTransactionById,
  updateTranscationStatus,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";

type parameter = {
  key: string;
  value: string;
};
type transactiontypes = {
  Details: Record<string, string>;

  additional: {
    ID: string;
    "Provider order ID": string;
    Parameters: parameter[];
    Error: string;
    "Created at": string;
    "Processed At": string;
  };
};

const ViewOrders = () => {
  const router = useRouter();
  const transactionId = Array.isArray(router.query.id) ? "" : router.query.id;

  const [transaction, setTransaction] = useState<TransactionDetails>();
  const [busy, setBusy] = useState(false);

  const fetchData = async () => {
    const [res, error]: APIResult<TransactionDetails> = await ApiHandler(
      fetchTransactionById,
      transactionId,
    );

    if (error) {
      toast.error("Failed to load order");
    }

    if (res?.success && res?.body) {
      setTransaction(res.body);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [transactionId]);

  const isOtcPending =
    transaction?.note === "OTC_TRANSACTION" &&
    String(transaction?.status ?? "").toUpperCase() === "PENDING";

  const setStatus = async (
    status: string,
    subStatus: string,
    okMessage: string,
  ) => {
    if (!transactionId || busy) return;
    setBusy(true);
    try {
      const res: any = await updateTranscationStatus(transactionId, {
        status,
        subStatus,
      });
      const ok =
        res?.success === true ||
        res?.data?.success === true ||
        res?.status === 200;
      if (!ok) {
        toast.error("Failed to update order status");
        return;
      }
      toast.success(okMessage);
      await fetchData();
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setBusy(false);
    }
  };

  const confirmOrder = () =>
    void setStatus(
      "COMPLETED",
      "CONFIRMED",
      "OTC order confirmed — it will show as executed in Trading History",
    );

  const cancelOrder = () =>
    void setStatus("CANCELED", "CANCELED", "OTC order canceled");

  const euroBank = hasEuroBankDetails(transaction)
    ? euroBankDetailsMap(transaction?.EuroTransaction)
    : null;

  const orderDetails: transactiontypes = {
    Details: {
      "Transaction ID": transaction?.transactionId ?? "-",
      Note: transaction?.note ?? "-",
      Type: transaction?.orderType ?? "",
      "Time in force": "-",
      Side: transaction?.TransactionFee?.type ?? "-",
      Status: transaction?.status ?? "-",
      "Sub status": transaction?.subStatus ?? "-",
      "From currency": transaction?.assetId ?? "-",
      "To currency": transaction?.destinationAssetId ?? "-",
      Amount: transaction?.TransactionFee?.amount ?? "-",
      "Provider rate": transaction?.TransactionFee?.rate ?? "-",
      "Client rate": transaction?.TransactionFee?.clientRate ?? "-",
      "Client Volume ": transaction?.TransactionFee?.debitedAmount ?? "-",
      "Processed volume": transaction?.TransactionFee?.debitedAmount ?? "-",
      ...(euroBank ?? {}),
    },
    additional: {
      ID: transaction?.transactionId ?? "-",
      "Provider order ID": transaction?.transactionId ?? "-",
      Parameters: [{ key: "-", value: "-" }],
      Error: "-",
      "Created at": formatDateTime(transaction?.createdAt) ?? "-",
      "Processed At": formatDateTime(transaction?.updatedAt) ?? "-",
    },
  };
  return (
    <div className="my-4">
      <div className=" flex items-center justify-between py-4">
        <p className="pageHeader">Exchange</p>
        <div className="flex flex-wrap gap-2">
          {isOtcPending ? (
            <>
              <MuiButton
                className="btn-red-cancel"
                title={busy ? "…" : "Cancel"}
                onClick={cancelOrder}
              />
              <MuiButton
                className="btn-green-completed"
                title={busy ? "…" : "Confirm"}
                onClick={confirmOrder}
              />
            </>
          ) : null}
          <Link href="/exchange/orders">
            <MuiButton className="btn-outlined " title="Back" />
          </Link>
        </div>
      </div>
      {isOtcPending ? (
        <p className="mb-3 text-sm text-slate-600">
          OTC desk order is <b>Pending</b>. Press <b>Confirm</b> after settlement
          to mark it completed (moves out of user Pending Trading History).
        </p>
      ) : null}
      <div className=" grid grid-cols-2 gap-4">
        {/* column 1 */}
        <div className="flex flex-col gap-4">
          {/* Details and documents */}
          <HeaderLayout name="Details and documents">
            <div className="flex flex-col gap-3">
              {Object.entries(orderDetails.Details).map(([key, value], i) => (
                <div key={i} className="grid grid-cols-2">
                  <p className="subText">{key}</p>
                  <p className="subText">{value}</p>
                </div>
              ))}
            </div>
          </HeaderLayout>
        </div>
        {/* column 2 */}
        <div className="flex flex-col gap-4">
          {/* Additional data */}
          <HeaderLayout name="Additional data">
            {Object.entries(orderDetails.additional).map(([key, value], i) => (
              <React.Fragment key={key}>
                {!Array.isArray(value) ? (
                  <div className=" grid grid-cols-2 ">
                    <p className="subText py-2">{key}</p>
                    <p className="subText py-2">{value}</p>
                  </div>
                ) : (
                  <div>
                    <p className="subText py-2">{key}</p>
                    {value.map((item, j) => (
                      <div key={j} className="flex">
                        <p>{item.key}</p>
                        &nbsp;: &nbsp;
                        <p>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </HeaderLayout>
        </div>
      </div>
    </div>
  );
};

export default ViewOrders;
