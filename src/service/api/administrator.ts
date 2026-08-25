import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

const fetchAdministrators = () =>
  ProtectedAxiosInstance.get("/user/admin-users");

const fetchAdminBeneficiary = (): APIFunction<AdminBeneficiaryDetails> =>
  ApiHandler(() => ProtectedAxiosInstance.get("/admin/beneficiary-details"));

const saveAdminBeneficiary = (
  data: AdminBeneficiaryDetails,
): APIFunction<AdminBeneficiaryDetails> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.put("/admin/beneficiary-details", data),
  );

export type AdminOtcDepositAddress = {
  id?: number | null;
  assetId: string;
  address: string;
  label?: string;
};

const fetchAdminOtcDepositAddresses = (): APIFunction<
  AdminOtcDepositAddress[]
> =>
  ApiHandler(() => ProtectedAxiosInstance.get("/admin/otc-deposit-addresses"));

const saveAdminOtcDepositAddresses = (data: {
  addresses: AdminOtcDepositAddress[];
}): APIFunction<AdminOtcDepositAddress[]> =>
  ApiHandler(() =>
    ProtectedAxiosInstance.put("/admin/otc-deposit-addresses", data),
  );

const createNewAdminUser = async (
  data: AdministratorUser,
): APIFunction<AdministratorUser> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/user/add-admin-user", data),
  );

const updateAdminUser = async (
  data: AdministratorUser,
): APIFunction<AdministratorUser> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(
      `/user/update-admin-user/${data?.azureId}`,
      data,
    ),
  );

const deleteAdminUser = async (id: string): APIFunction<AdministratorUser> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/user/delete-admin-user/${id}`),
  );

export {
  createNewAdminUser,
  fetchAdministrators,
  fetchAdminBeneficiary,
  fetchAdminOtcDepositAddresses,
  saveAdminBeneficiary,
  saveAdminOtcDepositAddresses,
  updateAdminUser,
  deleteAdminUser,
};
