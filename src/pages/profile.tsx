import React, { Fragment, useEffect, useRef, useState } from "react";
import { Box, Dialog } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { BsPlus } from "react-icons/bs";
import Button from "~/components/common/Button";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import Close from "~/assets/general/close.svg";
import {
  deleteLegalDocument,
  getLegalDocuments,
  updateAdminProfile,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import toast from "react-hot-toast";
import { formatDateTime } from "~/common/functions";
import DailogBox from "~/components/common/DailogBox";
import { useRouter } from "next/router";
import { useGlobalStore } from "~/store";
import { enforcePermission } from "~/utils/permissions";

type formData = {
  file: string;
  companyLegalName: string;
  email: string;
  companyAddress: string;
  tabName: string;
};

type dataType = {
  id: string;
  Type?: string;
  Title?: string;
  DocumentLink?: string;
  UpdatedAt?: string;
  currency?: string;
  current?: string;
  ceserved?: string;
  available?: string;
  amount?: string;
  description?: string;
  details?: string;
  type?: string;
  status?: string;
  date?: string;
};
type TableRow = { row: LegalDocuments };

const Profile = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<formData>();

  const filePickerRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<any>(null);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocuments[]>([]);
  const [openDialog, setOpenDialog] = useState("");
  const [deleteDocumentId, setDeleteDocumentId] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<string>("");
  const [selectedLegalDocument, setSelectedLegalDocument] =
    useState<LegalDocuments | null>(null);

  const admin = useGlobalStore((state) => state.admin);

  const router = useRouter();

  // page Navigation
  const onNavigation = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  const columns = [
    {
      flex: 1,
      minWidth: 180,
      field: "displayName",
      headerName: "TYPE",
      valueGetter: ({ row }: TableRow) => {
        return row?.PolicyDocumentType?.displayName ?? "---";
      },
      renderCell: ({ row }: TableRow) => (
        <p>{row?.PolicyDocumentType?.displayName ?? "--"}</p>
      ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "title",
      headerName: "TITLE",
      renderCell: ({ row }: TableRow) => <p>{row?.title ?? "--"}</p>,
    },
    {
      flex: 1,
      minWidth: 150,
      field: "DocumentLink",
      headerName: "DOCUMENT LINK",
      valueGetter: ({ row }: TableRow) => {
        return row.documentLink ?? "---";
      },
      renderCell: ({ row }: TableRow) =>
        row?.documentText !== "" ? (
          <p
            className="cursor-pointer text-blue-600"
            onClick={() => {
              setSelectedLegalDocument(row);
              setOpen("legalDocPopup");
            }}
          >
            {" "}
            Legal Document{" "}
          </p>
        ) : (
          <Link
            target="_blank"
            className="text-blue-600 underline"
            href={row.documentLink}
          >
            Link
          </Link>
        ),
    },
    {
      flex: 1,
      minWidth: 150,
      field: "UpdatedAt",
      headerName: "UPDATED AT",
      valueGetter: ({ row }: TableRow) => {
        return formatDateTime(row?.updatedAt) ?? "--";
      },
      renderCell: ({ row }: TableRow) => (
        <p>{formatDateTime(row?.updatedAt) ?? "--"}</p>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "ACTIONS",
      width: 100,
      getActions: ({ row }: TableRow) => [
        // <GridActionsCellItem
        //   key="show"
        //   label="Show"
        //   showInMenu
        //   sx={{
        //     padding: "5px 1rem",

        //     width: "6rem",
        //     fontSize: "14px",
        //   }}
        // />,
        <GridActionsCellItem
          key="edit"
          label="Edit"
          showInMenu
          onClick={() => {
            onNavigation(`/profile/addNew`, {
              id: row?.id,
            });
          }}
          sx={{
            padding: "5px 1rem",

            width: "6rem",
            fontSize: "14px",
          }}
        />,
        <GridActionsCellItem
          key="delete"
          label="Delete"
          onClick={() => {
            enforcePermission("delete", [
              () => setDeleteDocumentId(row?.id),
              () => setOpenDialog("delete"),
            ]);
          }}
          showInMenu
          sx={{
            padding: "5px 1rem",

            width: "6rem",
            fontSize: "14px",
          }}
        />,
        // <GridActionsCellItem
        //   key="version"
        //   label="Version"
        //   showInMenu
        //   sx={{
        //     padding: "5px 1rem",

        //     width: "6rem",
        //     fontSize: "14px",
        //   }}
        // />,
      ],
    },
  ];

  const getUsers = async () => {
    setTableLoading(true);
    const [data, error]: APIResult<LegalDocuments[]> =
      await ApiHandler(getLegalDocuments);
    setTableLoading(false);
    if (error) {
      toast.error("Failed to load users");
    }

    if (data?.success) {
      const filterd = data.body;
      setLegalDocuments(filterd);
    }
  };

  const onDelete = async () => {
    setLoading(true);
    const [response, err] = await deleteLegalDocument(deleteDocumentId);
    if (err) {
      toast.error("Failed to delete legalAgreement!!");
    }
    if (response?.success) {
      setOpenDialog("deleteSuccess");
      void getUsers();
    }
    setLoading(false);
  };

  const handleCloseDelete = () => {
    setOpenDialog("");
  };

  useEffect(() => {
    void getUsers();
  }, []);

  const onSubmit = async (data: formData) => {
    setLoading(true);
    const reqBody = {
      ...data,
      file: file,
    };

    const [res, error] = await updateAdminProfile(reqBody);
    setLoading(false);
    if (res?.success) {
      res?.message && toast.success(res?.message);
      useGlobalStore.getState().syncAdminProfile();
    }
  };

  useEffect(() => {
    if (admin) {
      const response = {
        file: admin?.profileImgLink,
        companyLegalName: admin?.companyLegalName,
        email: admin?.email,
        companyAddress: admin?.companyAddress,
        tabName: admin?.tabName,
      };

      reset(response as formData);
    }
  }, [admin]);

  const renderSections = (content: string) => {
    const sections = content.split(/<\/?h[1-6]>/g);

    return sections.map((section, index) => (
      <div key={index}>
        {section.startsWith("<h") ? (
          <h2
            className="my-4 text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: section }}
          />
        ) : (
          <p dangerouslySetInnerHTML={{ __html: section }} />
        )}
      </div>
    ));
  };

  return (
    <div className="my-4">
      <div className=" flex items-center justify-between">
        <p className=" text-2xl font-bold text-[#1E293B]">My Profile</p>
      </div>
      <Dialog
        fullScreen
        open={open === "legalDocPopup"}
        onClose={() => {
          setOpen("");
          setSelectedLegalDocument(null);
        }}
      >
        <div className="">
          <div className=" m-auto w-[90%]">
            <div className="mt-8 flex justify-between pb-4">
              <p className=" m-auto text-sm font-bold sm:text-base lg:text-lg">
                {selectedLegalDocument?.PolicyDocumentType?.displayName}
              </p>
              <button
                onClick={() => {
                  setOpen("");
                }}
              >
                <div>
                  <Image src={Close as StaticImageData} alt="Close" />
                </div>
              </button>
            </div>
            <div className="">
              <div className=" flex flex-col justify-between py-4 text-xs sm:text-sm lg:text-base">
                {/* ================================== */}
                {selectedLegalDocument ? (
                  <div>
                    <p className="my-4 text-xl font-semibold">
                      {selectedLegalDocument.title}
                    </p>
                    {renderSections(selectedLegalDocument.documentText)}
                  </div>
                ) : null}

                {/* =================================== */}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
      <DailogBox
        maxWidth={"sm"}
        open={openDialog === "delete"}
        handleClose={() => {
          setOpenDialog("");
        }}
      >
        <div className="flex flex-col gap-4 ">
          <h2 className="text-xl font-semibold text-black">
            Are you sure want to delete this Legal document?
          </h2>
          <p>
            By doing this action the Legal document will be removed permanently.
            Are you sure you want to remove this Legal document?
          </p>
          <div className="flex justify-end gap-4">
            <Button
              className="btn-outlined "
              title="No, cancel"
              onClick={() => {
                setOpenDialog("");
              }}
            ></Button>
            <Button
              className="btn-solid text-white"
              title="Yes, confirm"
              onClick={onDelete}
              loading={loading}
            />
          </div>
        </div>
      </DailogBox>
      <DailogBox
        maxWidth={"sm"}
        open={openDialog === "deleteSuccess"}
        handleClose={handleCloseDelete}
      >
        <div className="flex flex-col gap-4 ">
          <h2 className="text-center text-xl font-semibold text-black">
            Legal document deleted successfully
          </h2>

          <div className="mt-4 flex justify-end gap-4">
            <Button
              className="btn-solid text-white"
              title="Close"
              onClick={handleCloseDelete}
            />
          </div>
        </div>
      </DailogBox>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enforcePermission("edit", [() => handleSubmit(onSubmit)(e)]);
        }}
      >
        {/* column 1 */}
        <div className="mt-4">
          <HeaderLayout name={"Add a logo"}>
            <div className="flex justify-between">
              {admin?.profileImgLink ? (
                <Image
                  alt={"Profile"}
                  className="object-cover"
                  src={
                    admin?.profileImgLink
                      ? `${admin?.profileImgLink}?t=${new Date().getTime()}`
                      : ""
                  }
                  width={"100"}
                  height={"100"}
                />
              ) : (
                <p>Choose a file to upload</p>
              )}

              <div>
                <Controller
                  name="file"
                  control={control}
                  render={() => (
                    <Fragment>
                      <Button
                        onClick={() => {
                          filePickerRef.current?.click();
                        }}
                        className="btn-solid"
                        title={"Upload a new picture"}
                      >
                        <input
                          id="fileInput"
                          ref={filePickerRef}
                          type="file"
                          className="hidden"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const files = e.target?.files;
                            if (files) setFile(files[0]);
                          }}
                          accept="image/*"
                        />
                        <BsPlus size={20} />
                      </Button>
                    </Fragment>
                  )}
                />
                <br />
                <div className="mt-2">{file?.name}</div>
              </div>
            </div>
          </HeaderLayout>
        </div>
        {/* column 2 */}
        <div className="mt-4">
          <HeaderLayout name="Company details">
            <div className=" grid grid-cols-2 gap-4">
              <InputComponent
                control={control}
                type="text"
                errors={errors}
                label="Company Legal Name"
                watch={watch}
                rules={{ required: "Company is required" }}
                name="companyLegalName"
              />
              <InputComponent
                control={control}
                errors={errors}
                label="Email*"
                name="email"
                watch={watch}
                rules={{ required: "Email is required" }}
                type="text"
              />
              <div className="col-span-2">
                <InputComponent
                  control={control}
                  type="text"
                  errors={errors}
                  label="Company Address"
                  watch={watch}
                  rules={{ required: "Company address is required" }}
                  name="companyAddress"
                />
              </div>
              <InputComponent
                control={control}
                type="text"
                errors={errors}
                label="Tab Name"
                watch={watch}
                name="tabName"
              />
            </div>
          </HeaderLayout>
        </div>

        {/* column 3 */}
        <div className="mt-4">
          <div className="w-full border border-[#00000030] ">
            <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
              <h2 className="subHeader">Legal documents</h2>
              <div className="flex gap-4">
                <Link href={"/profile/PolicyLegalDocuments"}>
                  <Button
                    className="btn-solid"
                    title="View Documents types"
                  ></Button>
                </Link>
                <Link href={"/profile/addNew"}>
                  <Button className="btn-solid" title="Add New">
                    <BsPlus size={20} />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="as">
              <MuiDataGrid
                loading={tableLoading}
                storageName={"profile"}
                rows={legalDocuments}
                columns={columns}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex w-full justify-end gap-4 ">
          {/* <MuiButton
            className="btn-outlined"
            title="Back"
            onClick={() => {
              router.back();
            }}
          /> */}
          <Button
            title={"Update"}
            type="submit"
            onClick={() => {
              // setOpenDialog("delete");
            }}
            loading={loading}
            className="btn-solid"
            // loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default Profile;
