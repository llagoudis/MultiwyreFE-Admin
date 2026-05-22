import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

const getAllUsers = async (): APIFunction<User[]> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/user/all"));

const getUsers = async (
  type?: "identity",
): APIFunction<IdentityRequestType[]> => {
  const queryParams = new URLSearchParams();
  if (type) {
    queryParams.append("type", type);
  }

  return await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/user?${queryParams.toString()}`),
  );
};

const addUser = (data: any) =>
  ApiHandler(() => ProtectedAxiosInstance.post(`/user/addUser`, data));

const updateUser = async (data: any) =>
  ApiHandler(() => ProtectedAxiosInstance.put(`/user/${data.azureId}`, data));

const deleteUser = (userId: string) =>
  ApiHandler(() => ProtectedAxiosInstance.delete(`/user/${userId}`));

const changeUserVerification = (
  userId: string,
  status: "APPROVED" | "REJECTED",
) =>
  ApiHandler(() => ProtectedAxiosInstance.put(`/verify/${userId}`, { status }));

const addUserAccount = (data: any) =>
  ApiHandler(() => ProtectedAxiosInstance.post(`/user/addUserAccount`, data));

const getAllUserAssets = async (): APIFunction<User[]> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/accounts/assets/users"));

export {
  getAllUsers,
  updateUser,
  addUser,
  getUsers,
  deleteUser,
  changeUserVerification,
  addUserAccount,
  getAllUserAssets,
};
