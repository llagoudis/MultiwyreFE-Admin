interface genericMasterType {
  id: number;
  name: string;
}
interface dropdownTypes {
  id: number;
  displayName: string;
  name: string;
}

interface masterStoreKey<T> {
  data: Array<T>;
  updatedWithApi: boolean;
}

interface masterStoreType {
  countries: masterStoreKey<Country>;
  industries: masterStoreKey<genericMasterType>;
  documentTypes: masterStoreKey<genericMasterType>;
  policyDocumentsTypes: masterStoreKey<genericMasterType>;
  languages: masterStoreKey<genericMasterType>;
  accessRoles: masterStoreKey<genericMasterType>;
  businessNature: masterStoreKey<genericMasterType>;
  assets: masterStoreKey<genericMasterType>;
  priceList: masterStoreKey<PriceList>;
  limitList: masterStoreKey<Limits>;
  operationType: masterStoreKey<OperationType>;
  paymentTypes: masterStoreKey<paymentTypes>;
  frequency: masterStoreKey<frequency>;
  monthlyRemmitance: masterStoreKey<monthlyRemmitance>;
  actionTypes: masterStoreKey<dropdownTypes>;
  periodTypes: masterStoreKey<dropdownTypes>;
  thresholdTypes: masterStoreKey<dropdownTypes>;
  transferDirection: masterStoreKey<dropdownTypes>;
  verificationLevel: masterStoreKey<dropdownTypes>;
  paymentMethods: masterStoreKey<genericMasterType>;
}

interface MasterStoreFn {
  updateLimitList: (limitList: Limits, existing?: boolean) => void;
  updatePriceList: (priceList: PriceList, existing?: boolean) => void;
}

interface masterApiStore {
  countries: () => APIFunction<Country>;
  industries: () => APIFunction<genericMasterType>;
  documentTypes: () => APIFunction<genericMasterType>;
  policyDocumentsTypes: () => APIFunction<genericMasterType>;
  languages: () => APIFunction<genericMasterType>;
  accessRoles: () => APIFunction<genericMasterType>;
  businessNature: () => APIFunction<genericMasterType>;
  assets: () => APIFunction<genericMasterType>;
  priceList: () => APIFunction<PriceList>;
  operationType: () => APIFunction<OperationType>;
  paymentTypes: () => APIFunction<paymentTypes>;
  frequency: () => APIFunction<frequency>;
  monthlyRemmitance: () => APIFunction<monthlyRemmitance>;
  actionTypes: () => APIFunction<dropdownTypes>;
  periodTypes: () => APIFunction<dropdownTypes>;
  thresholdTypes: () => APIFunction<dropdownTypes>;
  transferDirection: () => APIFunction<dropdownTypes>;
  verificationLevel: () => APIFunction<dropdownTypes>;
  limitList: () => APIFunction<Limits>;
  paymentMethods: () => APIFunction<genericMasterType>;
}
