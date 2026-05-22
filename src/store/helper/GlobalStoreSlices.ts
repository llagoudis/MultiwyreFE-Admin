import { useGlobalStore } from "../GlobalStore";

const useAuthStore = <S>(getterFn?: (state: AuthBody) => S): S | AuthBody =>
  useGlobalStore((state) => (getterFn ? getterFn(state.auth) : state.auth));

useAuthStore.setState = (
  setter?: ((state: AuthBody) => AuthBody) | AuthBody,
) => {
  useGlobalStore.setState((prevState) => ({
    ...prevState,
    auth: typeof setter === "function" ? setter(prevState.auth) : setter,
  }));
};
useAuthStore.getState = () => useGlobalStore.getState().auth;

const useCompanyStore = <S>(
  getterFn?: (state: CompanyDetailsType) => S,
): S | CompanyDetailsType =>
  useGlobalStore((state) =>
    getterFn ? getterFn(state.company) : state.company,
  );

useCompanyStore.setState = (
  setter:
    | ((state: CompanyDetailsType) => CompanyDetailsType)
    | CompanyDetailsType,
) => {
  useGlobalStore.setState((prevState) => ({
    ...prevState,
    company: typeof setter === "function" ? setter(prevState.company) : setter,
  }));
};
useCompanyStore.getState = () => useGlobalStore.getState().company;

const usePersonsStore = <S>(
  getterFn?: (state: UserStore) => S,
): S | UserStore =>
  useGlobalStore((state) =>
    getterFn ? getterFn(state.persons) : state.persons,
  );

usePersonsStore.setState = (
  setter: ((state: UserStore) => UserStore) | UserStore,
) => {
  useGlobalStore.setState((prevState) => ({
    ...prevState,
    persons: typeof setter === "function" ? setter(prevState.persons) : setter,
  }));
};

usePersonsStore.getState = () => useGlobalStore.getState().persons;

const usePriceStore = <S>(getterFn?: (state: PriceList) => S): S | PriceList =>
  useGlobalStore((state) =>
    getterFn ? getterFn(state.pricelist) : state.pricelist,
  );

usePriceStore.setState = (
  setter: ((state: PriceList) => PriceList) | PriceList,
) => {
  useGlobalStore.setState((prevState) => ({
    ...prevState,
    pricelist:
      typeof setter === "function" ? setter(prevState.pricelist) : setter,
  }));
};
usePriceStore.getState = () => useGlobalStore.getState().pricelist;

// limit list store
const useLimitStore = <S>(getterFn?: (state: Limits) => S): S | Limits =>
  useGlobalStore((state) =>
    getterFn ? getterFn(state.limitList) : state.limitList,
  );

useLimitStore.setState = (setter: ((state: Limits) => Limits) | Limits) => {
  useGlobalStore.setState((prevState) => ({
    ...prevState,
    limitList:
      typeof setter === "function" ? setter(prevState.limitList) : setter,
  }));
};
useLimitStore.getState = () => useGlobalStore.getState().limitList;

// const useTransactionStore = <S>(
//   getterFn?: (state: TransactionDetails) => S,
// ): S | TransactionDetails =>
//   useGlobalStore((state) =>
//     getterFn ? getterFn(state.transaction) : state.transaction,
//   );

// useTransactionStore.setState = (
//   setter:
//     | ((state: TransactionDetails) => TransactionDetails)
//     | TransactionDetails,
// ) => {
//   useGlobalStore.setState((prevState) => ({
//     ...prevState,
//     transaction:
//       typeof setter === "function" ? setter(prevState.transaction) : setter,
//   }));
// };
// useTransactionStore.getState = () => useGlobalStore.getState().transaction;

const useAdministratorStore = <S>(
  getterFn?: (state: AdministratorUsersType) => S,
): S | AdministratorUsersType =>
  useGlobalStore((state) =>
    getterFn ? getterFn(state.administrator) : state.administrator,
  );

useAdministratorStore.setState = (
  setter:
    | ((state: AdministratorUsersType) => AdministratorUsersType)
    | AdministratorUsersType,
) => {
  useGlobalStore.setState((prevState) => ({
    ...prevState,
    administrator:
      typeof setter === "function" ? setter(prevState.administrator) : setter,
  }));
};
useAdministratorStore.getState = () => useGlobalStore.getState().administrator;

export {
  useAuthStore,
  useCompanyStore,
  usePersonsStore,
  usePriceStore,
  useAdministratorStore,
  useLimitStore,
  // useTransactionStore,
};
