import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { convertUrlParams } from "~/common/functions";

const createMerchant = async (data: Merchant): APIFunction<Merchant[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/ecommerce/merchants", data),
  );

const createAutoconversion = async (
  data: AutoConversions,
): APIFunction<AutoConversions[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/ecommerce/autoConversion", data),
  );

const updateAutoConversion = async (
  data: AutoConversions,
): APIFunction<AutoConversions> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/ecommerce/autoConversion/${data.id}`, data),
  );

const getMerchantsById = async (id: number): APIFunction<Merchant> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/ecommerce/merchants/${id}`),
  );

const fetchAutoConversions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `/ecommerce/autoConversion?${convertUrlParams(params)}`,
  );
};

const searchableCompanies = async (query: string): Promise<User[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/ecommerce/companies`, {
      params: { query },
    }),
  );

const searchableProjects = async (query: string): Promise<Merchant[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/ecommerce/projects`, {
      params: { query },
    }),
  );

const updateMerchants = async (data: Merchant): APIFunction<Merchant> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/ecommerce/merchants/${data.id}`, data),
  );

const deleteMerchants = (data: any) =>
  ProtectedAxiosInstance.delete(`ecommerce/merchants/${data.id}`);

const deleteAutoconversion = (data: any) =>
  ProtectedAxiosInstance.delete(`ecommerce/autoConversion/${data.id}`);

export {
  getMerchantsById,
  updateMerchants,
  createMerchant,
  searchableProjects,
  createAutoconversion,
  fetchAutoConversions,
  updateAutoConversion,
  deleteMerchants,
  searchableCompanies,
  deleteAutoconversion,
};
