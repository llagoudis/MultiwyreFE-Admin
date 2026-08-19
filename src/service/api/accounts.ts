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

export const updateUserAssetAccountStatus = (
  id: number | string,
  status: "PENDING" | "APPROVED" | "REJECTED",
): APIFunction<UserAssets> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.patch(`/accounts/assets/${id}/status`, { status }),
  );

export const deleteUserAsset = (id: number | string): APIFunction<{ id: number }> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.delete(`/accounts/assets/${id}`, { data: {} }),
  );
