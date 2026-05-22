import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import EncryptedStorage from "../utils/EncryptedStorage";
import initGlobalStore from "./helper/InitStore";
import { getUserById } from "~/service/api/persons";
import { getPriceListById } from "~/service/api/pricelists";
import { getAdminProfile } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { getTransactionById } from "~/service/api/transaction";
import { getLimitListById } from "~/service/api/exchangeLimits";

export const useGlobalStore = create(
  persist<globalStoreType & globalStoreFn>(
    (set, get) => ({
      ...initGlobalStore,
      async getPriceList(id: number) {
        const currentPriceList = get().pricelist.id;

        const [res, err] = await getPriceListById(id);

        if (res?.success) {
          set({ pricelist: res.body });
        }

        if (err) {
          toast.error("Failed to fetch price list details");
        }
      },

      async getLimitList(id: number) {
        // const currentPriceList = get().limitList.id;

        const [res, err] = await getLimitListById(id);

        if (res?.success) {
          set({ limitList: res.body });
        }

        if (err) {
          toast.error("Failed to fetch limit list ");
        }
      },

      getPerson: async (id: string) => {
        const [res] = await getUserById(id);
        if (res?.body) {
          set({
            persons: {
              ...res?.body?.user,
              documents: res?.body?.documents,
              checkLimits: res?.body.checkLimits,
            },
          });
        }
      },
      async syncAdminProfile() {
        const [res, error] = await getAdminProfile();
        if (res?.success) {
          const response = res?.body[0];
          if (response) set({ admin: { ...response, updatedWithApi: true } });
        }
      },
      // getTransaction: async (id: string) => {
      //   const [res] = await getTransactionById(id);
      //   if (res?.body) {
      //     if (res?.success) {
      //       set({ transaction: res.body });
      //     }
      //   }
      // },
    }),
    {
      name: "exchange-auth",
      storage: createJSONStorage(() => new EncryptedStorage(localStorage)),
      partialize: (state) => ({
        ...state,
        ...initGlobalStore,
        auth: state.auth,
        admin: state.admin,
      }),
    },
  ),
);
