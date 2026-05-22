import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import toast from "react-hot-toast";
import { ApiHandler } from "../UtilService";
import { useCompanyStore } from "~/store";
import { convertUrlParams } from "~/common/functions";

const getAllCompanies = async (
  minimal?: boolean,
): APIFunction<Omit<Company, "UserCompanyAssociations">[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/company/all?minimal=${!!minimal}`),
  );

export const fetchPaginateCompanies = (params: FilterType) =>
  ProtectedAxiosInstance.get(`/company/paginated?${convertUrlParams(params)}`);

export const listIdentificationRequest = (params: FilterType) =>
  ProtectedAxiosInstance.get(
    `/user/identification?${convertUrlParams(params)}`,
  );

const getCompanyById = async (companyId: string | number) => {
  if (companyId) {
    const [res, err]: APIResult<CompanyDetailsType> = await ApiHandler(
      async () => await ProtectedAxiosInstance.get(`/company/${companyId}`),
    );

    if (res?.success) {
      useCompanyStore.setState(res?.body);
    }

    if (err) {
      toast.error("Failed to fetch company info");
    }
  } else {
    toast.error("Failed to fetch company info");
  }
};

const addCompanyStaff = async (data: {
  companyProfileId: number | string;
  userId: string;
  roles: string;
}): APIFunction<UserCompanyAssociations> =>
  await ApiHandler(() => ProtectedAxiosInstance.post("/company/staff", data));

const updateCompanyStaff = async (data: {
  id: string;
  companyProfileId: number | string;
  userId: string;
  roles: string;
}): APIFunction<UserCompanyAssociations> =>
  await ApiHandler(() => ProtectedAxiosInstance.put("/company/staff", data));

const getStaffById = async (
  associationId: string | number,
): APIFunction<UserCompanyAssociations> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get(`/company/staff/${associationId}`),
  );

const deleteCompanyStaff = async (
  associationId: string | number,
): APIFunction<void> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.delete(`/company/staff/${associationId}`),
  );

const deleteCompany = async (companyId: string | number): APIFunction<void> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.delete(`/company/${companyId}`),
  );

const createCompany = async (data: FormData) =>
  await ApiHandler(() => ProtectedAxiosInstance.post(`/company`, data));

const updateCompany = async (
  companyId: string | number,
  data: FormData,
): APIFunction<Omit<Company, "UserCompanyAssociations">> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/company/${companyId}`, data),
  );

export const listCompanyStaff = (params: FilterType) =>
  ProtectedAxiosInstance.get(`/company/staff?${convertUrlParams(params)}`);

export const fetchPaginatedAccounts = (params: FilterType) =>
  ProtectedAxiosInstance.get(`/accounts/paginated?${convertUrlParams(params)}`);

const changeCompanyVerification = async (
  id: string,
  status: "APPROVED" | "REJECTED",
): APIFunction<unknown> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/company/action/${id}`, { status }),
  );

export {
  getAllCompanies,
  getCompanyById,
  addCompanyStaff,
  createCompany,
  updateCompany,
  updateCompanyStaff,
  getStaffById,
  deleteCompanyStaff,
  changeCompanyVerification,
  deleteCompany,
};
