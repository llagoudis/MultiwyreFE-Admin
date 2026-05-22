import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { ApiHandler } from "../UtilService";

const createLegalAgreement = async (
  data: FormData,
): APIFunction<LegalAgreements> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/documents/legal-agreements", data),
  );

type formData = {
  title: string;
  policyDocumentType: number;
  documentLink: string;
  documentText: string;
};

const createLegalDocument = async (
  data: formData,
): APIFunction<LegalDocuments> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/documents/legal-document", data),
  );
const createDocument = async (data: FormData): APIFunction<Documents> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post("/documents/upload", data),
  );

const updateDocument = async (
  documentId: string | number,
  data: FormData,
): APIFunction<Documents> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.put(`/documents/upload/${documentId}`, data),
  );

const changeDocumentStatus = async (
  documentId: string | number,
  status: "DELETE" | "APPROVED" | "REJECTED",
) =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.post(`/documents/status/${documentId}`, { status }),
  );

export {
  createLegalAgreement,
  createLegalDocument,
  createDocument,
  updateDocument,
  changeDocumentStatus,
};
