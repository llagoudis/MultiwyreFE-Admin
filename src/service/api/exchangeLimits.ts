import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";

const getAllExchangeLimits = async () =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/exchange-limits"));

const getAllExchangeLimitById = async (data: any) =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/exchange-limits/${data.id}`),
  );

const updateLimitList = async (
  id: string | number,
  data: Limits,
): APIFunction<Limits> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/exchange-limits/limitList/${id}`, data),
  );

const createLimitList = async (data: Limits): APIFunction<Limits> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/exchange-limits/limitList", data),
  );

const getLimitListById = async (id: number): APIFunction<Limits> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/exchange-limits/limitList/${id}`),
  );

const createExchangeLimit = async (data: any): APIFunction<ExchangeLimits> =>
  await ApiHandler(() => ProtectedAxiosInstance.post("/exchange-limits", data));

const updateExchangeLimit = async (data: any): APIFunction<ExchangeLimits> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/exchange-limits/${data.id}`, data),
  );

const deleteExchangeLimit = async (data: any) =>
  ProtectedAxiosInstance.delete(`/exchange-limits/${data.id}`);

export const deleteTransferfees = (data: any) =>
  ProtectedAxiosInstance.delete(`price-list/transfer-fees/${data.id}`);

const deleteLimitList = async (data: any) =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.delete(`/exchange-limits/limitList/${data}`),
  );

export {
  createExchangeLimit,
  getAllExchangeLimits,
  getAllExchangeLimitById,
  deleteLimitList,
  updateExchangeLimit,
  deleteExchangeLimit,
  updateLimitList,
  createLimitList,
  getLimitListById,
};
