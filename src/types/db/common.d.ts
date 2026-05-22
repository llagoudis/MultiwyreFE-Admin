type verificationStates =
  | "APPROVED"
  | "SUBMITTED"
  | "PENDING"
  | "REJECTED"
  | "NOT APPROVED";
type RelationType = "company" | "user";

interface CommonKeys {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
}

interface GenericMasterType {
  id: number;
  name: string;
  displayName?: string;
}

interface FilterType {
  pageSize?: number;
  pageNumber?: number;
  operation?: string;
  [key: string]: string | number | null | undefined | boolean;
}

interface DatagridPage {
  pageSize: number;
  page: number;
}
