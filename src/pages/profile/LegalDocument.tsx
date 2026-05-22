import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSingleLegalDocuments } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";

interface LegalDocuments {
  id: number;
  title: string;
  policyDocumentType: number;
  documentLink: string | null;
  documentText: string;
  version: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  PolicyDocumentType: {
    id: number;
    displayName: string;
    name: string;
  };
}

const LegalDocument = () => {
  const router = useRouter();
  //   const documentId = router.query?.id;

  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [singleDoc, setSingleDoc] = useState<LegalDocuments | null>(null);

  const getSingleDocument = async (id: number | string) => {
    try {
      const [data, error]: APIResult<LegalDocuments> = await ApiHandler(() =>
        getSingleLegalDocuments(id),
      );
      if (error) {
        toast.error("Failed to load legal document");
      }

      if (data?.success) {
        const singleValue = data.body;
        setSingleDoc(singleValue || null);

        setDocumentContent(singleValue?.documentText || null);
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching the legal document",
        error,
      );
      toast.error("An error occurred while fetching the legal document");
    }
  };
  useEffect(() => {
    const documentId = router.query?.id as string;

    if (documentId) {
      void getSingleDocument(Number(documentId));
    }
  }, [router.query?.id]);

  const renderSections = (content: string) => {
    // Split the content into sections based on HTML tags
    const sections = content.split(/<\/?h[1-6]>/g);

    return sections.map((section, index) => (
      // Adjust the condition based on the specific tags you want to handle
      <div key={index}>
        {section.startsWith("<h") ? (
          // Render headings
          <h2
            className="my-4 text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: section }}
          />
        ) : (
          // Render paragraphs
          <p dangerouslySetInnerHTML={{ __html: section }} />
        )}
      </div>
    ));
  };
  return (
    <div>
      <p className=" my-4 text-center text-2xl font-bold">
        {singleDoc?.PolicyDocumentType?.displayName}
      </p>
      <p className=" my-4 text-xl font-semibold">{singleDoc?.title}</p>
      {documentContent ? renderSections(documentContent) : <p>Loading...</p>}
    </div>
  );
};

export default LegalDocument;
