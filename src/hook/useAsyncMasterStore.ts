import { useEffect, useState } from "react";
import { useMasterStore } from "~/store";
import {
  getAllCountries,
  getAllIndustries,
  getAllDocumentTypes,
  getAllLanguages,
  getAllAccessRoles,
  getAllBusinessNature,
  getAllAssets,
  getAllPriceLists,
  getAllOperationTypes,
  getAllPaymentTypes,
  getAllFrequency,
  getMonthlyRemmitance,
  getAllPolicyDocumentTypes,
  getActionType,
  getPeriodTypes,
  getThresholdType,
  getTransferDirection,
  getVerificationLevel,
  getAllLimitList,
  getAllPaymentMethods,
} from "~/service/api/masterApi";

const apiFunctions: masterApiStore = {
  countries: getAllCountries,
  industries: getAllIndustries,
  documentTypes: getAllDocumentTypes,
  policyDocumentsTypes: getAllPolicyDocumentTypes,
  languages: getAllLanguages,
  accessRoles: getAllAccessRoles,
  businessNature: getAllBusinessNature,
  assets: getAllAssets,
  priceList: getAllPriceLists,
  limitList: getAllLimitList,
  operationType: getAllOperationTypes,
  paymentTypes: getAllPaymentTypes,
  frequency: getAllFrequency,
  monthlyRemmitance: getMonthlyRemmitance,
  actionTypes: getActionType,
  periodTypes: getPeriodTypes,
  thresholdTypes: getThresholdType,
  transferDirection: getTransferDirection,
  verificationLevel: getVerificationLevel,
  paymentMethods: getAllPaymentMethods,
};

const useAsyncMasterStore = (key: keyof masterStoreType): [any[], boolean] => {
  const state = useMasterStore((state) => state[key]) || {
    data: [],
    updatedWithApi: false,
  };
  const [isLoading, setLoading] = useState(!state.updatedWithApi);

  useEffect(() => {
    if (!state.updatedWithApi) {
      void (async () => {
        const [res] = await apiFunctions[key]();

        if (res?.body) {
          const data: genericMasterType[] = res.body;

          switch (key) {
            case "countries":
              data.sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                  return -1;
                }
                if (nameA > nameB) {
                  return 1;
                }
                return 0;
              });
              break;
            case "businessNature":
              data.sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                  return -1;
                }
                if (nameA > nameB) {
                  return 1;
                }
                return 0;
              });
              break;
            default:
          }
          useMasterStore.setState((prevState) => ({
            ...prevState,
            [key]: {
              data,
              updatedWithApi: true,
            },
          }));
        }
        setLoading(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [state.data || [], isLoading];
};
export { useAsyncMasterStore };
