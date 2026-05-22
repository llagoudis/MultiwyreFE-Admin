import React, { useEffect, useState } from "react";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import { useForm } from "react-hook-form";
import SelectComponent from "~/components/common/SelectComponent";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { Box } from "@mui/material";
import MuiButton from "~/components/common/Button";
import { Editor } from "@tinymce/tinymce-react";
import { createLegalDocument } from "~/service/api/documents";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { ApiHandler } from "~/service/UtilService";
import Header from "~/components/common/Header";
import {
  getLegalDocuments,
  getSingleLegalDocuments,
  updateLegalDocument,
  getPolicyDocumentTypes,
} from "~/service/ApiRequests";

type formData = {
  title: string;
  policyDocumentType: number;
  documentLink: string;
  documentText: string;
};
type DocumentType = {
  id: number;
  displayName: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const LegalDoc = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<formData>();

  const [activeField, setActiveField] = useState("field2");
  const [policyDocumentsTypes] = useAsyncMasterStore("policyDocumentsTypes");
  const [loading, setLoading] = useState<boolean>(false);
  const [editorContent, setEditorContent] = useState<string>("");
  const [policyLegalDocuments, setPolicyLegalDocuments] = useState<
    DocumentType[]
  >([]);

  const router = useRouter();
  const documentId = router.query?.id;

  const handleButtonClick = (field: string) => {
    setActiveField(field);
  };

  const getUsers = async () => {
    setLoading(true);
    const [data, error]: APIResult<DocumentType[]> = await ApiHandler(
      getPolicyDocumentTypes,
    );
    setLoading(false);
    if (error) {
      toast.error("Failed to load documents");
    }

    if (data?.success) {
      setPolicyLegalDocuments(data.body);
    }
  };

  useEffect(() => {
    void getUsers();
  }, []);

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
        const { title, policyDocumentType, documentLink, documentText } =
          singleValue;

        const responseData: any = {
          title,
          policyDocumentType,
          documentLink,
          documentText,
        };

        setEditorContent(documentText);

        reset(responseData as formData);
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

  useEffect(() => {
    if (watch("documentText")) {
      setActiveField("field2");
    } else {
      setActiveField("field1");
    }
  }, [watch("documentText")]);

  const onChange = (content: string, editor: any) => {
    setEditorContent(content);
  };

  const onSubmit = async (values: formData) => {
    const { title, policyDocumentType, documentLink } = values;

    const createResponseData = {
      title,
      policyDocumentType,
      documentLink,
      documentText: editorContent,
    };
    setLoading(true);

    if (documentId) {
      const [response, error] = await updateLegalDocument(
        Number(documentId),
        createResponseData,
      );

      if (error) {
        toast.error("Failed to Update legal agreement");
      }

      if (response?.success) {
        void router.push("/profile");
      }
    } else {
      const [res, err] = await createLegalDocument(createResponseData);
      if (err) {
        toast.error("Failed to create legal agreement");
      }
      if (res?.success) {
        res?.message && toast.success(res?.message);
        reset();
        setEditorContent("");
      }
    }

    setLoading(false);
  };
  const [legalDocuments, setLegalDocuments] = useState<any[]>([]);

  console.log({ legalDocuments, policyDocumentsTypes });

  const getLegalDocs = async () => {
    const [data, error]: APIResult<LegalDocuments[]> =
      await ApiHandler(getLegalDocuments);

    if (error) {
      toast.error("Failed to load users");
    }

    if (data?.success) {
      const filterd = data.body.map((item) => item.policyDocumentType);

      setLegalDocuments(filterd);
    }
  };

  useEffect(() => {
    void getLegalDocs();
  }, []);

  // const filterdTypes = policyDocumentsTypes.filter(
  //   (item) => !legalDocuments.includes(item.id),
  // );

  // console.log({ filterdTypes });

  const filterdTypes = policyLegalDocuments.filter((item) => {
    if (documentId) {
      return (
        item.id === watch("policyDocumentType") ||
        !legalDocuments.includes(item.id)
      );
    }

    return !legalDocuments.includes(item.id);
  });

  return (
    <div className=" my-4">
      <Header
        head={documentId ? "Edit legal document" : "Create legal document"}
      />

      <div>
        {/* column 1 */}
        <div className="mt-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <HeaderLayout name="Fill the details below to create new legal document">
              <div className="grid grid-cols-1 gap-3">
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Title"
                  required={true}
                  name="title"
                  rules={{ required: "Title is required" }}
                  type="text"
                  watch={watch}
                />
                <SelectComponent
                  control={control}
                  options={filterdTypes}
                  label="Type"
                  valueKey="id"
                  labelKey="displayName"
                  required={true}
                  name="policyDocumentType"
                  rules={{ required: "Business type is required" }}
                />
                <div className="flex">
                  <div
                    className={` cursor-pointer rounded px-4 py-2 ${
                      activeField === "field1" ? "bg-[#eff0f6]" : "bg-white"
                    }`}
                    onClick={() => handleButtonClick("field1")}
                  >
                    Document link
                  </div>
                  <div
                    className={` cursor-pointer rounded px-4 py-2 ${
                      activeField === "field2" ? "bg-[#f0f3f7]" : "bg-white"
                    }`}
                    onClick={() => handleButtonClick("field2")}
                  >
                    Document Text
                  </div>
                </div>

                {activeField === "field1" && (
                  <InputComponent
                    control={control}
                    errors={errors}
                    label="Document link"
                    name="documentLink"
                    type="url"
                    watch={watch}
                    required={true}
                    rules={{ required: "Document link is required" }}
                  />
                )}
                {/* <InputComponent
                  control={control}
                  errors={errors}
                  label="Country group"
                  name="country_group"
                  rules={{ required: "Country group is required" }}
                  type="url"
                  watch={watch}
                /> */}
                {activeField === "field2" && (
                  <>
                    <p className="subText">Text</p>
                    <Box className="min-h-[350px]">
                      <Editor
                        //  check readme.file for more details
                        apiKey="x0ylgvl5te5xfw82i6ygpbhec4zugxwdoe7g14u10kqnza50"
                        initialValue={documentId ? editorContent : ""}
                        init={{
                          branding: false,
                          height: 400,
                          menubar: true,
                          plugins:
                            "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                          toolbar:
                            "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | link image media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                          image_advtab: true,
                        }}
                        onEditorChange={onChange}
                      />
                    </Box>
                  </>
                )}
                {/* <div className=" max-w-full">
                  <p className=" subText mb-2">Comment</p>
                  <TextareaAutosize
                    name="message"
                    className="rounded border border-slate-400"
                    minRows={5}
                    style={{ width: "100%", resize: "none" }}
                  />
                </div> */}
              </div>
            </HeaderLayout>

            <div className="ml-auto mt-4 flex w-fit gap-5">
              <MuiButton
                title={"Cancel"}
                onClick={() => {
                  router.back();
                }}
                className="btn-outlined px-5"
              />
              <MuiButton
                loading={loading}
                title={documentId ? "Update" : "Create"}
                type="submit"
                className="btn-solid px-5"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LegalDoc;
