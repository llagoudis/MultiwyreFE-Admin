import React, { useState, Fragment, useRef, type FC } from "react";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { Controller, useForm, useWatch } from "react-hook-form";
import { BsPlus } from "react-icons/bs";
import { useRouter } from "next/router";
import { useCompanyStore } from "~/store";
import { createLegalAgreement } from "~/service/api/documents";
import InputComponent from "~/components/common/InputComponent";
import HeaderLayout from "~/components/common/HeaderLayout";
import SelectComponent from "~/components/common/SelectComponent";
import Button from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";
import Header from "~/components/common/Header";
import toast from "react-hot-toast";

type legalAgreementsForm = Omit<
  Omit<createLegalAgreementProps, "type">,
  "relationId"
>;
const AddLegalAgreements: FC<{
  onClose(): void;
}> = ({ onClose }) => {
  const router = useRouter();
  const companyId = Array.isArray(router.query.id) ? "" : router.query.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentTypes] = useAsyncMasterStore("documentTypes");
  const [open, setOpen] = useState(false);

  const onConfirmClose = (_?: unknown, reason?: string) => {
    if (reason === "backdropClick") return;
    onClose();
  };

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<legalAgreementsForm>({
    defaultValues: {
      documentType: "",
      description: "",
      addedDate: "",
      counterPartyName: "",
      industry: "",
      file: undefined,
    },
  });

  const currentFile = useWatch({
    name: "file",
    control,
  });

  const onSubmit = async (data: legalAgreementsForm) => {
    const legalAgreements = new FormData();
    legalAgreements.append("type", "company");
    legalAgreements.append("relationId", companyId ?? "");
    legalAgreements.append("documentType", data.documentType as string);
    legalAgreements.append("industry", data.industry as string);
    legalAgreements.append("description", data.description as string);
    legalAgreements.append("addedDate", data.addedDate as string);
    legalAgreements.append("counterPartyName", data.counterPartyName as string);
    if (data.file) {
      legalAgreements.append("file", data.file as string | Blob);
    }

    const [response, err] = await createLegalAgreement(legalAgreements);

    if (response) {
      useCompanyStore.setState((prevState) => {
        const nextState = {
          ...prevState,
        };
        nextState.legalAgreements = [
          response.body,
          ...nextState.legalAgreements,
        ];
        return nextState;
      });
      setOpen(true);
    }
    if (err) {
      toast.error("Failed to create legal agreement");
    }
  };

  return (
    <Fragment>
      <DailogBox maxWidth={"xs"} open={open} handleClose={onConfirmClose}>
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            New legal document was created
          </h1>
          <p>New legal document was created successfully</p>
          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={onConfirmClose}
          />
        </div>
      </DailogBox>

      <form className="flex flex-col gap-3 my-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="py-4">
          <Header head={"Add new legal agreement"} />
        </div>
        <div className="border-slte-200 flex flex-col gap-3 border">
          <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
            <h2 className="font-medium text-black">Document</h2>
            <Controller
              name="file"
              rules={{
                required: "File is required",
              }}
              control={control}
              render={({ field: { onChange }, fieldState: { error } }) => (
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
                        onChange(e.target.files?.[0] ?? null);
                      }}
                      accept=""
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
                label="Document Type*"
                name="documentType"
                valueKey="id"
                labelKey="displayName"
                rules={{ required: "Document type is required" }}
              />
              <InputComponent
                control={control}
                label="Description"
                name="description"
                type="text"
              />
              <InputComponent
                control={control}
                label="Added date"
                name="addedDate"
                type="date"
              />
              <InputComponent
                control={control}
                label="Counterparty Name*"
                name="counterPartyName"
                type="text"
              />
              <InputComponent
                control={control}
                label="Industry*"
                name="industry"
                type="text"
                rules={{ required: "Document type is required" }}
              />
            </div>
          </div>
        </div>

        <HeaderLayout name={`Uploaded file: ${currentFile?.name || ""}`} />

        <div className="mt-8 flex w-full justify-end gap-4 px-3">
          <Button
            title="Back"
            type="button"
            onClick={onClose}
            className="btn-outlined"
          />
          <Button
            title="Create document"
            type="submit"
            className="btn-solid"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Fragment>
  );
};

export default AddLegalAgreements;
