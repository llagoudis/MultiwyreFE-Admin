interface createLegalAgreementProps extends KeyString {
  type: RelationType;
  relationId: string;
  documentType: string | number;
  description: string;
  addedDate: string;
  counterPartyName: string;
  industry: string | number;
  file: Blob | string;
}

interface documentFormType extends KeyString {
  type: RelationType;
  relationId: string;
  documentNumber: string;
  documentType: number | string;
  issuedBy: number | string;
  issuedDate: string;
  validTill: string;
  status: verificationStates;
  file: Blob | string;
}

// interface requestNewType extends KeyString {
//   type: RelationType;
//   relationId: string;
//   documentNumber: string;
//   documentType: number | string;
//   issuedBy: number | string;
//   issuedDate: string;
//   validTill: string;
//   status: verificationStates;
//   file: Blob | string;
// }
