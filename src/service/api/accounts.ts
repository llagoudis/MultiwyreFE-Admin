import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

export const listWhitelistAddressesAdmin = (
  status?: string,
): APIFunction<WhitelistAddress[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return ApiHandler(() =>
    ProtectedAxiosInstance.get(`/accounts/whitelist/admin/all${query}`),
  );
};

export const updateWhitelistApprovalStatus = (
  id: number,
  status: "pending" | "approved" | "rejected",
): APIFunction<WhitelistAddress> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.patch(`/accounts/whitelist/${id}/status`, {
      status,
    }),
  );
