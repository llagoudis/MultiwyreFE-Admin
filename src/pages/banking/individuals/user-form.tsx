import React, { Fragment, useEffect, useState, useRef } from "react";
import Button from "~/components/common/Button";
import Header from "~/components/common/Header";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import { BsPlus } from "react-icons/bs";
import { Controller, useForm } from "react-hook-form";
import SelectComponent from "~/components/common/SelectComponent";
import {
  Autocomplete,
  Checkbox,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import emailAdd from "~/assets/general/email_add.svg";
import phoneAdd from "~/assets/general/phone_add.svg";
import Image, { type StaticImageData } from "next/image";
import MuiDataGrid from "~/components/common/MuiDataGrid";
import RemoveIcon from "~/assets/general/RemoveIcon.svg";
import {
  roles,
  verificaficationStatusList,
  verificationLevels,
} from "~/data/country";
import { useRouter } from "next/router";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import MuiButton from "~/components/common/Button";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { updateUser, addUser } from "~/service/ApiRequests";
import toast from "react-hot-toast";
import { useGlobalStore } from "~/store";
import { convertWord, countryFlags, formatDate } from "~/common/functions";
import DefaultProfile from "~/assets/images/defaultProfileImage.png";
import ca from "~/assets/countryCodes/ca.svg";
const accountStatus = [
  { label: "Active", value: "Active" },
  { label: "Suspended", value: "Suspended" },
  { label: "Terminated", value: "Terminated" }, // Add more statuses if needed
];

const accountStatusReason = [
  { label: "None", value: "None" },
  { label: "Document Expired", value: "Document Expired" },
  { label: "Threshold Reached", value: "Threshold Reached" },
  { label: "Financial Monitoring", value: "Financial Monitoring" },
  { label: "Industrial chemicals", value: "Industrial chemicals" },
  { label: "KYC", value: "KYC" },
];

type formData = {
  azureId: string;
  file: any;
  firstname: number;
  lastname: string;
  clientId: string;
  dob: string;
  gender: string;
  nationality: string;
  language: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  personal_limit: string;
  personType: string;
  value: string;
  email: string;
  phone: string;
  phone_number: number;
  defaultCurrency: string;
  verificationStatus: string;
  verificationLevel: number;
  verification_state: string;
  password: string;
  confirmedPassword: string;
  roles: string;
  member_of_access_groups: string;
  accountStatus: string;
  accountStatusReason: string;
  // ContactDetails: any;
  countryCode: any;
};

interface contact {
  type: string;
  id: number;
  isPrimary: boolean;
  value: string;
  status: string;
}
const businessTypes = [
  { label: "Internal", value: "internal" },
  { label: "External", value: "external" },
];

const genderTypes = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const UserForm = () => {
  const router = useRouter();
  const userId = router.query?.id as string;
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [countries] = useAsyncMasterStore("countries");
  const [languages] = useAsyncMasterStore("languages");
  const [assets] = useAsyncMasterStore("assets");

  const filteredAssets = assets.filter(
    (asset) => asset.fireblockAssetId !== "USD",
  );

  const [pricelist] = useAsyncMasterStore("priceList");
  const [limitList] = useAsyncMasterStore("limitList");

  const userPricelist: PriceList[] = pricelist.filter(
    (pl: PriceList) => pl.clientType === "user",
  );

  const userLimitlist: Limits[] = limitList.filter(
    (pl: Limits) => pl.clientType === "user",
  );

  userPricelist.sort((a, b) => a.name.localeCompare(b.name));

  const formattedData = () => {
    if (countries?.length > 0) {
      const uniqueList = new Map();

      countries.forEach((val: DropDownOptionsResponseType) => {
        const value = val?.countryCode ?? "";
        const label = `+${val?.countryCode}`;
        const flag = countryFlags.find(
          (obj) => obj.countryCode === Number(val.countryCode),
        )?.flag;

        // Add to Map to ensure uniqueness
        uniqueList.set(value, { value, label, flag });
      });

      // Convert Map back to array
      const finalList = Array.from(uniqueList.values());
      finalList.sort((a, b) => a.value - b.value);

      return finalList;
    }
  };

  const countriesWithFlags: DropDownOptionsType[] = formattedData() ?? [];

  const [userDetails, getUser] = useGlobalStore((state) => [
    state.persons,
    state.getPerson,
  ]);

  const initialValues = {
    language: "English",

    personType: "external",

    defaultCurrency: "Euro",
    customPriceList: 1,

    verificationStatus: "SUBMITTED",
    verificationLevel: 1,
    // roles: "ex_user",
    countryCode: 1,
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<formData>({
    defaultValues: initialValues,
  });

  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deleteContact, setDeleteContact] = useState<number[]>([]);
  const [newAzureId, setNewAzureId] = useState<string>("");

  // value rows
  const [emailRows, setEmailRows] = useState<contact[]>([]);

  // phone rows
  const [phoneRows, setPhoneRows] = useState<contact[]>([]);

  const [countryCode, setCountryCode] = useState<any>("");

  const submitData = async (userData: formData) => {
    setLoading(true);

    let requestBody = {
      ...userData,
      file,
      azureId: userId,

      dob: formatDate(userData?.dob),
      active: userData.accountStatus === "Active",
      reasonForRejection: userData.accountStatusReason,
      deleteContact: JSON.stringify(deleteContact),
      // contactDetails: JSON.stringify([
      //   ...emailRows.map((obj) => ({
      //     ...obj,
      //     status: obj.status.replace(" ", "_").toUpperCase(),
      //   })),
      //   ...phoneRows.map((obj) => ({
      //     ...obj,
      //     status: obj.status.replace(" ", "_").toUpperCase(),
      //   })),
      // ]),
      // email: emailRows.find((obj) => obj.isPrimary)?.value,
      // phone: phoneRows.find((obj) => obj.isPrimary)?.value,
    };

    if (countryCode) {
      requestBody = { ...requestBody, countryCode: countryCode };
    }

    const [data, error] = userId
      ? await updateUser(requestBody)
      : await addUser(requestBody);

    if (error) {
      toast.error(error);
    }

    if (data?.success) {
      setNewAzureId(data.body?.azureId);
      setOpenDialog(true);
    }
    setLoading(false);
  };

  const onSubmit = (data: formData) => {
    // const primaryEmail =
    //   emailRows.findIndex((obj: any) => obj.isPrimary) === -1;
    // const primaryPhone =
    //   phoneRows.findIndex((obj: any) => obj.isPrimary) === -1;

    // if (primaryEmail || primaryPhone) {
    //   primaryEmail && setEmailError("Atleast one email should be primary");
    //   primaryPhone && setPhoneError("Atleast one phone should be primary");
    // } else {
    void submitData(data);
    // }
  };

  // value add function
  const handleAddEmail = (newEmail: string) => {
    const newEmailRow = {
      id: emailRows.length + 1,
      value: newEmail,
      status: "Request Sent",
      isPrimary: emailRows.length === 0,
      type: "EMAIL",
    };
    const newRows = [...emailRows, newEmailRow];
    setEmailRows(newRows);
  };

  // add phone number
  const handleAddPhone = (newNumber: any) => {
    const newPhoneRow = {
      id: phoneRows.length + 1,
      value: newNumber,
      status: "Request Sent",
      isPrimary: phoneRows.length === 0 ? true : false,
      type: "PHONE",
      countryCode: countryValue,
    };
    const newRows = [...phoneRows, newPhoneRow];
    setPhoneRows(newRows);
  };

  // remove value from table
  const handleRemoveEmail = (id: number) => {
    const updatedRows = emailRows.filter((row) => row.id !== id);
    setEmailRows(updatedRows);
  };

  // remove phone from table
  const handleRemovePhone = (id: number) => {
    const updatedRows = phoneRows.filter((row) => row.id !== id);
    setPhoneRows(updatedRows);
  };

  // value datagrid rows
  const emailColumns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "value",
      headerName: "Email",
      flex: 2,
      renderCell: (params: { row: { value: string } }) => (
        <>{params?.row?.value}</>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params: { row: { status: string; value: string } }) => (
        <>
          <Autocomplete
            options={["Request Sent", "Active", "Inactive"]}
            value={convertWord(params?.row?.status) ?? ""}
            size="small"
            className="w-full"
            onChange={(event, newValue) => {
              setEmailRows((prev) =>
                prev.map((item) => ({
                  ...item,
                  status:
                    item.value === params?.row?.value
                      ? newValue ?? item.status
                      : item.status,
                })),
              );
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" />
            )}
          />
        </>
      ),
      flex: 2,
    },
    {
      field: "isPrimary",
      headerName: "Primary",
      flex: 1,
      renderCell: (params: {
        row: { isPrimary: boolean; value: string; id: number; status: string };
      }) => (
        <Checkbox
          style={{ color: "black" }}
          checked={params.row?.isPrimary}
          size="small"
          onChange={(e: any) => {
            if (e.target.checked) {
              setEmailError("");
              setEmailRows((prev) =>
                prev.map((item) => ({
                  ...item,
                  isPrimary: params.row?.value === item.value,
                })),
              );
            } else {
              setEmailRows((prev) =>
                prev.map((item) => ({
                  ...item,
                  isPrimary: false,
                })),
              );
            }
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      renderCell: (params: { row: { id: number; uniqueId: number } }) => (
        <>
          <Image
            onClick={() => {
              if (params.row?.uniqueId) {
                setDeleteContact((current) => [
                  ...current,
                  params.row?.uniqueId,
                ]);
              }
              handleRemoveEmail(params.row.id);
            }}
            className="cursor-pointer"
            src={RemoveIcon as StaticImageData}
            alt=""
          />
        </>
      ),
    },
  ];

  // phone number columns
  const phoneColumns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "value",
      headerName: "Phone number",
      flex: 2,

      renderCell: (params: { row: { value: string } }) => (
        <>
          {userDetails?.countryCode} {params?.row?.value}
        </>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params: { row: { status: string; value: string } }) => (
        <Autocomplete
          options={["Request Sent", "Active", "Inactive"]}
          value={convertWord(params?.row?.status) ?? ""}
          size="small"
          className="w-full"
          onChange={(event, newValue) => {
            setPhoneRows((prev) =>
              prev.map((item) => ({
                ...item,
                status:
                  item.value === params?.row?.value
                    ? newValue ?? item.status
                    : item.status,
              })),
            );
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" />}
        />
      ),
      flex: 2,
    },
    {
      field: "isPrimary",
      headerName: "Primary",
      flex: 1,
      renderCell: (params: { row: { isPrimary: boolean; value: string } }) => (
        <Checkbox
          style={{ color: "black" }}
          checked={params.row?.isPrimary}
          size="small"
          onChange={(e: any) => {
            if (e.target.checked) {
              setPhoneError("");
              setPhoneRows((prev) =>
                prev.map((obj) => ({
                  ...obj,
                  isPrimary: params.row?.value === obj.value,
                })),
              );
            } else {
              setPhoneRows((prev) =>
                prev.map((obj) => ({
                  ...obj,
                  isPrimary: false,
                })),
              );
            }
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      flex: 1,
      renderCell: (params: { row: { id: number; uniqueId: number } }) => (
        <>
          <Image
            onClick={() => {
              if (params.row?.uniqueId) {
                setDeleteContact((current) => [
                  ...current,
                  params.row?.uniqueId,
                ]);
              }
              handleRemovePhone(params.row.id);
            }}
            className="cursor-pointer"
            src={RemoveIcon as StaticImageData}
            alt=""
          />
        </>
      ),
    },
  ];

  // ADD EMAIL FUNCTION
  const handleEmailClick = () => {
    const newEmail =
      (document.getElementById("emailTextField") as HTMLInputElement)?.value ||
      "";

    if (newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(newEmail)) {
        setEmailError("");
        emailRows.findIndex((obj: any) => obj.value === newEmail) === -1 &&
          handleAddEmail(newEmail);
        // Optionally, you can clear the input field after adding the value
        (document.getElementById("emailTextField") as HTMLInputElement).value =
          "";
      } else {
        setEmailError("Invalid email");
      }
    }
  };

  // ADD PHONE NUMBER
  const handlePhoneClick = () => {
    const newMobile =
      (document.getElementById("phoneTextField") as HTMLInputElement)?.value ||
      "";
    if (newMobile) {
      handleAddPhone(newMobile);
      // if (newMobile.length === 10) {
      //   setPhoneError("");
      //   phoneRows.findIndex((obj: any) => obj.value === newMobile) === -1 &&
      //   // Optionally, you can clear the input field after adding the value
      //   (document.getElementById("phoneTextField") as HTMLInputElement).value =
      //     "";
      // } else {
      //   setPhoneError("Mobile number should be 10 digits");
      // }
    }
  };

  function formatAndCapitalize(str: ContactDetails["status"]) {
    // Split the string into an array of words using underscore as the delimiter
    const words = str.split("_");

    // Capitalize each word in the array
    const capitalizedWords = words.map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );

    // Join the capitalized words back into a single string
    const result = capitalizedWords.join(" ");

    return result;
  }

  const populateUser = () => {
    const {
      UserVerification,
      // ContactDetails,
      firstname,
      lastname,
      id,
      dob,
      gender,
      nationality,
      language,
      defaultCurrency,
      azureId,
      priceList,
      limitList,
      personType,
      active,
      reasonForRejection,
      verificationStatus,
      verificationLevel,
      roles,
      email,
      phone,
      countryCode,
    } = userDetails;

    let responseData: any = {
      UserVerification,
      // ContactDetails,
      firstname,
      lastname,
      id,
      dob,
      gender,
      nationality,
      language,
      defaultCurrency: defaultCurrency ? defaultCurrency : "EUR",
      azureId,
      verificationStatus,
      verificationLevel,
      customPriceList: priceList,
      limitList: limitList,
      personType,
      accountStatus: active ? "Active" : "Suspended",
      accountStatusReason: reasonForRejection,
      roles,
      email,
      phone,
      countryCode,
    };

    if (responseData.UserVerification) {
      const { city, state, country, addressLine1, addressLine2, postalCode } =
        responseData?.UserVerification;
      responseData = {
        ...responseData,
        city,
        state,
        country,
        addressLine1,
        addressLine2,
        postalCode,
      };
    }

    // if (responseData.ContactDetails?.length > 0) {
    //   responseData = {
    //     ...responseData,
    //     ContactDetails: ContactDetails.map((contact) => {
    //       const { type, value, isPrimary, status } = contact;
    //       return {
    //         uniqueId: contact.id,
    //         type,
    //         value,
    //         isPrimary,
    //         status: formatAndCapitalize(status),
    //       };
    //     }),
    //   };
    // }

    reset(responseData as formData);
  };

  useEffect(() => {
    if (userId && userDetails.azureId && userDetails.azureId === userId) {
      populateUser();
      // if (userDetails.ContactDetails?.length > 0) {
      //   setEmailRows(
      //     userDetails?.ContactDetails?.filter(
      //       (obj) => obj.type === "EMAIL",
      //     ).map((obj, index: number) => ({
      //       ...obj,
      //       uniqueId: obj.id,
      //       id: index + 1,
      //     })),
      //   );
      //   setPhoneRows(
      //     userDetails?.ContactDetails?.filter(
      //       (obj) => obj.type === "PHONE",
      //     ).map((obj, index: number) => ({
      //       ...obj,
      //       uniqueId: obj.id,
      //       id: index + 1,
      //     })),
      //   );
      // }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userDetails.azureId]);

  useEffect(() => {
    if (userId && userId !== userDetails.azureId) {
      void getUser(userId);
    }
  }, [userId, getUser, userDetails.azureId]);

  const handleCountryChange = (e: any) => {
    setCountryCode(e.target.value);
  };

  const countryId = watch("countryCode");

  const countryValue = countriesWithFlags?.find(
    (item) => Number(item.value) === Number(countryId),
  ) ?? {
    flag: ca,
    label: "+1",
    value: 1,
  };

  return (
    <Fragment>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-8 mt-4 flex flex-col gap-3"
      >
        <Header head={userId ? "Edit Individual" : "Add new Individual"} />

        <HeaderLayout name={"Upload Picture"}>
          <div className="flex justify-between">
            {userId ? (
              <Image
                alt={"Profile"}
                className="rounded-full object-cover"
                src={userDetails.profileImgLink || DefaultProfile}
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
                      title={userId ? "Upload a new picture" : "Upload"}
                    >
                      <input
                        id="fileInput"
                        ref={filePickerRef}
                        type="file"
                        className="hidden"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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

        <HeaderLayout name={"Personal Details"}>
          <div className="grid grid-cols-3 gap-x-5 gap-y-0">
            <InputComponent
              control={control}
              errors={errors}
              label="First name"
              required={true}
              name="firstname"
              rules={{ required: "First Name is required" }}
              type="text"
              watch={watch}
            />
            <InputComponent
              control={control}
              errors={errors}
              label="Last name"
              name="lastname"
              required={true}
              rules={{ required: "Last name is required" }}
              type="text"
              watch={watch}
            />

            {userId && (
              <InputComponent
                control={control}
                errors={errors}
                label="Client ID"
                name="id"
                disabled
                type="text"
                watch={watch}
              />
            )}

            <SelectComponent
              control={control}
              options={businessTypes}
              label="Person type"
              name="personType"
              required={true}
              rules={{ required: "Person type is required" }}
            />
            <InputComponent
              control={control}
              errors={errors}
              label="Birthdate"
              name="dob"
              required={true}
              rules={{ required: "Birthdate is required" }}
              watch={watch}
              type="date"
              max={new Date().toISOString().split("T")[0]}
            />

            <SelectComponent
              control={control}
              options={genderTypes}
              label="Gender"
              name="gender"
              required={true}
              rules={{ required: "Gender is required" }}
            />
            <SelectComponent
              control={control}
              options={countries?.map((val: any) => ({
                value: val.name,
                label: val.name,
              }))}
              label="Nationality"
              name="nationality"
              required={true}
              rules={{ required: "Nationality is required" }}
            />

            <SelectComponent
              control={control}
              options={languages?.map((val: any) => ({
                value: val.name,
                label: val.name,
              }))}
              label="Language"
              name="language"
              required={true}
              rules={{ required: "Language is required" }}
            />
          </div>
        </HeaderLayout>
        <div className=" grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <HeaderLayout name={"Location details"}>
              <div className="flex justify-between gap-4">
                <SelectComponent
                  control={control}
                  options={countries?.map((val: any) => ({
                    value: val.id,
                    label: val.name,
                  }))}
                  required={true}
                  label="Country"
                  name="country"
                  rules={{ required: "Country is required" }}
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  type="text"
                  watch={watch}
                  required={true}
                  label="City"
                  name="city"
                  rules={{ required: "City is required" }}
                />
              </div>

              <div className="flex justify-between gap-4">
                <InputComponent
                  control={control}
                  type="text"
                  errors={errors}
                  label="State"
                  watch={watch}
                  rules={{ required: "City is required" }}
                  name="state"
                />

                <InputComponent
                  control={control}
                  errors={errors}
                  label="Postal code"
                  name="postalCode"
                  required={true}
                  rules={{ required: "Postal Code is required" }}
                  type="text"
                  watch={watch}
                />
              </div>

              <div className="flex justify-between gap-4">
                <InputComponent
                  control={control}
                  errors={errors}
                  required={true}
                  label="Address line 1"
                  name="addressLine1"
                  type="text"
                  rules={{ required: "Address is required" }}
                />

                <InputComponent
                  control={control}
                  errors={errors}
                  label="Address line 2"
                  name="addressLine2"
                  type="text"
                />
              </div>
            </HeaderLayout>
            <HeaderLayout
              name={"Settings"}
              enabled={"Skip transfer pre-approval"}
            >
              <SelectComponent
                control={control}
                options={[
                  { value: "EUR", label: "Euro" },
                  ...filteredAssets?.map((val: any) => ({
                    value: val.name,
                    label: val.name,
                  })),
                ]}
                required={true}
                label="Default currency"
                name="defaultCurrency"
                rules={{ required: "Default currency list is required" }}
              />
              <SelectComponent
                control={control}
                options={userPricelist}
                valueKey="id"
                labelKey="name"
                label="Custom price list"
                name="customPriceList"
                rules={{ required: "Custom price list is required" }}
              />

              <SelectComponent
                control={control}
                options={userLimitlist}
                valueKey="id"
                labelKey="name"
                label="Custom Limit list"
                name="limitList"
                rules={{ required: "Custom Limit is required" }}
              />
            </HeaderLayout>

            <HeaderLayout name={"Security"}>
              <div className="grid grid-cols-2 gap-x-4">
                <SelectComponent
                  control={control}
                  options={verificaficationStatusList}
                  required={true}
                  label="Verification status"
                  name="verificationStatus"
                  // rules={{ required: "Verification status list is required" }}
                />
                <SelectComponent
                  control={control}
                  options={verificationLevels}
                  required={true}
                  label="Verification level"
                  name="verificationLevel"
                  // rules={{ required: "Verification level list is required" }}
                />
                {userId && (
                  <>
                    <div className=" col-span-2">
                      <SelectComponent
                        control={control}
                        options={accountStatus}
                        required={true}
                        label="Account status"
                        name="accountStatus"
                        rules={{ required: "Account Status is required" }}
                      />
                    </div>

                    <div className=" col-span-2">
                      <SelectComponent
                        control={control}
                        options={accountStatusReason}
                        required={true}
                        label="Account status reason"
                        name="accountStatusReason"
                        rules={{
                          required: "Account Status Reason is required",
                        }}
                      />
                    </div>
                  </>
                )}
                <InputComponent
                  control={control}
                  errors={errors}
                  required={true}
                  label="Password"
                  name="password"
                  rules={{
                    ...(userId
                      ? {
                          validate: (value: string) => {
                            if (value) {
                              const hasSmallLetter = /[a-z]/.test(value);
                              const hasCapitalLetter = /[A-Z]/.test(value);
                              const hasNumber = /\d/.test(value);
                              const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(
                                value,
                              );

                              return (
                                (value.length >= 6 &&
                                  hasSmallLetter &&
                                  hasCapitalLetter &&
                                  hasNumber &&
                                  hasSymbol) ||
                                "Password should meet the specified criteria"
                              );
                            } else {
                              return true;
                            }
                          },
                        }
                      : {
                          required: "Password is required",
                          validate: (value: string) =>
                            value.length >= 8 ||
                            "Password should be at least 8 characters long",
                        }),
                  }}
                  watch={watch}
                  type="password"
                />

                <InputComponent
                  control={control}
                  errors={errors}
                  required={true}
                  label="Confirmed password"
                  name="confirmedPassword"
                  rules={{
                    ...(userId
                      ? {
                          validate: {
                            matchesPreviousPassword: (value: string) => {
                              const { password } = watch();
                              if (password) {
                                return (
                                  password === value || "Passwords do not match"
                                );
                              } else {
                                return true;
                              }
                            },
                          },
                        }
                      : {
                          required: "Confirmed Password is required",
                          validate: {
                            matchesPreviousPassword: (value: string) => {
                              const { password } = watch();
                              return (
                                password === value || "Passwords do not match"
                              );
                            },
                          },
                        }),
                  }}
                  watch={watch}
                  type="password"
                />

                <SelectComponent
                  control={control}
                  options={roles}
                  label="Access roles"
                  name="roles"
                  valueKey="value"
                />
                <InputComponent
                  control={control}
                  errors={errors}
                  label="Member of access groups "
                  name="member_of_access_groups"
                  watch={watch}
                  type="text"
                />
              </div>
            </HeaderLayout>
          </div>
          <div className="flex flex-col gap-4">
            <HeaderLayout name={"Limit Pack"}>
              <SelectComponent
                control={control}
                options={businessTypes}
                label="Personal type limit"
                name="personal_type_limit"
              />
            </HeaderLayout>

            <HeaderLayout name={"Contacts"}>
              <div className="flex items-center rounded ">
                <div className="mt-6">
                  <Controller
                    control={control}
                    name="countryCode"
                    // rules={{
                    //   required: "Please select an country code",
                    // }}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <Fragment>
                        <Autocomplete
                          size="small"
                          className="w-[150px]"
                          options={countriesWithFlags}
                          onChange={(_, nextValue) => {
                            onChange(nextValue?.value ?? "");
                          }}
                          disableClearable
                          value={countryValue ? countryValue : undefined}
                          // value={
                          //   countriesWithFlags.find(
                          //     (country) =>
                          //       Number(country.value) === Number(value),
                          //   ) ?? undefined
                          // }
                          renderOption={(props, option) => (
                            <li
                              {...props}
                              className="flex cursor-pointer items-center gap-2 p-2"
                            >
                              <Image
                                src={option.flag ?? ""}
                                alt={option.label}
                                width={30}
                                height={30}
                              />
                              {option.label}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              className=" flex items-center gap-2  "
                              {...params}
                              placeholder="Country "
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (() => {
                                  return (
                                    <Fragment>
                                      {countryValue?.label && (
                                        <Image
                                          className="ml-2 h-5 w-4"
                                          src={countryValue?.flag ?? ""}
                                          alt={countryValue?.label ?? ""}
                                          width={30}
                                          height={30}
                                        />
                                      )}
                                    </Fragment>
                                  );
                                })(),
                              }}
                              variant="outlined"
                            />
                          )}
                        />
                        <p className="text-sm text-red-500">{error?.message}</p>
                      </Fragment>
                    )}
                  />
                </div>

                <InputComponent
                  control={control}
                  label="Phone"
                  name="phone"
                  type="tel"
                  required={true}
                  rules={{ required: "Phone is required" }}
                />
              </div>

              <InputComponent
                control={control}
                label="Email"
                required={true}
                rules={{ required: "Email is required" }}
                name="email"
                type="email"
              />
            </HeaderLayout>
            {/* <HeaderLayout name={"Contact details"}>
              <div className="mt-3 w-full">
                <label htmlFor={"value"} className="mb-1 block text-[#1F1F1F]">
                  Email Id
                </label>

                <TextField
                  size="small"
                  id="emailTextField"
                  className="rounded border"
                  minRows={10}
                  type="value"
                  required={emailRows.length === 0}
                  style={{ width: "100%", resize: "none" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        onClick={() => {
                          if (emailRows.length < 1) {
                            handleEmailClick();
                          }
                        }}
                      >
                        <Image
                          className="cursor-pointer"
                          src={emailAdd as StaticImageData}
                          alt=""
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <span className="m-2 text-sm text-red-500">{emailError}</span>

              <MuiDataGrid
                storageName="emailRows"
                hideFooterPagination={true}
                rows={emailRows}
                columns={emailColumns}
                columnVisibilityModel={{ id: false }}
                disableRowSelectionOnClick
              />

              <div className="mt-3 w-full">
                <label
                  htmlFor={"phone_number"}
                  className="mb-1 block text-[#1F1F1F]"
                >
                  Phone number
                </label>

                <div className="flex items-center rounded ">
                  <div className="  ">
                    <Controller
                      control={control}
                      name="countryCode"
                      rules={{
                        required: "Please select an asset",
                      }}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <Fragment>
                          <Autocomplete
                            size="small"
                            className="w-[150px]"
                            options={countriesWithFlags}
                            onChange={(_, nextValue) => {
                              onChange(nextValue?.value ?? "");
                            }}
                            disableClearable
                            value={countryCode ? countryCode : undefined}
                            renderOption={(props, option) => (
                              <li
                                {...props}
                                className="flex cursor-pointer items-center gap-2 p-2"
                              >
                                <Image
                                  src={option.flag ?? ""}
                                  alt={option.label}
                                  width={30}
                                  height={30}
                                />
                                {option.label}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                className=" flex items-center gap-2  "
                                {...params}
                                placeholder="Country "
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (() => {
                                    return (
                                      <Fragment>
                                        {countryValue?.label && (
                                          <Image
                                            className="ml-2 h-5 w-4"
                                            src={countryValue?.flag ?? ""}
                                            alt={countryValue?.label ?? ""}
                                            width={30}
                                            height={30}
                                          />
                                        )}
                                      </Fragment>
                                    );
                                  })(),
                                }}
                                variant="outlined"
                              />
                            )}
                          />
                          <p className="text-sm text-red-500">
                            {error?.message}
                          </p>
                        </Fragment>
                      )}
                    />
                  </div>
                  <TextField
                    size="small"
                    id="phoneTextField"
                    type="number"
                    className="rounded border "
                    required={phoneRows.length === 0}
                    minRows={10}
                    style={{ width: "100%", resize: "none" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          position="end"
                          onClick={() => {
                            if (phoneRows.length < 1) {
                              handlePhoneClick();
                            }
                          }}
                        >
                          <Image
                            className="cursor-pointer"
                            src={phoneAdd as StaticImageData}
                            alt=""
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </div>
              <span className="m-2 text-sm text-red-500">{phoneError}</span>
              <MuiDataGrid
                storageName="phoneRows"
                hideFooterPagination={true}
                rows={phoneRows}
                columns={phoneColumns}
                columnVisibilityModel={{ id: false }}
                disableRowSelectionOnClick
              />
            </HeaderLayout> */}
          </div>
        </div>

        <div className="flex w-full justify-end gap-4 px-3">
          <MuiButton
            className="btn-outlined"
            title="Back"
            onClick={() => {
              router.back();
            }}
          />
          <Button
            title={userId ? "Update details" : "Add new Individual"}
            type="submit"
            onClick={() => {
              // setOpenDialog("delete");
            }}
            className="btn-solid"
            loading={loading}
          />
        </div>
      </form>
      <DailogBox
        maxWidth={"xs"}
        open={openDialog}
        handleClose={() =>
          void router.push(`/banking/individuals/view/${userId ?? newAzureId}`)
        }
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            {userId
              ? "Details updated successfully"
              : "User created successfully"}
          </h1>
          <p>
            {userId
              ? "The  user details was successfully updated"
              : "The new user creation was successfull"}
          </p>

          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={() =>
              void router.push(
                `/banking/individuals/view/${userId ?? newAzureId}`,
              )
            }
          />
        </div>
      </DailogBox>
    </Fragment>
  );
};

export default UserForm;
