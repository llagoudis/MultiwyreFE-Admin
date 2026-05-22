import { type FC } from "react";
import DocumentsTable from "~/components/documents/DocumentsTable";

interface DocumentsProps {
  userDetails: UserStore;
}

const Documents: FC<DocumentsProps> = ({ userDetails }) => {
  const documents = userDetails?.documents || [];
  const userEmail = userDetails?.email || "";
  return <DocumentsTable data={documents} userEmail={userEmail} />;
};

export default Documents;
