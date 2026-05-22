interface CompanyDetailsType {
  company: Company;
  relatedDocuments: Documents[];
  legalAgreements: LegalAgreements[];
}

interface defaultCompanyProps {
  data: CompanyDetailsType;
}

interface StaffFormType {
  companyProfileId: number | string;
  userId: string;
  roles: string;
}

interface DropDownOptionsType {
  value: any;
  label: string;
  flag: StaticImageData;
}

interface DropDownOptionsResponseType {
  id: string;
  name: string;
  currency?: string;
  from?: string;
  to?: string;
  label?: string;
  countryCode?: any;
}

interface CompanyFormType extends KeyString {
  countryCode: number;
  companyName: string;
  companyEmail: string;
  owner?: string;
  userId: string;
  phone: string;
  companyUrl: string;
  companyType: string;
  beneficialOwnerType: string;
  beneficialOwnerPosition: string;
  clientId: string;
  registrationNumber: string;
  incorporationDate: string;
  natureOfBusiness: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  otherNatureOfBusiness: string;
  taxIdentificationNumber: string;
  sameOperatingAddress: boolean;
  operatingJurisdiction: string;
  operatingState: string;
  operatingAddressCity: string;
  operatingAddressAddressLine1: string;
  operatingAddressAddressLine2: string;
  operatingAddressPostalCode: string;
  reasonForRejection: string;
  verificationStatus: string;
  verificationLevel: number;
  password: string;
  limitList: number;
  confirmedPassword: string;
  file: File | Blob | null;
}

interface CompanyStaff {
  id: number | string;
  companyProfileId: number | string;
  userId: string;
  roles: string;
  CompanyProfile: Partial<Company>;
  User: Partial<User>;
  owner: Partial<User>;
  UserByAzureId: Partial<User>;
}
