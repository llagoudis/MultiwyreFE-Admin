import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

const getTransactionById = async (
  id: string,
): APIFunction<TransactionDetails> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/transaction/reports/${id}`),
  );

const createTransactions = async (data: any): APIFunction<RecurringFees> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/transaction/create_transaction", data),
  );

const updateTransactionFeeValue = async (
  data: any,
): APIFunction<RecurringFees> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(
      `/transaction/update_transaction/${data.reference_transaction}`,
      data,
    ),
  );

export { getTransactionById, createTransactions, updateTransactionFeeValue };
