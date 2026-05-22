import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { calculatePaymentType, formatDateTime } from "~/common/functions";
import MuiButton from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import {
  fetchTransactionById,
  fetchUserAssets,
  updateTranscationStatus,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { useRouter } from "next/router";

// type
interface TransactionBody {
  Details: {
    ID: string;
    "Transaction type": string;
    "Created At": string;
    "Updated At": string;
    Currency: string;
    Amount: string;
    "Payment type": string;
    Side: string;
    Fee: string;
    "Transaction Status": string;
  };
  "Uploaded documents": {
    "File1.pdf": string;
    "File2.pdf": string;
  };

  "Bank details": {
    "Bank name": string;
    Country: string;
    "Bank address": string;
    "Swift/Bic": string;
  };

  Beneficiary: {
    Name: string;
    Type: string;
    "Account Number": string;
    Currency: string;
    Country: string;
    "Address Line": string;
  };
  Sender: {
    "Transaction Type": string;
    Name: string;
    "Account Number": string;
    Description: string;
  };

  "Additional Information": {
    "Reference transaction": string;
    "Referenced by": string;
    Error: string;

    "Provider ID": string;
  };

  Parameters: {
    TxHash: string;
  };

  "Data Debit": {
    "Mandate ID": string;
    "Payment ID": string;
  };
}

const ViewTransactions = () => {
  const router = useRouter();
  const transactionId = Array.isArray(router.query.id) ? "" : router.query.id;

  const [userAssets, setUserAssets] = useState<UserAssets[]>([]);

  const getUserAssets = async () => {
    const [res, error]: APIResult<UserAssets[]> =
      await ApiHandler(fetchUserAssets);

    if (error) {
      toast.error("Failed to load users");
    }

    if (res?.success && res.body) {
      setUserAssets(res.body);
    }
  };

  const [transaction, setTransaction] = useState<TransactionDetails>();
  const fetchTransaction = async () => {
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
    if (transactionId) void fetchTransaction();
  }, [transactionId]);

  useEffect(() => {
    void getUserAssets();
  }, []);

  function fetchName(id: any) {
    const address = userAssets?.filter((item) => {
      return item.assetAddress === id;
    });
    if (address && address.length > 0 && address[0]?.User) {
      const user = address[0].User;
      return {
        name: `${user.firstname ?? ""} ${user.lastname ?? ""}`,
        accountNumber: address[0].accountNumber || "-",
      };
    } else {
      return {
        name: "-",
        accountNumber: "-",
      };
    }
  }

  function paymentMethod(row: TransactionDetails | undefined) {
    if (row === undefined) return "";
    return calculatePaymentType({ row });
  }

  function transactionStatus(row: TransactionDetails | undefined) {
    const pendingStatuses = new Set([
      "PENDING_BLOCKCHAIN_CONFIRMATIONS",
      "SUBMITTED",
      "PENDING_AML_SCREENING",
      "PENDING_ENRICHMENT",
      "PENDING_AUTHORIZATION",
      "QUEUED",
      "PENDING_SIGNATURE",
      "PENDING_3RD_PARTY_MANUAL_APPROVAL",
      "PENDING_3RD_PARTY",
      "BROADCASTING",
      "CONFIRMING",
      "CANCELLING",
    ]);
    if (row === undefined) return "";
    if (pendingStatuses.has(row?.status)) {
      return "PENDING";
    } else if (row?.status === "COMPLETED") {
      return "COMPLETED";
    } else {
      return String(row?.status) || "";
    }
  }

  const nameAndAccount = fetchName(transaction?.sourceAddress ?? "External");
  const nameAndAccountDestination = fetchName(
    transaction?.destinationAddress ?? "External",
  );
  const TransactionDetails: TransactionBody = {
    Details: {
      ID: transaction?.transactionId ?? "",
      "Transaction type": transaction?.OperationType?.displayName ?? "",
      "Created At": formatDateTime(transaction?.createdAt, true) ?? "-",
      "Updated At": formatDateTime(transaction?.updatedAt, true) ?? "-",
      Currency:
        Number(transaction?.operationType) === 5
          ? `${transaction?.assetId} - ${transaction?.destinationAssetId}` ?? ""
          : `${transaction?.assetId}`,
      Amount:
        transaction?.note === "COMMISSION_TRANSACTION"
          ? transaction?.TransactionFee?.amount
          : transaction?.TransactionFee?.amount ?? "-",
      "Payment type": paymentMethod(transaction),

      Side:
        Number(transaction?.operationType) === 5
          ? transaction?.TransactionFee?.type ?? ""
          : "",
      Fee: transaction?.TransactionFee?.transactionFee ?? "-",
      "Transaction Status": transactionStatus(transaction),
    },

    "Uploaded documents": {
      "File1.pdf": "-",
      "File2.pdf": "-",
    },

    "Bank details": {
      "Bank name": transaction?.EuroTransaction?.bankName ?? "-",
      Country: transaction?.EuroTransaction?.bankCountry ?? "-",
      "Bank address": transaction?.EuroTransaction?.bankAddress ?? "-",
      "Swift/Bic": transaction?.EuroTransaction?.swift ?? "-",
    },

    Beneficiary: {
      Name:
        Number(transaction?.operationType) === 2 &&
        transaction?.assetId === "EUR"
          ? transaction?.EuroTransaction?.customerName ?? "-"
          : nameAndAccountDestination?.name,
      Type:
        Number(transaction?.operationType) === 1 ||
        Number(transaction?.operationType) === 5
          ? `${transaction?.User?.userType === null ? "Person" : "Company"}`
          : "",
      "Account Number":
        Number(transaction?.operationType) === 2 &&
        transaction?.assetId === "EUR"
          ? transaction?.EuroTransaction?.IBAN ?? "-"
          : nameAndAccountDestination?.accountNumber,
      Currency:
        Number(transaction?.operationType) === 5
          ? `${transaction?.destinationAssetId}` ?? ""
          : `${transaction?.assetId}`,
      Country: transaction?.EuroTransaction?.customerCountry ?? "-",
      "Address Line":
        Number(transaction?.operationType) === 2 &&
        transaction?.assetId === "EUR"
          ? transaction?.EuroTransaction?.customerAddress ?? "-"
          : "",
    },
    Sender: {
      "Transaction Type": transaction?.OperationType?.displayName ?? "",
      Name:
        Number(transaction?.operationType) === 1 &&
        transaction?.assetId === "EUR"
          ? transaction?.EuroTransaction?.customerName ?? "-"
          : nameAndAccount.name,
      "Account Number":
        Number(transaction?.operationType) === 1 &&
        transaction?.assetId === "EUR"
          ? transaction?.EuroTransaction?.IBAN ?? "-"
          : nameAndAccount?.accountNumber,
      Description: transaction?.note ?? "-",
    },

    "Additional Information": {
      "Reference transaction": "-",
      "Referenced by": "-",
      Error: "-",

      "Provider ID": "-",
    },

    Parameters: {
      TxHash: transaction?.txHash ?? "",
    },

    "Data Debit": {
      "Mandate ID": "-",
      "Payment ID": "-",
    },
  };

  const pendingStatusUpdate = async () => {
    const status = {
      status: "PENDING",
      subStatus: "PENDING",
    };
    const data = await updateTranscationStatus(transactionId, status);
    if (data) {
      toast.success("Pending status updated successfully");
    }
  };
  const completedStatusUpdate = async () => {
    const status = {
      status: "COMPLETED",
      subStatus: "COMPLETED",
    };
    const data = await updateTranscationStatus(transactionId, status);
    if (data) {
      toast.success("Completed status updated successfully");
    }
  };
  const canceledStatusUpdate = async () => {
    const status = {
      status: "CANCELED",
      subStatus: "CANCELED",
    };
    const data = await updateTranscationStatus(transactionId, status);
    if (data) {
      toast.success("Canceled status updated successfully");
    }
  };

  return (
    <div className="my-4">
      <div className=" flex items-center justify-between py-4">
        <p className="pageHeader">View transaction</p>
        <div className="flex gap-3">
          {transaction?.assetId === "EUR" ? (
            <>
              <MuiButton
                onClick={() => {
                  router.back();
                }}
                title="Back"
                className="btn-solid"
              ></MuiButton>
              <MuiButton
                onClick={() => {
                  void canceledStatusUpdate();
                }}
                title="Cancel"
                className="btn-red-cancel"
              ></MuiButton>
              <MuiButton
                onClick={() => {
                  void pendingStatusUpdate();
                }}
                title="Pending"
                className="btn-org-pending"
              ></MuiButton>
              <MuiButton
                onClick={() => {
                  void completedStatusUpdate();
                }}
                title="Completed"
                className="btn-green-completed"
              ></MuiButton>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className=" grid grid-cols-2 gap-4">
        {/* column 1 */}
        <div className="flex flex-col gap-4">
          {/* Details and documents */}
          <HeaderLayout name="Transaction Details">
            <div className="flex flex-col gap-3">
              {Object.entries(TransactionDetails.Details).map(
                ([key, value], i) => (
                  <div key={i} className="grid grid-cols-2">
                    <p className="subText">{key}</p>
                    <p className="subText">{value}</p>
                  </div>
                ),
              )}
            </div>
          </HeaderLayout>

          <HeaderLayout name="Beneficiary">
            <div className="flex flex-col gap-3">
              {Object.entries(TransactionDetails.Beneficiary).map(
                ([key, value], i) => (
                  <div key={i} className="grid grid-cols-2">
                    <p className="subText">{key}</p>
                    <p className="subText">{value}</p>
                  </div>
                ),
              )}
            </div>
          </HeaderLayout>
          <HeaderLayout name="Sender">
            <div className="flex flex-col gap-3">
              {Object.entries(TransactionDetails.Sender).map(
                ([key, value], i) => (
                  <div key={i} className="grid grid-cols-2">
                    <p className="subText">{key}</p>
                    <p className="subText">{value}</p>
                  </div>
                ),
              )}
            </div>
          </HeaderLayout>

          <HeaderLayout name="Uploaded documents">
            <div className="flex flex-col gap-3">
              {Object.entries(TransactionDetails["Uploaded documents"]).map(
                ([key, value], i) => (
                  <div key={i} className="grid grid-cols-2">
                    <p className="subText text-blue-600 underline">{key}</p>
                    <a href={"##" + value} download>
                      <MuiButton className="btn-solid" title="Download" />
                    </a>
                  </div>
                ),
              )}
            </div>
          </HeaderLayout>
        </div>
        {/* column 2 */}
        <div className="flex flex-col gap-4">
          {/* Beneficiary Bank */}
          <HeaderLayout name="Beneficiary Bank">
            <div className="flex flex-col gap-3">
              {Object.entries(TransactionDetails["Bank details"]).map(
                ([key, value], i) => (
                  <div key={i} className=" grid grid-cols-2 ">
                    <p className="subText">{key}</p>
                    <p className="subText">{value}</p>
                  </div>
                ),
              )}
            </div>
          </HeaderLayout>

          {/* Additional information */}
          <HeaderLayout name="Additional information">
            <div className=" flex flex-col gap-4">
              {Object.entries(TransactionDetails["Additional Information"]).map(
                ([key, value], i) => (
                  <div key={i} className=" grid grid-cols-2 ">
                    <p className="subText">{key}</p>
                    <p className="subText">{value}</p>
                  </div>
                ),
              )}{" "}
            </div>
          </HeaderLayout>

          {/* Parameters */}

          <HeaderLayout name="Parameters">
            <div className=" flex flex-col gap-4">
              {Object.entries(TransactionDetails.Parameters).map(
                ([key, value], i) => (
                  <div key={i} className=" grid grid-cols-2 ">
                    <p className="subText">{key}</p>
                    <p className="subText">{value}</p>
                  </div>
                ),
              )}{" "}
            </div>
          </HeaderLayout>

          {/* Approvals  */}
          {/* <HeaderLayout name="Approvals">
            <div className=" flex flex-col gap-4">
              <div className=" grid grid-cols-2 ">
                <p className="subText">{"System ( 05:09:2022 09:52:00)"}</p>
              </div>
            </div>
          </HeaderLayout> */}

          {/* Data Debit */}

          {/* <HeaderLayout name="Data Debit">
            <div className=" flex flex-col gap-4">
              {Object.entries(TransactionDetails["Data Debit"]).map(
                ([key, value], i) => (
                  <div key={i} className=" grid grid-cols-2 ">
                    <p className="subText">{key}</p>
                    <p className="subText">{value}</p>
                  </div>
                ),
              )}{" "}
            </div>
          </HeaderLayout> */}
        </div>
      </div>
    </div>
  );
};

export default ViewTransactions;
