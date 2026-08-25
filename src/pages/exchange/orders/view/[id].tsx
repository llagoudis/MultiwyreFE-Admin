import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatDateTime } from "~/common/functions";
import MuiButton from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import { fetchTransactionById } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";

// type

type parameter = {
  key: string;
  value: string;
};
type transactiontypes = {
  Details: {
    "Transaction ID": string;
    Type: string;
    "Time in force": string;
    Side: string;
    Status: string;
    "From currency": string;
    "To currency": string;

    Amount: string;
    "Provider rate": string;
    "Client rate": string;
    "Client Volume ": string;
    "Processed volume": string;
  };

  additional: {
    ID: string;
    "Provider order ID": string;
    Parameters: parameter[];
    Error: string;
    "Created at": string;
    "Processed At": string;
  };
};

// transaction details
const orderDetails: transactiontypes = {
  Details: {
    "Transaction ID": " 3422d3b1-ff9c-4857-8ff0-ff25a1782658c",
    Type: "Market",
    "Time in force": "GTC",
    Side: "Ask",
    Status: "Success",
    "From currency": "BTC",
    "To currency": "EUR",
    Amount: "0.00000000012",
    "Client rate": "0.00000000012",
    "Provider rate": "0.00000000012",
    "Client Volume ": " 0.00000000012",
    "Processed volume": "0.00000000012",
  },

  additional: {
    ID: "Kraken",
    "Provider order ID": "OCYEMZ-NC4TP-XKRUIS",
    Parameters: [
      { key: "Account provider ID", value: "42" },
      { key: "Account number", value: "42" },
      { key: "Description", value: "Sell XBTEUR @ market " },
      { key: "Provider fee", value: " 0.0024234" },
      { key: "Provider volume executed", value: "0.0024234" },
      { key: "Provider cost", value: " 0.0024234" },
      { key: "Provider price", value: " 0.0024234" },
    ],
    Error: "",
    "Created at": "30.08.2023 09:26:48 UTC",
    "Processed At": "30.08.2023 09:26:48 UTC",
  },
};

interface Response {
  success: boolean;
  body: TransactionDetails;
}

const ViewOrders = () => {
  const router = useRouter();
  const transactionId = Array.isArray(router.query.id) ? "" : router.query.id;

  const [transaction, setTransaction] = useState<TransactionDetails>();

  const fetchData = async () => {
    const [res, error]: APIResult<TransactionDetails> = await ApiHandler(
      fetchTransactionById,
      transactionId,
    );

    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res?.body) {
      setTransaction(res.body);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [transactionId]);

  const orderDetails: transactiontypes = {
    Details: {
      "Transaction ID": transaction?.transactionId ?? "-",
      Type: transaction?.orderType ?? "",
      "Time in force": "-",
      Side: transaction?.TransactionFee?.type ?? "-",
      Status: transaction?.status ?? "-",
      "From currency": transaction?.assetId ?? "-",
      "To currency": transaction?.destinationAssetId ?? "-",
      Amount: transaction?.TransactionFee?.amount ?? "-",
      "Provider rate": transaction?.TransactionFee?.rate ?? "-",
      "Client rate": transaction?.TransactionFee?.clientRate ?? "-",
      "Client Volume ": transaction?.TransactionFee?.debitedAmount ?? "-",
      "Processed volume": transaction?.TransactionFee?.debitedAmount ?? "-",
    },
    additional: {
      ID: transaction?.transactionId ?? "-",
      "Provider order ID": transaction?.transactionId ?? "-",
      Parameters: [{ key: "-", value: "-" }],
      Error: "-",
      "Created at": formatDateTime(transaction?.createdAt) ?? "-",
      "Processed At": formatDateTime(transaction?.createdAt) ?? "-",
    },
  };
  return (
    <div className="my-4">
      <div className=" flex items-center justify-between py-4">
        <p className="pageHeader">Exchange</p>
      </div>
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
              <>
                {!Array.isArray(value) ? (
                  <div key={i} className=" grid grid-cols-2 ">
                    <p className="subText py-2">{key}</p>
                    <p className="subText py-2">{value}</p>
                  </div>
                ) : (
                  <div>
                    <p className="subText py-2">{key}</p>
                    {value.map((item, i) => (
                      <div key={i} className="flex">
                        <p>{item.key}</p>
                        &nbsp;: &nbsp;
                        <p>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ))}
          </HeaderLayout>
        </div>
      </div>
      <Link href="/exchange/orders" className="flex justify-end">
        <MuiButton className="btn-outlined " title="Back" />
      </Link>
    </div>
  );
};

export default ViewOrders;
