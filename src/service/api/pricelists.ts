import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";

const createPriceList = async (data: PriceList): APIFunction<PriceList> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/accounts/price-list", data),
  );

const updatePriceList = async (
  id: string | number,
  data: PriceList,
): APIFunction<PriceList> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/accounts/price-list/${id}`, data),
  );

const getPriceListById = async (id: number): APIFunction<PriceList> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/accounts/price-list/${id}`),
  );

const createFXMarkupFees = async (data: any): APIFunction<FXMarkup> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/price-list/markup-fees", data),
  );

const updateFXMarkupFees = async (data: any): APIFunction<FXMarkup> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/price-list/markup-fees/${data.id}`, data),
  );

const createTransferFees = async (data: any): APIFunction<TransferFees> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/price-list/transfer-fees", data),
  );

const updateTransferFees = async (data: any): APIFunction<TransferFees> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/price-list/transfer-fees/${data.id}`, data),
  );

const createRecurringFees = async (data: any): APIFunction<RecurringFees> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/price-list/recurring-fees", data),
  );

const updateRecurringFees = async (data: any): APIFunction<RecurringFees> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/price-list/recurring-fees/${data.id}`, data),
  );

export {
  createPriceList,
  updatePriceList,
  getPriceListById,
  createFXMarkupFees,
  updateFXMarkupFees,
  createTransferFees,
  updateTransferFees,
  createRecurringFees,
  updateRecurringFees,
};
