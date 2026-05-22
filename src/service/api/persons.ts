import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";

const getUserById = async (
  id: string,
): APIFunction<{
  user: Omit<UserStore, "documents">;
  documents: Documents[];
  checkLimits: LimitsType[];
}> => await ApiHandler(() => ProtectedAxiosInstance.get(`/user/${id}`));

export { getUserById };
