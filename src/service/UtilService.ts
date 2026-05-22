import toast from "react-hot-toast";
import ErrorResponse from "./ErrorResponse";
import axios from "axios";
import localStorageService from "./LocalstorageService";
import { decryptResponse } from "~/common/functions";

const ApiHandler = async <T>(
  promise: (data?: any) => Promise<{ data: APIResponse<T> }>,
  data?: any,
): Promise<[APIResponse<T> | null, any]> => {
  try {
    const response = data ? await promise(data) : await promise();
    const res = decryptResponse(response.data);

    return [res, null];
  } catch (error) {
    const message = ErrorResponse(error);
    toast.error(message);
    return [null, message];
  }
};

const getUserIp = async (): Promise<string> => {
  const userIp = localStorageService.decodeAuthBody()?.userIp;
  if (userIp && typeof userIp === "string") return userIp;

  const ipify = await axios.get("https://api.ipify.org/?format=json");
  const ipAddress = ipify.data.ip;

  if (ipAddress && typeof ipAddress === "string") {
    localStorageService.updateAuthBody({ userIp: ipAddress });
    return ipAddress;
  }

  return "";
};

export { ApiHandler, getUserIp };
