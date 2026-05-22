import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { decodeParams, encodeParams, formatDate } from "~/common/functions";
import {
  changeCompanyVerification,
  changeDocumentStatus,
  changeUserVerification,
  deleteUser,
} from "~/service/api";
import HeaderLayout from "~/components/common/HeaderLayout";
import MuiButton from "~/components/common/Button";
import Header from "~/components/common/Header";
import AddDocument from "~/components/documents/AddDocument";
import toast from "react-hot-toast";
import ConfirmationPopup from "~/components/documents/ConfirmationPopup";
import { enforcePermission } from "~/utils/permissions";
type actionType = "DELETE" | "REJECTED" | "APPROVED" | "";

const ViewRequests = () => {
  const router = useRouter();

  const [identityRequest, setIdentityRequest] = useState<IdentityRequestType>({
    id: "",
    azureId: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    status: 1,
    createdAt: "",
    isUserVerified: "PENDING",
    Documents: [],
    companyName: "",
    verificationStatus: "PENDING",
  });

  const [rejectingFile, setRejectingFile] = useState({
    index: -1,
    id: NaN,
  });

  const [currentEdit, setCurrentEdit] = useState<Documents>();

  const [userAction, setUserAction] = useState<actionType>("");

  const requestDetails: IdentityViewType = useMemo(
    () => ({
      "Details and documents": {
        ID: identityRequest.userId
          ? identityRequest.id
          : identityRequest.azureId,
        Clients: identityRequest.userId
          ? identityRequest.companyName
          : `${identityRequest.firstname} ${identityRequest.lastname}`,
        State: identityRequest.userId
          ? identityRequest.verificationStatus
          : identityRequest.isUserVerified,
        Type: identityRequest.userId ? "Company" : "Person",
        "Created at": formatDate(identityRequest.createdAt),
      },

      Parameters: {
        "Required document": "-",
      },

      "Additional Information": {
        Reference: "-",
        Identification: "-",
        Request: "-",
        State: "-",
        "Referenced by": "-",
      },
    }),
    [identityRequest],
  );

  const getFileName = (type: string, link: string) => {
    const splitLink = link.split(".");
    const extension = splitLink[splitLink?.length - 1];

    return `${type}.${extension}`;
  };

  const updateQuery = async (nextQuery: IdentityRequestType) => {
    await router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          request: encodeParams(nextQuery),
        },
      },
      undefined,
      {
        shallow: true,
      },
    );
  };

  const onUserAction = (action?: actionType) => {
    setUserAction(action ?? "");
  };

  const onFinalReject = async () => {
    const [res] = await deleteUser(identityRequest.azureId);
    if (res?.success) {
      router.back();
    } else {
      toast.error("Failed to reject identity verification");
    }
    onUserAction();
  };

  const onChangeStatus = async (action: "REJECTED" | "APPROVED") => {
    const [res] = identityRequest.userId
      ? await changeCompanyVerification(identityRequest.id.toString(), action)
      : await changeUserVerification(identityRequest.azureId, action);

    if (res?.success) {
      setIdentityRequest((prev) => {
        const nextState = identityRequest.userId
          ? { ...prev, verificationStatus: action }
          : { ...prev, isUserVerified: action };
        void updateQuery(nextState);
        return nextState;
      });

      toast.success(
        action === "APPROVED"
          ? "Successfully approved identity verification"
          : "Successfully rejected identity verification",
      );
    } else {
      toast.error(
        `Failed to ${
          action === "APPROVED" ? "approve" : "reject"
        } identity verification`,
      );
    }
    onUserAction();
  };

  const onDocumentEdit = (document?: Documents) => {
    const currentQuery = router.query || {};

    // Create a new query object with the updated id
    const newQuery = {
      ...currentQuery,
      id: document?.relationId,
    };
    const updatedUrl = {
      pathname: router.pathname,
      query: newQuery,
    };

    // Update the URL without triggeringrouter.replace a page reload
    void router.replace(updatedUrl, undefined, { shallow: true });
    setCurrentEdit(document);
  };

  const onDocumentReject = (documentId?: number, index?: number) => {
    setRejectingFile((prev) => ({
      ...prev,
      id: documentId ?? NaN,
      index: index ?? -1,
    }));
  };

  const RejectDocument = async (documentId: number, index: number) => {
    const [res, err] = await changeDocumentStatus(documentId, "REJECTED");

    if (res?.success) {
      setIdentityRequest((prev) => {
        const nextState = {
          ...prev,
        };
        const docs = [...prev.Documents];
        docs[index]!.status = "REJECTED";
        void updateQuery(nextState);
        return nextState;
      });
      onDocumentReject();
    }

    if (err) {
      toast.error("Failed to update rejection");
    }
  };

  useEffect(() => {
    const data = !Array.isArray(router.query.request)
      ? router.query.request
      : "";

    if (router.isReady) {
      if (data) {
        const query: IdentityRequestType = decodeParams(data);
        !query && router.back();
        setIdentityRequest(query);
      } else {
        router.back();
      }
    }
  }, [router]);

  if (currentEdit) {
    return (
      <AddDocument onClose={() => onDocumentEdit()} values={currentEdit} />
    );
  }

  const isActionBlocked = ["REJECTED", "APPROVED"].includes(
    identityRequest?.userId
      ? identityRequest.verificationStatus
      : identityRequest.isUserVerified,
  );

  const handleDownload = () => {
    try {
      // const zip = new JSZip();
      // const remoteZips = identityRequest.Documents.map(async (file) => {
      //   const response = await fetch(file.documentLink);
      //   const data = await response.blob();
      //   zip.file(`${file.documentType}.${file.type}`, data);
      //   return data;
      // });
      //
      // await Promise.all(remoteZips);
      // const content = await zip.generateAsync({ type: "blob" });
      // // Create a temporary anchor element
      // const link = document.createElement("a");
      // link.href = URL.createObjectURL(content);
      // link.download = "zip-download-next-js.zip";
      // link.click();
    } catch (error) {}
  };
  return (
    <Fragment>
      <ConfirmationPopup
        header="Are you sure want to reject this document?"
        subHeader="By doing this action the document will be removed permanently. Are
        you sure you want to reject this document"
        open={rejectingFile.index > -1}
        onConfirm={() => RejectDocument(rejectingFile.id, rejectingFile.index)}
        onClose={() => onDocumentReject()}
      />

      <ConfirmationPopup
        header={
          identityRequest.userId
            ? "Are you sure want to reject this company profile?"
            : "Are you sure want to reject this user profile?"
        }
        subHeader={
          userAction === "DELETE"
            ? "By doing this action the user will be removed permanently. Are you sure you want to reject this user"
            : identityRequest.userId
              ? "By doing this action the company will be rejected. Are you sure you want to reject this company"
              : "By doing this action the user will be removed. Are you sure you want to reject this user"
        }
        open={userAction !== ""}
        onConfirm={async () => {
          if (userAction === "REJECTED") {
            await onChangeStatus(userAction);
          } else {
            await onFinalReject();
          }
        }}
        onClose={() => onUserAction()}
      />
      <div className="">
        <br />
        <Header head="View request" />

        <br />
        <div className=" grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {/* Details and documents */}
            <HeaderLayout name="Details and documents">
              <div>
                <div className="flex flex-col gap-3">
                  {Object.entries(requestDetails["Details and documents"]).map(
                    ([key, value], i) => (
                      <div key={i} className="grid grid-cols-2">
                        <p className="subText">{key}</p>
                        <p className="subText">{value}</p>
                      </div>
                    ),
                  )}
                </div>
                <br />
                <div className="flex flex-col gap-3">
                  <p className="subHeader">Documents</p>

                  {identityRequest.Documents?.map((item, idx) => (
                    <div
                      className="flex items-center justify-between"
                      key={item.id}
                    >
                      <a
                        download
                        target="_blank"
                        href={item.documentLink}
                        className="subText cursor-pointer text-[#217EFD] underline"
                      >
                        {getFileName(item.documentType, item.documentLink)}
                      </a>
                      <div className="flex gap-2">
                        <MuiButton
                          title={
                            item.status === "REJECTED" ? "Rejected" : "Reject"
                          }
                          disabled={item.status === "REJECTED"}
                          onClick={() =>
                            void onDocumentReject(item.id as number, idx)
                          }
                          className="btn-outlined w-full"
                        />
                        <MuiButton
                          title="Edit"
                          onClick={() => {
                            onDocumentEdit(item);
                          }}
                          className="btn-solid w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <br />

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="subHeader">Download Documents</p>
                    <MuiButton
                      onClick={handleDownload}
                      title="Download"
                      className="btn-solid w-1/4"
                    />
                  </div>
                </div>

                <br />

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="subHeader">Actions</p>
                    <div className=" flex  items-center justify-between">
                      <div className="flex  gap-2">
                        {/* <MuiButton
                          title="Reject finally "
                          className="btn-danger w-1/2"
                          onClick={() => onUserAction("DELETE")}
                        /> */}
                        <MuiButton
                          disabled={isActionBlocked}
                          title={
                            (identityRequest.userId
                              ? identityRequest.verificationStatus
                              : identityRequest.isUserVerified) === "REJECTED"
                              ? "Rejected"
                              : "Reject"
                          }
                          className="btn-outlined w-1/2"
                          onClick={() => {
                            enforcePermission("edit", [
                              () => onUserAction("REJECTED"),
                            ]);
                          }}
                        />
                        <MuiButton
                          disabled={isActionBlocked}
                          title={
                            (identityRequest.userId
                              ? identityRequest.verificationStatus
                              : identityRequest.isUserVerified) === "APPROVED"
                              ? "Approved"
                              : "Approve"
                          }
                          useLoading
                          className="btn-solid w-1/2"
                          onClick={() => {
                            enforcePermission("edit", [
                              () => onChangeStatus("APPROVED"),
                            ]);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </HeaderLayout>
          </div>

          {/* column 2 */}
          <div className="flex flex-col gap-4">
            {/* Settings */}
            {/* <HeaderLayout name="Provider">
              {Object.entries(requestDetails.Parameters).map(
                ([key, value], i) => (
                  <div key={i} className=" grid grid-cols-2 ">
                    <p className="subText">{key}</p>
                    <p className="subText">{value}</p>
                  </div>
                ),
              )}
            </HeaderLayout> */}

            {/* Additional information */}
            <HeaderLayout name="Additional information">
              <div className=" flex flex-col gap-4">
                {Object.entries(requestDetails["Additional Information"]).map(
                  ([key, value], i) => (
                    <div key={i} className=" grid grid-cols-2 ">
                      <p className="subText">{key}</p>
                      <p className="subText">{value}</p>
                    </div>
                  ),
                )}{" "}
              </div>
            </HeaderLayout>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ViewRequests;
