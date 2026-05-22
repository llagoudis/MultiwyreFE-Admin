import React, {
  Fragment,
  useRef,
  useState,
  useEffect,
  useMemo,
  type FC,
} from "react";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/router";
import { createDocument, updateDocument } from "~/service/api/documents";
import { BsPlus } from "react-icons/bs";
import { useCompanyStore, usePersonsStore } from "~/store";
import Image, { type StaticImageData } from "next/image";
import Button from "~/components/common/Button";
import Header from "~/components/common/Header";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import checkicon from "~/assets/general/check-one.svg";
import DailogBox from "~/components/common/DailogBox";
import toast from "react-hot-toast";
import HeaderLayout from "~/components/common/HeaderLayout";

const documentStates = [
  {
    label: "Awaiting Inspection",
    value: "SUBMITTED",
  },
  {
    label: "Approved",
    value: "APPROVED",
  },
  {
    label: "Rejected",
    value: "REJECTED",
  },
  {
    label: "Expired",
    value: "PENDING",
  },
];

type addDocumentForm = Omit<Omit<documentFormType, "type">, "relationId">;

interface addDocumentProps {
  onClose: (value?: string) => void;
  values?: Documents & KeyString;
}

const initForm: addDocumentForm = {
  documentNumber: "",
  documentType: "",
  issuedBy: "",
  issuedDate: "",
  validTill: "",
  status: "SUBMITTED",
  file: "",
};

const AddDocument: FC<addDocumentProps> = ({ onClose, values }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const companyId = Array.isArray(router.query.id) ? "" : router.query.id;
  const relationType: RelationType = router.asPath.includes("companies")
    ? "company"
    : "user";

  const docURLName = useMemo(() => {
    if (values?.documentLink) {
      const path = values.documentLink.split("/");
      return path[path?.length - 1];
    }
  }, [values?.documentLink]);

  const [countries] = useAsyncMasterStore("countries");
  const [documentType] = useAsyncMasterStore("documentTypes");
  const [confirm, setConfirm] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const sortedDocumentTypes = useMemo(() => {
    return [...documentType].sort((a, b) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      a.displayName.localeCompare(b.displayName),
    );
  }, [documentType]);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    reset,
  } = useForm<addDocumentForm>({
    values: values,
    defaultValues: initForm,
  });

  const fileName = useWatch({
    control,
    name: "file",
  });

  const onSubmit = async (data: addDocumentForm) => {
    const documentForm = new FormData();
    documentForm.append(
      "type",
      values?.type === "company" ? "company" : relationType,
    );
    documentForm.append("relationId", companyId ?? "");

    Object.keys(data).forEach((item) => {
      if (data[item]) {
        //TODO
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        documentForm.append(item, data[item]);
      }
    });

    const [response, err] = values?.id
      ? await updateDocument(values.id, documentForm)
      : await createDocument(documentForm);

    if (response?.success) {
      if (relationType === "company") {
        useCompanyStore.setState((prev) => {
          const relatedDocuments = [...prev.relatedDocuments];

          if (values?.id) {
            const idx = relatedDocuments.findIndex(
              (item) => item.id === values.id,
            );
            relatedDocuments[idx] = response.body;
          } else {
            relatedDocuments.unshift({ ...response.body });
          }

          return {
            ...prev,
            relatedDocuments: [...relatedDocuments],
          };
        });
      } else if (relationType === "user") {
        usePersonsStore.setState((prev) => {
          const documents = [...prev.documents];

          if (values?.id) {
            const idx = documents.findIndex((item) => item.id === values.id);
            documents[idx] = response.body;
          } else {
            documents.unshift(response.body);
          }

          return {
            ...prev,
            documents: [...documents],
          };
        });
      }

      setConfirm(true);
    }
    if (err) {
      toast.error("Failed to create the document");
    }
  };

  useEffect(() => {
    function getFormState() {
      const nextFormState: addDocumentForm = {
        documentNumber: "",
        documentType: "",
        issuedBy: "",
        issuedDate: "",
        validTill: "",
        status: "SUBMITTED",
        file: "",
      };

      if (values) {
        for (const key in nextFormState) {
          nextFormState[key] = values[key];
        }
      }
      const mergedType: string =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        nextFormState.documentType.charAt(0).toUpperCase() +
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        nextFormState.documentType.slice(1);

      nextFormState.documentType = mergedType;
      console.log("nextFormState: ", nextFormState);
      return nextFormState;
    }

    reset(getFormState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <DailogBox maxWidth={"xs"} open={confirm} handleClose={onClose}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            {values?.id ? "Document Updated" : "New document was created"}
          </h1>
          <p>
            {values?.id
              ? "Document was updated successfully"
              : "New document was created successfully"}
          </p>
          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={onClose}
          />
        </div>
      </DailogBox>
      <form onSubmit={handleSubmit(onSubmit)} className="my-4">
        <div className="py-4">
          <Header head={!values ? "Add new document" : "Edit document"} />
        </div>
        <div className="mb-3 w-full border border-[#00000030]">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">Document</h2>
            <Controller
              name="file"
              rules={{
                required: values?.id ? false : "File is required",
              }}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div className="flex items-center gap-4">
                  <p className="text-sm text-red-500">{error?.message}</p>
                  <Button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="btn-solid"
                    title="Upload file"
                  >
                    <input
                      ref={fileInputRef}
                      id="fileInput"
                      type="file"
                      className="hidden"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        field.onChange(e.target.files?.[0] ?? null);
                      }}
                    />
                    <BsPlus size={20} />
                  </Button>
                </div>
              )}
            />
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              <SelectComponent
                control={control}
                options={sortedDocumentTypes}
                required={true}
                labelKey="displayName"
                valueKey="name"
                label="Document Type"
                name="documentType"
                rules={{ required: "Document type is required" }}
              />
              <SelectComponent
                control={control}
                options={countries}
                required={true}
                labelKey="name"
                valueKey="id"
                label="Country"
                name="issuedBy"
                rules={{ required: "Country List is required" }}
              />
              <InputComponent
                control={control}
                label="Document Number"
                name="documentNumber"
                type="text"
              />
              {/* <InputComponent
              control={control}
              label="Issued by"
              name="IssuedBy"
              type="email"
            /> */}
              <InputComponent
                control={control}
                label="Issued date"
                name="issuedDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
                max={endDate}
              />
              <InputComponent
                control={control}
                label="Valid until"
                name="validTill"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
                min={startDate}
              />

              <div className=" col-span-3">
                <SelectComponent
                  control={control}
                  options={documentStates}
                  required={true}
                  label="Document Status"
                  name="status"
                  rules={{ required: "State is required" }}
                />
              </div>
            </div>
          </div>
        </div>

        <HeaderLayout name="Uploaded file">
          {fileName?.name || docURLName}
        </HeaderLayout>

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <Button
            title="Back"
            onClick={() => {
              onClose();
            }}
            className="btn-outlined"
          />
          <Button
            title={!values ? "Create Document" : "Save Changes"}
            type="submit"
            className="btn-solid"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Fragment>
  );
};

export default AddDocument;
