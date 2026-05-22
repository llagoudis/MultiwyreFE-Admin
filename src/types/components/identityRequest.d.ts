interface IdentityViewType {
  "Details and documents": {
    ID: string | number;
    Clients: string | undefined;
    State: string | undefined;
    Type: string;
    "Created at": string;
  };
  Parameters: {
    "Required document": string;
  };
  "Additional Information": {
    Reference: string;
    Identification: string;
    Request: string;
    State: string;
    "Referenced by": string;
  };
}

interface IdentityRequestType {
  id: string | number;
  azureId: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  status: number;
  companyProfileId?: number;
  createdAt: string;
  userId?: string;
  isUserVerified: verificationStates;
  Documents: Documents[];
  companyName: string;
  verificationStatus: verificationStates;
  userType?: string;
}
