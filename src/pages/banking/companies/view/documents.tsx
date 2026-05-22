import { type FC } from "react";
import DocumentsTable from "~/components/documents/DocumentsTable";

interface DocumentsProps {
  data: CompanyDetailsType;
}

const Documents: FC<DocumentsProps> = ({ data }) => {
  const companyMail = data?.company?.companyEmail || "";
  const documents = data?.relatedDocuments || [];

  return <DocumentsTable data={documents} companyMail={companyMail} />;
};

export default Documents;
