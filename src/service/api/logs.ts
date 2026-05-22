import ProtectedAxiosInstance from "../ProtectedAxiosInstance";

export const fetchUsers = () => ProtectedAxiosInstance.get("/log/all");
