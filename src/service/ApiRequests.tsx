import axios, { type Axios } from "axios";
import toast from "react-hot-toast";
import ProtectedAxiosInstance from "./ProtectedAxiosInstance";
import { ApiHandler } from "./UtilService";
import {
  convertUrlParams,
  decryptResponse,
  encryptPayload,
} from "~/common/functions";

const AxiosInstance: Axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

AxiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    config.data = encryptPayload(config.data);

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

AxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.message === "Network Error" && !error.response) {
      // toast.error("Network error - Make sure API's are running");
    }

    if (error.response.status === 500) {
      toast.error("Technical Error");
    }

    return Promise.reject(error);
  },
);

export const login = async (data: Login) =>
  await AxiosInstance.post("/auth", data);
export const signup = (data: Signup) => AxiosInstance.post("/signup", data);

export const verifyOtp = (data: VerifyOTP) =>
  AxiosInstance.post("/auth/verify-otp", data);

export const resendOtp = (data: { otpTransactionId: string | undefined }) =>
  AxiosInstance.post("/auth/resend-otp", data);

export const fetchCountries = () =>
  ProtectedAxiosInstance.get("/lib/get-all-countries");

export const fetchUsers = () => ProtectedAxiosInstance.get("/user/all");

export const getLegalDocuments = () =>
  ProtectedAxiosInstance.get("/documents/legal-documents");

export const getSingleLegalDocuments = (id: number | string) =>
  ProtectedAxiosInstance.get(`/documents/legal-documents/${id}`);

export const createPolicyDocumentType = (data: { displayName: string }) =>
  ProtectedAxiosInstance.post("/documents/policy-document-types", data);

export const editPolicyDocumentType = (documentId: string, data: any) =>
  ProtectedAxiosInstance.put(
    `/documents/policy-document-types/${documentId}`,
    data,
  );

export const getPolicyDocumentTypes = () =>
  ProtectedAxiosInstance.get("/documents/policy-document-types/all");

export const getAdminProfile = async (): APIFunction<AdminProfile[]> =>
  ApiHandler(
    async () => await ProtectedAxiosInstance.get("/admin/admin-profile"),
  );

export const getAllLimits = () => ProtectedAxiosInstance.get("/limits/limits");

export const fetchPriceList = () =>
  ProtectedAxiosInstance.get("accounts/price-list");

export const fetchLimitList = () =>
  ProtectedAxiosInstance.get("/exchange-limits/limitList");

export const fetchIpAddress = () =>
  ProtectedAxiosInstance.get("/security/ipAddress");

export const upBlockIpAdderss = (data: any) =>
  ProtectedAxiosInstance.put(`/security/ipAddress/${data.id}`);

export const fetchClientLogs = (params: FilterType) =>
  ProtectedAxiosInstance.get(`/log/all?${convertUrlParams(params)}`);
export const fetchAdminLogs = (params: FilterType) =>
  ProtectedAxiosInstance.get(`/log/adminLogs?${convertUrlParams(params)}`);

export const fetchTransactions = (params: FilterType) =>
  ProtectedAxiosInstance.get(
    `transaction/allTransactions?${convertUrlParams(params)}`,
  );

export const fetchPaginatedUsers = (params: FilterType) =>
  ProtectedAxiosInstance.get(`/user/paginated?${convertUrlParams(params)}`);

export const fetchSweepTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/sweepTransactions?${convertUrlParams(params)}`,
  );
};

export const fetchUserAssets = () =>
  ProtectedAxiosInstance.get("transaction/userAssets");

export const deletePriceList = (data: any) =>
  ProtectedAxiosInstance.delete(`accounts/price-list/${data.id}`);

export const clonePriceList = (data: any) =>
  ProtectedAxiosInstance.post(`accounts/price-list/${data.id}`);

export const deleteFxmarkup = (data: any) =>
  ProtectedAxiosInstance.delete(`price-list/markup-fees/${data.id}`);

export const deleteTransferfees = (data: any) =>
  ProtectedAxiosInstance.delete(`price-list/transfer-fees/${data.id}`);

export const deleteRecurringfees = (data: any) =>
  ProtectedAxiosInstance.delete(`price-list/recurring-fees/${data.id}`);

export const updateEuroTemplate = (data: any) => {
  return ProtectedAxiosInstance.put(
    `/exchange/euro-templates/${data.id}`,
    data,
  );
};

export const getEuroTemplatesById = (data: any) => {
  return ProtectedAxiosInstance.get(`/exchange/euro-templates/${data.userId}`);
};

export const fetchReportTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/reportsDetails?${convertUrlParams(params)}`,
  );
};

export const fetchReportEcomTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/reportsDetailsEcomTransaction?${convertUrlParams(params)}`,
  );
};

export const fetchReportEcomTransactionsTF = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/reportsEcomTransactionTotalfees?${convertUrlParams(params)}`,
  );
};

export const fetchChargedFees = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/chargedFees?${convertUrlParams(params)}`,
  );
};

export const fetchDailyUserBalances = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/userDailyBalance?${convertUrlParams(params)}`,
  );
};

export const fetchMerchantTurnover = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `e-commerce/merchants?${convertUrlParams(params)}`,
  );
};

export const fetchTransactionById = (id: any) =>
  ProtectedAxiosInstance.get(`transaction/reports/${id}`);

export const fetchAccountById = async (id: any) =>
  ProtectedAxiosInstance.get(`/accounts/assets/users/${id}`);

export const fetchTransactionFees = () =>
  ProtectedAxiosInstance.get("transaction/transaction_fees");

export const fetch_MASTER_GAS_COMMISSION_BALANCE = (data: any) =>
  ProtectedAxiosInstance.get(
    `transaction/masterGasCommissionBalance/${data?.tab}`,
  );

export const create_MASTER_GAS_COMMISSION_LIQUIDITY_WALLET = (
  params: FilterType,
) => {
  return ProtectedAxiosInstance.get(
    `transaction/masterGasCommissionWallet?${convertUrlParams(params)}`,
  );
};

export const fetchKrakenBalance = () =>
  ProtectedAxiosInstance.get("transaction/kraken-balance");

export const addUser = async (data: any): APIFunction<User> =>
  await ApiHandler(() => {
    const requestBody = new FormData();
    //TODO
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.keys(data).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      requestBody.append(key, data[key]);
    });

    return ProtectedAxiosInstance.post(`/user/addUser`, requestBody);
  });

export const updateUser = async (data: any): APIFunction<User> =>
  await ApiHandler(() => {
    const requestBody = new FormData();
    //TODO

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.keys(data).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      requestBody.append(key, data[key]);
    });

    return ProtectedAxiosInstance.put(`/user/${data.azureId}`, requestBody);
  });

export const updateAdminProfile = async (
  data: any,
): APIFunction<AdminProfile> =>
  await ApiHandler(() => {
    const requestBody = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] instanceof File) {
        requestBody.append(key, data[key], data[key].name);
      } else {
        requestBody.append(key, data[key]);
      }
    });

    return ProtectedAxiosInstance.put(`/admin/admin-profile/1`, requestBody);
  });

export const deleteUser = (data: any) =>
  ProtectedAxiosInstance.delete(`/user/${data.id}`);

export const updateProfilePic = (data: any) =>
  ProtectedAxiosInstance.post(`/user/addUser`, data);

export const fetchUserById = async (data: any): APIFunction<UserStore> =>
  await ApiHandler(() => ProtectedAxiosInstance.get(`/user/${data.id}`));

export const fetchDocumentsList = () =>
  ProtectedAxiosInstance.get(`/documents/document-types/all`);

export const uploadLegalDocumentUser = (data: any) =>
  ProtectedAxiosInstance.post(`/documents/legal-agreements`, data);

export const deleteLegalAgreement = async (
  id: string | number,
): APIFunction<LegalAgreements> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.delete(`/documents/legal-agreements/${id}`),
  );

export const deleteLegalDocument = async (
  id: string | number,
): APIFunction<LegalAgreements> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.delete(`/documents/legal-document/${id}`),
  );

export const upadteLegalDocumentUser = async (
  documentId: string | number | undefined,
  data: any,
): APIFunction<LegalAgreements> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(
      `/documents/legal-agreements/${documentId}`,
      data,
    ),
  );
export const updateLegalDocument = async (
  documentId: string | number | undefined,
  data: any,
): APIFunction<LegalAgreements> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/documents/legal-document/${documentId}`, data),
  );
export const SendRequestNewMail = (data: any) =>
  ProtectedAxiosInstance.post("/documents/request-new", data);

export const updateTranscationStatus = async (
  transactionId: any,
  status: any,
) => {
  return ProtectedAxiosInstance.put(`transaction/reports/${transactionId}`, {
    status,
  });
};

export const fetchSecurity = () => ProtectedAxiosInstance.get("/security");

export const updateSecurity = async (data: any): APIFunction<Security> =>
  await ApiHandler(() => {
    const requestBody = new FormData();
    //TODO
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.keys(data).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      requestBody.append(key, data[key]);
    });

    return ProtectedAxiosInstance.put(`/security/1`, requestBody);
  });

export const getAllMerchants = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `ecommerce/merchants?${convertUrlParams(params)}`,
  );
};

export const getAllCheckoutMerchants = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `checkout-merchant/merchants?${convertUrlParams(params)}`,
  );
};

export const getAllAutoConversion = () =>
  ProtectedAxiosInstance.get("/ecommerce/autoConversion");

export const getAllCustomerWallets = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `/ecommerce/getallcustomer?${convertUrlParams(params)}`,
  );
};

export const getAllMerchantWallets = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `/ecommerce/all-merchant-wallets?${convertUrlParams(params)}`,
  );
};

export const fetchEcomTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `getall/ecom/transactions?${convertUrlParams(params)}`,
  );
};

export const fetchCheckoutTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `checkout-merchant/transactions?${convertUrlParams(params)}`,
  );
};

export const merchantsTurnover = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `ecomtransaction/merchant-turnover?${convertUrlParams(params)}`,
  );
};

// E-Commerce Reports -> Project Fees.
// Per project, per currency aggregation of fees. BACKEND TO IMPLEMENT.
// Expected (read as res.body.data + res.body.pagination.totalItems):
//   data: Array<{
//     projectId: number; projectName: string; companyId: string;
//     User: { firstname: string; lastname: string; companyProfileId: string };
//     currency: string;     // e.g. "EUR" | "USDT" | "BTC"
//     markupFee: string;    // total mark-up fee for project+currency
//     networkFee: string;   // total network fee for project+currency
//   }>
// Aggregation: NETWORK FEE = sum of network fee across the project's
// transactions; MARK-UP FEE = sum of (commission "received crypto" -
// network fee), grouped by project + currency. Accepts the same
// FilterType params (pageSize, pageNumber, fromDate, toDate, sort).
export const fetchEcomProjectFees = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `ecomtransaction/project-fees?${convertUrlParams(params)}`,
  );
};

export const CheckoutMerchantsTurnover = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `checkout-merchant/merchantsTurnover?${convertUrlParams(params)}`,
  );
};

export const fetchEcomSweepTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `ecomtransaction/sweepTransactions?${convertUrlParams(params)}`,
  );
};

export const fetchBulkTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/all_bulk_transactions?${convertUrlParams(params)}`,
  );
};

export const adminWithdraw = (data: any) =>
  ProtectedAxiosInstance.post(`/adminwallet/admin-wallet-transactions`, data);

export const adminCommissionWithdraw = (data: any) =>
  ProtectedAxiosInstance.post(
    `/adminwallet/admin-commission-wallet-transactions`,
    data,
  );

export const ManualWithdraw = (data: any) =>
  ProtectedAxiosInstance.post(`/adminwallet/manual_transactions`, data);

export const fetchManualTrxs = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `/adminwallet/manual_transactions?${convertUrlParams(params)}`,
  );
};

export const fetchAdminWalletTrxs = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `adminwallet/fetchAdminWalletTrxs?${convertUrlParams(params)}`,
  );
};

export const fetchAdminCommissionWalletTrxs = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `adminwallet/fetchAdminCommissionWalletTrxs?${convertUrlParams(params)}`,
  );
};

export const getAllAcquirers = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `checkout-merchant/acquirers?${convertUrlParams(params)}`,
  );
};

export const AddAcquirer = (data: any) =>
  ProtectedAxiosInstance.post(`checkout-merchant/acquirer`, data);

export const EditAcquirer = (data: any) =>
  ProtectedAxiosInstance.put(`checkout-merchant/acquirer/${data?.id}`, data);

export const deleteAcquirer = (data: any) =>
  ProtectedAxiosInstance.delete(`checkout-merchant/acquirer/${data?.id}`);

export const fetchAcquirerKey = (data: Acquirer) =>
  ProtectedAxiosInstance.put(
    `checkout-merchant/acquirer/secretKey/${data?.id}`,
    data,
  );
