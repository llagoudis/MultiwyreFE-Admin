interface AccessRoles extends CommonKeys {
  name: string;
  displayName: string;
}

interface AdminAssets extends CommonKeys {
  adminUserId: string;
  vaultId: string;
  assetId: string;
  assetAddress: string;
  isDefault: boolean;
}

interface AdminUser extends CommonKeys {
  azureId: string;
  firstname: string;
  lastname: string;
  email: string;
  active: boolean;
  password: string;
  status: number;
  roles: number;
}

interface Assets extends CommonKeys {
  fireblockAssetId: string;
  name: string;
  icon: string;
  krakenAssetId: string;
}

interface BusinessNature extends CommonKeys {
  name: string;
}

interface CompanyEntity extends CommonKeys {
  companyProfileId: string;
  country: string;
  natureOfBusiness: string | number;
  registrationNumber: string;
  otherNatureOfBusiness: string;
  taxIdentificationNumber: string;
  incorporationDate: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  sameOperatingAddress: boolean;
  jurisdiction: string;
  operatingJurisdiction: string;
  operatingState: string;
  operatingAddressCity: string;
  operatingAddressAddressLine1: string;
  operatingAddressAddressLine2: string;
  operatingAddressPostalCode: string;
  cerificateOfFormation: string;
  companyAgreement: string;
  certificateOfDirectors: string;
  certificateOfShareholders: string;
  auditedFinancialStatement: string;
  proofOfAddress: string;
  companyStructure: string;
  sourceOfFunds: string;
  supplimentDocument: string;
  BusinessNature: BusinessNature;
}

interface CompanyPayments extends CommonKeys {
  companyProfileId: string;
  incomingPayments: string;
  outgoingPayments: string;
  frequency: string;
  monthlyRemittanceVolume: string;
  paymentFromCountry1: string;
  paymentFromCountry2: string;
  paymentFromCountry3: string;
  paymentToCountry1: string;
  paymentToCountry2: string;
  paymentToCountry3: string;
}
interface Log extends CommonKeys {
  userId: string;
  type: string;
  message: string;
  createdAt: string;
  ipAddress?: string;
  updatedAt: string;
  User: User;
  AdminUser: AdminUser;
}

interface User extends CommonKeys {
  name?: any;
  User?: any;
  azureId: string;
  userId?: string;
  firstname: string;
  lastname: string;
  countryCode: string;
  phone: string;
  email: string;
  dob: string;
  clientId: string;
  personType: string;
  nationality: string;
  gender: string;
  createdBy: string;
  language: string;
  defaultCurrency: string;
  customPriceList: string;
  active: boolean;
  status: number;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  isAddressVerified: boolean;
  isCompanyVerified: verificationStates;
  isUserVerified: verificationStates;
  roles: string;
  reasonForRejection: string;
  profileImgLink: string;
  tfaEnabled: boolean;
  priceList: number;
  verificationStatus: string;
  verificationLevel: string;
  accountNumber?: string;
  assetId?: string;
  limitList: number;
  userType?: string;
  companyProfileId: number;
}
interface AdminProfile {
  profileImgLink: string;
  companyLegalName: string;
  email: string;
  companyAddress: string;
  tabName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  id: number;
  updatedWithApi: boolean;
}

interface Security {
  IpAttempts: string;
  blockingDuration: string;
  loginAttempts: string;
  logoutMinutes: string;
  messageAfterLogout: string;
  messageBeforeLogout: string;
  passwordAttempts: string;
  timeoutPadding: string;
  id: number;
}

interface ManualTrx extends CommonKeys {
  amount: string;
  ID: string;
  sourceAddress: string;
  destinationAddress: string;
  assetId: string;
  privateKey: string;
  note: string;
  txHash: string;
  status: string;
  subStatus: string;
  AdminUser?: AdminUser;
}

interface TransactionDetails extends CommonKeys {
  userId: string;
  transactionId: string;
  assetId: string;
  operationType: string;
  sourceId: string;
  destinationId: string;
  sourceType: string;
  destinationType: string;
  sourceAddress: string;
  destinationAddress: string;
  status: string;
  subStatus: string;
  txHash: string;
  numOfConfirmations: string;
  note: string;
  operation: string;
  Asset: Assets;
  User?: Partial<User>;
  OperationType: GenericMasterType;
  TransactionFees: TransactionFees;
  UserAsset: UserAssets;
  destinationAssetId: string;
  orderType: string;
  alert: string;
  EuroTransaction: EuroTransaction;
  isSweepNotified?: boolean;
  transactiontype?: number;
  SourceAsset: User;
  DestinationUser: User;
}

interface EcomTransactionDetails extends CommonKeys {
  Merchant: any;
  OperationType: GenericMasterType;
  User: string;
  amount: string;
  assetId: string;
  createdAt: string;
  customerEmail: string;
  customerId: string;
  deletedAt: string;
  exactAmount: string;
  failedRedirectURL: string;
  fee: string;
  networkFee: string;
  fromAddress: string;
  id: string;
  merchantId: string;
  note: string;
  orderId: string;
  orderStatus: string;
  recoveryEmail: string;
  requestedAmount: string;
  requestedAssetId: string;
  status: string;
  successRedirectURL: string;
  toAddress: string;
  transactionHash: string;
  transactionId: string;
  transactiontype: any;
  updatedAt: string;
  url: string;
  valueIneur: string;
  valueInusd: string;
  debitedAmount: string;
  creditedAmount: string;
  Merchant: MerchantUsers;
  User: MerchantUser;
  fxmarkUp: string;
  widgetNumber: string;
}

interface BulkTransactions extends CommonKeys {
  userId: string;
  User: User;

  fileName: string;

  fileId: string;

  assetId: string;
  transactionId: string;

  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;

  merchantId: string;

  subStatus: string;
  status: string;
  valueIneur: string;

  note: string;

  networkFee: string;

  noOfRetry: string;
}

interface MerchantUsers extends CommonKeys {
  User: MerchantUser;
}

interface MerchantUser extends CommonKeys {
  firstname: string;
  azureId: string;
}

interface EcomTransactions extends CommonKeys {
  processingFee: any;
  fxmarkUp: any;
  clientRate: any;
  providerRate: any;
  creditedAmount: any;
  debitedAmount: any;
  targetAssetId: any;
  fee: any;
  feeType: string | undefined;
  Merchant: Merchant;
  payoutType: any;
  transactiontype: number;
  createdAt: string;
  transactionId: string;
  customerId: string;
  merchantId: string;
  fromAddress: string;
  toAddress: string;
  exactAmount: string;
  networkFee: string;
  requestedAmount: string;
  amount: string;
  requestedAssetId: string;
  assetId: string;
  firstname: string;
  lastname: string;
  customerEmail: string;
  recoveryEmail: string;
  transactionHash: string;
  operationTypeData: OperationTypeData;
  status: string;
  note: string;
  OperationType?: GenericMasterType;
  fxMarkup: number;
  widgetNumber: string;
}

interface OperationTypeData extends CommonKeys {
  displayName: string;
}

interface DocumentTypes extends CommonKeys {
  displayName: string;
  name: string;
}

interface Documents extends CommonKeys {
  type: string;
  relationId: number;
  documentType: string;
  documentLink: string;
  documentNumber: string;
  issuedBy: number;
  issuedDate: string;
  validTill: string;
  status: verificationStates;
  Country: Country | null;
  email?: string;
}

interface EuroTempatesType extends CommonKeys {
  userId: string;
  IBAN: string;
  customerName: string;
  templateName: string;
  customerAddress: string;
  customerZipcode: string;
  customerCity: string;
  customerCountry: string;
  swift: string;
  bankName: string;
  bankAddress: string;
  bankLocation: string;
  bankCountry: string;
  description: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

interface ContactDetails extends CommonKeys {
  type: "PHONE" | "EMAIL";
  userId: string;
  value: string;
  isPrimary: boolean;
  status: "REQUEST_SENT" | "ACTIVE" | "INACTIVE";
}

interface UserCompanyAssociations extends CommonKeys {
  roles: string;
  createdAt: string;
  companyProfileId: number | string;
  userId: string;
  CompanyProfile?: Partial<Company>;
  User: Partial<User> &
    Partial<{ UserAssets: UserAssets[] }> &
    Partial<{ EuroTemplates: EuroTempatesType[] }>;
  owner: Partial<User>;
  UserByAzureId: Partial<User>;
}

interface Country extends CommonKeys {
  name: string;
  currency: string;
  countryCode: number;
}

interface Company {
  id: number;
  userId: string;
  clientId: string;
  beneficialOwnerPosition: string;
  companyName: string;
  companyLegalForm: string;
  companyEmail: string;
  adminRemarks: string;
  isEmailVerified: boolean;
  phone: string;
  countryCode: string;
  profileImageUrl: string;
  companyUrl: string;
  owner: string;
  verificationStatus: verificationStates;
  accountStatus: string;
  verificationLevel: string;
  reasonForRejection: string;
  createdAt: string;
  updatedAt: string;
  User: User;
  priceList: number;
  CompanyEntityInfo: CompanyEntityInfo;
  UserCompanyAssociations: UserCompanyAssociations[];
  CompanyPaymentsInfo: CompanyPaymentsInfo;
  limitList: number;
}

interface LegalAgreements extends CommonKeys {
  type: RelationType;
  relationId: number;
  documentType: number;
  documentLink: string;
  description: string;
  addedDate: string;
  status: verificationStates;
  ipAddress: string;
  DocumentType: DocumentTypes;
}
interface LegalDocuments extends CommonKeys {
  id: string;
  title: string;
  policyDocumentType: number;
  documentLink: Url;
  PolicyDocumentType: PolicyDocumentType;
  documentText: string;
}

interface PolicyDocumentType extends CommonKeys {
  displayName: string;
  name: string;
}

interface UserVerification extends CommonKeys {
  city: string | null;
  state: string | null;
  country: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
  Country: Country;
}

interface Limits extends CommonKeys {
  transferDirection: string;
  id: number | string;
  clientVerificationLevel: string;
  clientType: "user" | "company" | "";
  personType: string;
  name: string;
  description: string;
  status: string;
  VerificationLevel?: VerificationLevel;
  Thresholds?: Threshold[];
  ExchangeLimits?: ExchangeLimits[];
}

interface ExchangeLimits extends CommonKeys {
  id: number;
  name: string;
  status: string;
  currencyId: string;
  amount: string;
  exchangeLimit: string;
  exchangeType: string;
  limitListId: number;
}

interface VerificationLevel {
  displayName?: string;
}

interface Threshold extends CommonKeys {
  id?: number | string;
  limitsId?: number | string;
  thresholdType?: string;
  transferDirection?: string;
  amount?: string;
  currency?: string;
  period?: string;
  periodCount?: string;
  affectsSingleTransaction?: boolean;
  actionTypes?: string;
}

interface LimitsType extends CommonKeys {
  transferDirection?: string;
  id?: number | string;
  clientVerificationLevel?: string;
  clientType?: "user" | "company" | "";
  personType?: string;
  name?: string;
  description?: string;
  status?: string;
  VerificationLevel?: VerificationLevel;
  Thresholds?: string;
  // Thresholds?: Thresholds;
}

interface Thresholds extends CommonKeys {
  map(
    arg0: (thresholdGroup: any, groupIndex: any) => React.JSX.Element,
  ): React.ReactNode;
  id?: number | string;
  limitsId?: number | string;
  thresholdType?: string;
  transferDirection?: string;
  amount?: string;
  currency?: string;
  period?: string;
  periodCount?: string;
  affectsSingleTransaction?: boolean;
  actionTypes?: string;
}

interface PriceList extends CommonKeys {
  name: string;
  clientType: "user" | "company" | "";
  companyType: string;
  standard: boolean;
  externalFeeEnabled: boolean;
  FxMarkupFees?: FXMarkup[];
  TransferFees?: TransferFees[];
  RecurringFees?: RecurringFees[];
}

interface IPAddress extends CommonKeys {
  IPAddress: string;
  attempts: string;
  blocked: boolean;
  timerStarted: boolean;
  attemptTimesstamp: string;
}

interface FXMarkup extends CommonKeys {
  priceListId: number | string;
  name: string;
  operationType: string;
  status: boolean;
  validFrom: string;
  validTo: string;
  fromCurrencyId: string;
  toCurrencyId: string;
  percent: number | string;
}

interface TransactionDetails extends CommonKeys {
  userId: string;
  transactionId: string;
  assetId: string;
  operationType: string;
  sourceId: string;
  destinationId: string;
  sourceType: string;
  destinationType: string;
  sourceAddress: string;
  destinationAddress: string;
  status: string;
  subStatus: string;
  txHash: string;
  numOfConfirmations: string;
  note: string;
  operation: string;
  Assets: Assets;
  User?: Partial<User>;
  OperationType: GenericMasterType;
  TransactionFee: TransactionFees;
}

interface TransactionFees extends CommonKeys {
  transactionId: string;
  amount: string;
  netAmount: string;
  networkFee: string;
  amountUSD: string;
  feeCurrency: string;
  feeValue?: string;
  feePercentage?: string;
  rate: string;
  clientRate: string;
  fxMarkUp: string;
  debitedAmount: string;
  exchangeFee: string;
  creditedAmount: string;
  type: string;

  transactionFee: string;
}

interface EuroTransaction {
  IBAN: string;
  customerName: string;
  customerAddress: string;
  customerZipcode: string;
  customerCity: string;
  customerCountry: string;
  swift: string;
  bankName: string;
  bankAddress: string;
  bankLocation: string;
  bankCountry: string;
  reference: string;
  paymentSystemType: string;
}

interface Pagination {
  currentPage: number;
  from: number;
  itemsPerPage: number;
  to: number;
  totalItems: number;
  totalPages: number;
}

interface UserAssets extends CommonKeys {
  userId: string;
  assetId: string;
  walletId: string;
  assetAddress: string;
  User: User;
  accountNumber: string;
  balance?: string | number;
  Asset: Assets;
  date?: string;
  privateKey?: string;
  publicKey?: string;
  Merchant?: Merchant;
}

interface Merchants extends CommonKeys {
  company: string;
  project: string;
  projectName?: string;
  currency: string;
  incomingAmount: string;
  outgoingAmount: string;
  incomingCount: string;
  outgoingCount: string;
}

interface AutoConversions extends CommonKeys {
  projectId?: string;
  status: string;
  targetAsset: string;
  finalAsset: string;
  Merchant: Merchants;
}

interface Wallet extends CommonKeys {
  assets: string;
  toolPool: string;
  usage: string;
  available: string;
  date: string;
}

interface AcquirerWithPayments {
  paymentMethod: number;
  acquirer: number;
}

interface Merchant extends CommonKeys {
  projectName: string;
  projectId?: number;
  webURL: string;
  company: string;
  companyId?: string;
  User?: User;
  publicKey?: string;
  privateKey?: string;
  callbackURL?: string;
  id: string;
  MerchantWallets: MerchantWallet[];
  UserAssets: UserAssets[];
  payoutType?: string;
  walletAddress?: string;
  mappings?: AcquirerWithPayments[];
}

type ProcessingMerchants = {
  project: string;
  company: string;
  url: string;
  callbackURL: string;
  privateKey?: string;
  publicKey?: string;
  walletAddress?: string;
  payoutType?: "dedicated" | "user";
};

interface MerchantWallet {
  id: number;
  assetId: string;
  balance: number;
}
interface EcommerceTransaction extends CommonKeys {
  transactionId: string;
  type: string;
  userID: string;
  userEmail: string;
  project: string;
  company: string;
  sendingAddress: string;
  receivingAddress: string;
  fiatAmount: string;
  cryptoAmount: string;
  receivedCrypto: string;
  fiatCurrency: string;
  currency: string;
}
interface ProcessingTransaction extends CommonKeys {
  createdAt: string;
  transactionId: string;
  merchantId: string;
  companyName: string;
  customerDetails: {
    name: string;
    email: string;
    dob: string;
    address: string;
  };
  payoutType: string;
  senderAddress: string;
  receiverAddress: string;
  cryptoAmount: string;
  networkFee: string;
  fiatAmount: string;
  receivedCrypto: string;
  fiatCurrency: string;
  currency: string;
  transactionType: string;
  status: string;
}

interface ProcessingDataType extends CommonKeys {
  id: number;
  feeType: string;
  clientName: string;
  account: string;
  transactionId: string;
  fxProviderId: string;
  alert: string;
  totalFees: number;
  currencyPair: string;
  debitAmount: number;
  creditAmount?: string;
  providerRate: number;
  clientRate: number;
  fxMarkupFees: number;
  networkFees: number;
  processingFee: number;
}

interface Project extends CommonKeys {
  project: string;
  BTC: string;
  ETH: string;
  USDT_ERC20: string;
  USDC_ERC20: string;
  USDT_TRC20: string;
  USDC_TRC20: string;
  USDC_Polygon: string;
  USDT_Polygon: string;
}

type CheckoutTurnover = {
  id: number;
  projectId: number;
  projectName: string;
  createdAt: string;
  User: User;
  CheckoutTransactions: {
    fiatCurrency: string;
    fiatAmount: number;
    receiverCurrency: string;
    receiverAmount: number;
    networkFee: string;
    processingFee: string;
    fxmarkUp: string;
    fiatAmountAfterFees: number;
  }[];

  USD: string;
  EUR: string;

  networkFeeEUR: string;
  processingFeeEUR: string;
  fxmarkUpEUR: string;
  networkFeeUSD: string;
  processingFeeUSD: string;
  fxmarkUpUSD: string;
  ETH: string;
  BTC: string;
  USDC_ERC20: string;
  USDT_ERC20: string;
  USDC_BSC: string;
  USDT_BSC: string;
  USDC_POLYGON: string;
  USDT_POLYGON: string;
  USDC_TRC20: string;
  USDT_TRC20: string;
};

interface FirebockAssets {
  balance: balance;
  id: number;
  adminUserId: string;
  vaultId: string;
  asset: any;
  assetAddress: string;
  privateKey: string;
  publicKey: string;
  mnemonic: string | null;
  createdAt: string;
  color?: string;
  bgcolor?: string;
  eurBalance?: number;
  assetId?: string;
}

interface MASTER_GAS_COMMISSION {
  masterWalletBalance: FirebockAssets[];
  gasWalletsBalance: FirebockAssets[];
  commissionWalletsBalance: FirebockAssets[];
  liquidityWalletBalance: FirebockAssets[];
}

interface FireblocksBalance {
  autoFuel: boolean;
  hiddenOnUI: boolean;
  id: string;
  name: string;
  assets: FirebockAssets[];
}

interface krakenBalance {
  id: string;
  balance: string;
  image: string;
  color: string;
  bgcolor: string;
  euroBalance: number;
}

interface DailyBalance {
  fullName: string;
  accountNumber: string;
  assetId: string;
  balance: string | number;
  createdAt: string;
}

interface Account extends CommonKeys {
  id: number;
  userId: string;
  walletId: string;
  assetId: string;
  assetAddress: string;
  balance: string;
  accountNumber: string;
  provider: number;
  clientType: string;
  feeActivatedAt: string;
  automaticFeeActivation: string;
  User: Partial<User>;
  TransactionDetails: TransactionDetails[];
  EcomTransactions?: EcomTransactions[];
  Asset: Assets;
}

interface WhitelistAddress extends CommonKeys {
  userId: string;
  assetAddress: string;
  assetId: string;
  label: string;
  description: string;
  externalWalletId: string;
  status: boolean;
  Assets: Assets;
  User: Partial<User>;
}

interface TransferFees extends CommonKeys {
  priceListId: number;
  name: string;
  status: string;
  validFrom: string;
  validTo: string;
  currencyId: string;
  percent: number;
  fixedFee: number;
  minimumFee: number | null;
  maximumFee: number | null;
  transferGroup: string;
  beneficiaryGroup: string;
  paymentMethod: string;
  OperationType?: OperationType;
  operationType?: number;
}

interface RecurringFees extends CommonKeys {
  priceListId: number;
  name: string;
  status: string;
  validFrom: string;
  validTo: string;
  currencyId: string;
  percentage: number;
  fixedFee: number;
  OperationType?: OperationType;
  operationType?: number;
  period: string;
  priceListId?: number;
}

interface OperationType extends CommonKeys {
  name: string;
  displayName: string;
}

interface TransactionReport {
  ID: string | number;
  [key: string]: any;
}

interface CheckoutTransaction extends CommonKeys {
  merchantId: number;
  transactionId: string;
  country: string;
  currency: string;
  fiatCurrency: string;
  fiatAmount: number;
  fiatPaidAmount: number;
  receiverCurrency: string;
  receiverAmount: number;
  receiverAddress: string;
  paymentMethod: string;
  email: string;
  otpVerified: boolean;
  firstName: string;
  lastName: string;
  dob: string;
  customerCountry: string;
  customerAddress: string;
  customerCity: string;
  customerZipcode: string;
  networkFee: number;
  fxmarkUp: number;
  processingFee: number;
  cardNumber: string;
  cardCVV: string;
  cardExpiryDate: string;
  fiatPaymentStatus: string;
  cryptoPaymentStatus: string;
  subStatus: string;
  screen: string;
  fiatAmountAfterFees: number;
  Checkoutmerchant: {
    walletAddress: string;
    payoutType: string;
    User: User;
  };

  PayoutTransaction: {
    txHash: string;
  };
}

interface Acquirer extends CommonKeys {
  id: number;
  acquirer: string;
  paymentIds: number[];
  status: boolean;
}
