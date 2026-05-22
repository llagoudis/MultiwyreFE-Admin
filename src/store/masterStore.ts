import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import EncryptedStorage from "../utils/EncryptedStorage";

const masterStoreInit: masterStoreType = {
  countries: {
    data: [],
    updatedWithApi: false,
  },
  industries: {
    data: [],
    updatedWithApi: false,
  },
  documentTypes: {
    data: [],
    updatedWithApi: false,
  },
  policyDocumentsTypes: {
    data: [],
    updatedWithApi: false,
  },
  languages: {
    data: [],
    updatedWithApi: false,
  },
  accessRoles: {
    data: [],
    updatedWithApi: false,
  },
  businessNature: {
    data: [],
    updatedWithApi: false,
  },
  assets: {
    data: [],
    updatedWithApi: false,
  },
  priceList: {
    data: [],
    updatedWithApi: false,
  },
  limitList: {
    data: [],
    updatedWithApi: false,
  },
  operationType: {
    data: [],
    updatedWithApi: false,
  },
  paymentTypes: {
    data: [],
    updatedWithApi: false,
  },
  frequency: {
    data: [],
    updatedWithApi: false,
  },
  monthlyRemmitance: {
    updatedWithApi: false,
    data: [],
  },
  actionTypes: {
    data: [],
    updatedWithApi: false,
  },
  periodTypes: {
    data: [],
    updatedWithApi: false,
  },
  thresholdTypes: {
    data: [],
    updatedWithApi: false,
  },
  transferDirection: {
    data: [],
    updatedWithApi: false,
  },
  verificationLevel: {
    data: [],
    updatedWithApi: false,
  },
  paymentMethods: {
    data: [],
    updatedWithApi: false,
  },
};

export const useMasterStore = create(
  persist<masterStoreType & MasterStoreFn>(
    (set, get) => ({
      ...masterStoreInit,
      updatePriceList: (priceList, existing) => {
        const state = get().priceList;
        const data = [...state.data];

        if (existing) {
          const idx = state.data.findIndex((item) => item.id === priceList.id);
          if (typeof idx === "number") {
            data[idx] = priceList;
          }
        } else {
          data.unshift(priceList);
        }
        set({
          priceList: { ...state, data: [...data] },
        });
      },

      updateLimitList: (limitList, existing) => {
        const state = get().limitList;
        const data = [...state.data];

        if (existing) {
          const idx = state.data.findIndex((item) => item.id === limitList.id);
          if (typeof idx === "number") {
            data[idx] = limitList;
          }
        } else {
          data.unshift(limitList);
        }
        set({
          limitList: { ...state, data: [...data] },
        });
      },
    }),
    {
      name: "master-data",
      storage: createJSONStorage(() => new EncryptedStorage(sessionStorage)),
    },
  ),
);
