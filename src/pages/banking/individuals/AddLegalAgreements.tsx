import React, {
  type FC,
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  upadteLegalDocumentUser,
  uploadLegalDocumentUser,
} from "~/service/ApiRequests";
import { ApiHandler, getUserIp } from "~/service/UtilService";
import { useRouter } from "next/router";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { BsPlus } from "react-icons/bs";
import InputComponent from "~/components/common/InputComponent";
import HeaderLayout from "~/components/common/HeaderLayout";
import SelectComponent from "~/components/common/SelectComponent";
import Button from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";
import Header from "~/components/common/Header";
import toast from "react-hot-toast";
import { usePersonsStore } from "~/store";

type propType = {
  onClose: (value?: string) => void;
  values?: LegalAgreements & KeyString;
};

type legalAgreementsForm = Omit<
  Omit<createLegalAgreementProps, "type">,
  "relationId"
>;

const initForm: legalAgreementsForm = {
  documentType: "",
  description: "",
  addedDate: "",
  counterPartyName: "",
  industry: "",
  file: "",
};

const AddLegalAgreements: FC<propType> = ({ onClose, values }) => {
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

  const { handleSubmit, control, reset } = useForm<legalAgreementsForm>({
    values: values,
    defaultValues: initForm,
  });

  console.log("values", values);
  const [documentTypes] = useAsyncMasterStore("documentTypes");
  const [loading, setLoading] = useState<boolean>(false);

  const [open, setOpen] = useState(false);

  const createLegalDocument = async (formData: any) => {
    setLoading(true);
    const [data, error]: APIResult<LegalAgreements> = await ApiHandler(
      uploadLegalDocumentUser,
      formData,
    );
    if (error) {
      toast.error("Failed to upload to legal agreements");
    }

    if (data?.success) {
      usePersonsStore.setState((prev) => {
        const nextState = { ...prev };

        nextState.LegalAgreements = [data.body, ...nextState.LegalAgreements];
        return nextState;
      });

      setOpen(true);
    }
    setLoading(false);
  };

  const updateLegalDocument = async (formData: legalAgreementsForm) => {
    setLoading(true);
    const [res, error] = await upadteLegalDocumentUser(values?.id, formData);
    if (error) {
      toast.error("Failed to update to legal agreements");
    }

    if (res?.success) {
      usePersonsStore.setState((prev) => {
        const agreements = [...prev.LegalAgreements];

        if (values?.id) {
          const idx = agreements.findIndex((item) => item.id === values.id);

          agreements[idx] = res.body;
        } else {
          agreements.unshift(res.body);
        }

        return {
          ...prev,
          LegalAgreements: [...agreements],
        };
      });

      setOpen(true);
    }
    setLoading(false);
  };

  const fileName = useWatch({
    control,
    name: "file",
  });

  const onSubmit = async (data: any) => {
    const userIp = await getUserIp();
    const { documentType, description, addedDate } = data;
    const formData = new FormData();

    formData.append("type", "user");
    formData.append("relationId", companyId ?? "");
    formData.append("file", data.file as Blob);
    formData.append("documentType", documentType as string);
    formData.append("description", description as string);
    formData.append("addedDate", addedDate as string);
    formData.append("ipAddress", userIp);

    !values?.id
      ? await createLegalDocument(formData)
      : await updateLegalDocument(formData);

    // if (response?.success) {
    //   if (relationType === "company") {
    //     useCompanyStore.setState((prev) => {
    //       const relatedDocuments = [...prev.relatedDocuments];

    //       if (values?.id) {
    //         const idx = relatedDocuments.findIndex(
    //           (item) => item.id === values.id,
    //         );
    //         relatedDocuments[idx] = response.body;
    //       } else {
    //         relatedDocuments.unshift({ ...response.body });
    //       }

    //       return {
    //         ...prev,
    //         relatedDocuments: [...relatedDocuments],
    //       };
    //     });
    //   } else if (relationType === "user") {
    //     usePersonsStore.setState((prev) => {
    //       const documents = [...prev.documents];

    //       if (values?.id) {
    //         const idx = documents.findIndex((item) => item.id === values.id);
    //         documents[idx] = response.body;
    //       } else {
    //         documents.unshift(response.body);
    //       }

    //       return {
    //         ...prev,
    //         documents: [...documents],
    //       };
    //     });
    //   }

    //   setConfirm(true);
    // }
    // if (err) {
    //   toast.error("Failed to create the document");
    // }
  };

  useEffect(() => {
    function getFormState() {
      const nextFormState: legalAgreementsForm = {
        documentType: "",
        description: "",
        addedDate: "",
        counterPartyName: "",
        industry: "",
        file: undefined,
      };

      if (values) {
        for (const key in nextFormState) {
          nextFormState[key] = values[key];
        }
      }

      // const mergedType: string =
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      //   nextFormState.documentType.charAt(0).toUpperCase() +
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      //   nextFormState.documentType.slice(1);
      // nextFormState.documentType = mergedType;
      return nextFormState;
    }
    reset(getFormState());
  }, []);

  return (
    <Fragment>
      <DailogBox maxWidth={"xs"} open={open} handleClose={onClose}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            {values?.id
              ? "New legal document Updated"
              : "New legal document was created"}
          </h1>
          <p>
            {values?.id
              ? "New legal document was updated successfully"
              : "New legal document was created successfully"}
          </p>
          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={onClose}
          ></Button>
        </div>
      </DailogBox>
      <div className="m-3">
        <Header head={!values ? "Add new document" : "Edit document"} />
      </div>
      <form
        className="my-4 flex flex-col gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="border-slte-200 flex flex-col gap-3 border">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">Document</h2>
            <Controller
              name="file"
              control={control}
              rules={{
                required: values?.id ? false : "File is required",
              }}
              render={({ field: { onChange }, fieldState: { error } }) => (
                <div>
                  <p className="text-sm text-red-500">{error?.message}</p>
                  <Button
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="btn-solid"
                    title="Upload file"
                  >
                    <input
                      id="fileInput"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e: any) => {
                        onChange(e.target.files[0] ?? null);
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
                options={documentTypes}
                labelKey="displayName"
                valueKey="id"
                label="Document type"
                name="documentType"
                required={true}
                rules={{ required: "Document type is required" }}
              />
              <InputComponent
                control={control}
                label="Description"
                name="description"
                rules={{ required: "Description is required" }}
                type="text"
              />
              <InputComponent
                control={control}
                label="Added date*"
                name="addedDate"
                rules={{ required: "date is required" }}
                type="date"
              />
            </div>
          </div>
        </div>

        <HeaderLayout name="Uploaded file">
          {fileName?.name || docURLName}
        </HeaderLayout>

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <Button
            title="Back"
            onClick={onClose}
            className="btn-outlined"
            type="button"
          />
          <Button
            title={!values ? "Create Document" : "Save Changes"}
            type="submit"
            className="btn-solid"
            loading={loading}
          />
        </div>
      </form>
    </Fragment>
  );
};

export default AddLegalAgreements;
