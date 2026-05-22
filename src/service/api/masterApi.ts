import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

const getAllBusinessNature = async (): APIFunction<genericMasterType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/business-nature"));

const getAllCountries = async (): APIFunction<Country> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/get-all-countries"));

const getAllIndustries = async (): APIFunction<genericMasterType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/industries"));

const getAllDocumentTypes = async (): APIFunction<genericMasterType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/document-types/all"));

const getAllPolicyDocumentTypes = async (): APIFunction<genericMasterType> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get("/documents/policy-document-types/all"),
  );
const getAllLanguages = async (): APIFunction<genericMasterType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/language"));

const getAllAccessRoles = async (): APIFunction<genericMasterType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/access-roles"));

const getAllAssets = async (): APIFunction<genericMasterType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/accounts/assets"));

const getAllPriceLists = async (): APIFunction<PriceList> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/accounts/price-list"));

const getAllLimitList = async (): APIFunction<Limits> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get("/exchange-limits/limitList"),
  );

const getAllOperationTypes = async (): APIFunction<OperationType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/operation-types"));

const getAllPaymentTypes = async (): APIFunction<OperationType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/incoming-payments"));

const getAllFrequency = async (): APIFunction<OperationType> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/payment-frequency"));

const getMonthlyRemmitance = async (): APIFunction<OperationType> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get("/lib/monthly-remittance/admin"),
  );

const getActionType = async (): APIFunction<dropdownTypes> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/actionType"));

const getPeriodTypes = async (): APIFunction<dropdownTypes> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/periodTypes"));

const getThresholdType = async (): APIFunction<dropdownTypes> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/thresholdType"));

const getTransferDirection = async (): APIFunction<dropdownTypes> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/transferDirection"));

const getVerificationLevel = async (): APIFunction<dropdownTypes> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/lib/verificationLevel"));

const getAllPaymentMethods = async (): APIFunction<genericMasterType> =>
  ApiHandler(
    async () =>
      await ProtectedAxiosInstance.get("/checkout-merchant/paymentMethods"),
  );

export {
  getAllBusinessNature,
  getAllCountries,
  getAllIndustries,
  getAllDocumentTypes,
  getAllPolicyDocumentTypes,
  getAllLanguages,
  getAllAccessRoles,
  getAllAssets,
  getAllPriceLists,
  getAllOperationTypes,
  getAllPaymentTypes,
  getAllFrequency,
  getMonthlyRemmitance,
  getActionType,
  getPeriodTypes,
  getThresholdType,
  getTransferDirection,
  getVerificationLevel,
  getAllLimitList,
  getAllPaymentMethods,
};
