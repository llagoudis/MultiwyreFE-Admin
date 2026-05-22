import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { convertUrlParams } from "~/common/functions";

//Checkout Merchant

const createCheckoutMerchant = async (
  data: Merchant,
): APIFunction<Merchant[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/checkout-merchant/merchants", data),
  );

const getCheckoutMerchantsById = async (id: number): APIFunction<Merchant> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/checkout-merchant/merchants/${id}`),
  );

const deleteCheckoutMerchants = (data: any) =>
  ProtectedAxiosInstance.delete(`checkout-merchant/merchants/${data.id}`);

const updateCheckoutMerchants = async (data: Merchant): APIFunction<Merchant> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/checkout-merchant/merchants/${data.id}`, data),
  );

export {
  createCheckoutMerchant,
  getCheckoutMerchantsById,
  deleteCheckoutMerchants,
  updateCheckoutMerchants,
};
