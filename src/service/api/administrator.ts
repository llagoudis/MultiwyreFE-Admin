import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

const fetchAdministrators = () =>
  ProtectedAxiosInstance.get("/user/admin-users");

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
  updateAdminUser,
  deleteAdminUser,
};
