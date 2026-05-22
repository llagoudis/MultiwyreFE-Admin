type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

interface AuthBody {
  azureId: string;
  fullname: string;
  firstname?: string;
  lastname?: string;
  countryCode: string | null;
  phone: string;
  email: string | null;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  isAddressVerified: boolean;
  isCompanyVerified: verificationStates;
  isUserVerified: verificationStates;
  status: number;
  roles: string;
  reasonForRejection: string | null;
  token: string;
  tfaEnabled: boolean;
  priceList: number;
  limitList: number;
  roleId: number;
}

interface UserStore extends User {
  UserCompanyAssociations: UserCompanyAssociations[];
  LegalAgreements: LegalAgreements[];
  LegalDocuments: LegalDocuments[];
  UserVerification: UserVerification;
  ContactDetails: ContactDetails[];
  documents: Documents[];
  checkLimits: any;
  Thresholds: any;
  UserAssets: UserAssets[];
  AdminUser?: AdministratorUsersType;
  EuroTemplates: EuroTempatesType[];
}

interface AdministratorUsersType {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  active: boolean;
  accessRoles: AccessRoles;
  azureId?: string;
}

interface globalStoreType {
  auth: AuthBody;
  company: CompanyDetailsType;
  persons: UserStore;
  limitList: Limits;
  pricelist: PriceList;
  administrator: AdministratorUsersType;
  admin: AdminProfile;
  // transaction: TransactionDetails;
}

interface globalStoreFn {
  getPriceList: (id: number) => Promise<void>;
  getPerson: (id: string) => Promise<void>;
  getLimitList: (id: number) => Promise<void>;
  // getTransaction: (id: string) => Promise<void>;
  syncAdminProfile: () => void; //comment
}
