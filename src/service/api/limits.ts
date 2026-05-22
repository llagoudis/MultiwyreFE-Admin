import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";

const createLimits = async (data: Limits): APIFunction<Limits> =>
  await ApiHandler(() => ProtectedAxiosInstance.post("/limits/limits", data));

const updateLimits = async (
  id: string | number,
  data: Limits,
): APIFunction<Limits> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/limits/limits/${id}`, data),
  );

const getLimitsById = async (id: number): APIFunction<Limits> =>
  await ApiHandler(() => ProtectedAxiosInstance.get(`/limits/limits/${id}`));

export const deleteLimitsById = (data: any) =>
  ProtectedAxiosInstance.delete(`limits/limits/${data.id}`);

// Threshold

const createThreshold = async (data: any): APIFunction<Threshold> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/limits/threshold", data),
  );

const updateThreshold = async (data: any): APIFunction<Threshold> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/limits/threshold/${data.id}`, data),
  );

const deleteThreshold = (data: any) =>
  ProtectedAxiosInstance.delete(`limits/threshold/${data.id}`);

export {
  createLimits,
  updateLimits,
  getLimitsById,
  createThreshold,
  updateThreshold,
  deleteThreshold,
};
