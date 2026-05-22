import React, { useState, useEffect, Fragment, useRef, useMemo } from "react";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { useRouter } from "next/router";
import { Controller, useController, useForm, useWatch } from "react-hook-form";
import { createCompany, getCompanyById, updateCompany } from "~/service/api";
import { useCompanyStore, useGlobalStore } from "~/store";
import { Toaster } from "react-hot-toast";
import Image, { type StaticImageData } from "next/image";
import Button from "~/components/common/Button";
import Header from "~/components/common/Header";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import Pluse from "~/assets/general/Add_Plus.svg";
import SelectComponent from "~/components/common/SelectComponent";
import DailogBox from "~/components/common/DailogBox";
import checkicon from "~/assets/general/check-one.svg";
import {
  roles,
  verificaficationStatusList,
  verificationLevels,
} from "~/data/country";
import { BsPlus } from "react-icons/bs";
import DefaultProfile from "~/assets/images/defaultProfileImage.png";
import { ApiHandler } from "~/service/UtilService";
import { fetchUsers } from "~/service/ApiRequests";
import { Autocomplete, TextField } from "@mui/material";
import { Debounce, countryFlags } from "~/common/functions";
import ca from "~/assets/countryCodes/ca.svg";
const initalFormState: CompanyFormType = {
  companyName: "",
  companyEmail: "",
  userId: "",
  phone: "",
  countryCode: 1,
  companyUrl: "",
  companyType: "",
  beneficialOwnerType: "2",
  beneficialOwnerPosition: "",
  clientId: "",
  registrationNumber: "",
  incorporationDate: "",
  natureOfBusiness: "",
  country: NaN,
  state: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  otherNatureOfBusiness: "",
  taxIdentificationNumber: "",
  sameOperatingAddress: false,
  operatingJurisdiction: "",
  operatingState: "",
  operatingAddressCity: "",
  operatingAddressAddressLine1: "",
  operatingAddressAddressLine2: "",
  operatingAddressPostalCode: "",
  reasonForRejection: "None",
  verificationStatus: "SUBMITTED",
  accountStatus: "Active",
  verificationLevel: 1,
  file: null,
  incomingPayments: "",
  outgoingPayments: "",
  frequency: "",
  monthlyRemittanceVolume: "",
  paymentFromCountry1: "",
  paymentFromCountry2: "",
  paymentFromCountry3: "",
  paymentToCountry1: "",
  paymentToCountry2: "",
  paymentToCountry3: "",
  password: "",
  confirmedPassword: "",
  roles: "ex_user",
  priceList: NaN,
  limitList: NaN,
};

type Owner = {
  userId: string;
  fullname: string;
};

const businessTypes = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
];

const verificationStatus = [
  { label: "Not verified", value: "PENDING" },
  { label: "Documents submitted", value: "SUBMITTED" },
  { label: "Identified", value: "APPROVED" },
];

const statusReason = [
  { label: "None", value: "None" },
  { label: "Document expired", value: "Document expired" },
  { label: "Threshold reached", value: "Threshold reached" },
  { label: "Financial monitoring", value: "Financial monitoring" },
  { label: "Kyc", value: "Kyc" },
];
const statusTypes = [
  { label: "Active", value: "Active" },
  { label: "Suspended", value: "Suspended" },
  { label: "Blocked", value: "Blocked" },
];

const beneficial_owner_type = [
  { label: "Ultimate beneficial owner", value: "1" },
  { label: "Shareholder", value: "2" },
  { label: "Representative", value: "3" },
];

const CompanyForm = () => {
  const company = useGlobalStore((state) => state.company.company);

  const router = useRouter();
  const companyId = router.query.id as string;

  const [businessNature] = useAsyncMasterStore("businessNature");
  //
  const [countries] = useAsyncMasterStore("countries");
  const [paymentTypes] = useAsyncMasterStore("paymentTypes");
  const [frequency] = useAsyncMasterStore("frequency");
  const [monthlyRemmitance] = useAsyncMasterStore("monthlyRemmitance");
  const [pricelist] = useAsyncMasterStore("priceList");
  const [limitList] = useAsyncMasterStore("limitList");

  const companyPricelist = pricelist.filter(
    (pl: PriceList) => pl.clientType === "company",
  );

  const companyLimitlist = limitList.filter(
    (pl: PriceList) => pl.clientType === "company",
  );

  const [file, setFile] = useState<any>(null);

  const filePickerRef = useRef<HTMLInputElement>(null);

  const [openDialog, setOpenDialog] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    reset,
    watch,
    setValue,
  } = useForm<CompanyFormType>({
    defaultValues: initalFormState,
  });

  const {
    field: { onChange },
  } = useController({ control, name: "sameOperatingAddress" });

  const sameOperatingAddress = useWatch({
    control,
    name: "sameOperatingAddress",
  });

  const companyName = useWatch({
    control,
    name: "companyName",
  });

  const onSubmit = async (values: CompanyFormType) => {
    //
    const companyForm = new FormData();
    values = {
      ...values,
      monthlyRemittanceVolume: 2,
      file,
    };

    Object.keys(values).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      companyForm.append(key, values[key]);
    });

    if (companyId) {
      await updateCompany(companyId, companyForm).then(([res]) => {
        if (res?.success) {
          const { CompanyEntityInfo, ...company } = res.body;

          useCompanyStore.setState((prev) => {
            const nextState = { ...prev };

            nextState.company = Object.assign({}, nextState.company, company);
            nextState.company.CompanyEntityInfo = Object.assign(
              {},
              nextState.company.CompanyEntityInfo,
              CompanyEntityInfo,
            );

            return nextState;
          });
          setOpenDialog(true);
        }
      });
    } else {
      await createCompany(companyForm).then(([res]) => {
        if (res?.success) {
          setOpenDialog(true);
        }
      });
    }
  };
  const [users, setUsers] = useState<Owner[]>([]);
  const [filterdUsers, setFiltredUsers] = useState<Owner[]>([]);

  const getUsers = async () => {
    const [data, error]: APIResult<User[]> = await ApiHandler(fetchUsers);

    if (data?.success) {
      const filterd = data?.body
        ?.filter(({ userType }) => userType !== "COMPANY")
        ?.map(({ azureId, firstname, lastname }) => ({
          userId: azureId,
          fullname: `${firstname} ${lastname}`,
        }));

      setUsers(filterd);
    }
  };

  useEffect(() => {
    // if (companyId && String(company.id) !== companyId) {
    if (companyId) void getCompanyById(companyId);
    // }

    void getUsers();
  }, [companyId]);

  useEffect(() => {
    const getFormValue = () => {
      if (String(company.id) == companyId) {
        const { CompanyPaymentsInfo, CompanyEntityInfo, ...nextValues } =
          company;

        const currentNeeded: KeyString = {
          ...nextValues,
          ...CompanyEntityInfo,
          ...CompanyPaymentsInfo,
        };

        const filteredValue: KeyString = {};

        Object.keys(initalFormState).forEach((key) => {
          if (key !== "id") {
            filteredValue[key] = currentNeeded[key];
          }
        });

        return {
          ...filteredValue,
          companyId,
          // priceList: nextValues.priceList,
          roles: nextValues?.UserCompanyAssociations[0]?.User?.roles,
          countryCode: nextValues.countryCode ?? 1,
        };
      }

      return {};
    };

    reset(getFormValue());
  }, [company, companyId, reset]);

  const handleInputChange = Debounce((_: any, inputValue: string) => {
    if (inputValue?.toLowerCase()) {
      const filtered = users.filter((option) => {
        return option.fullname
          .toLowerCase()
          .includes(inputValue?.toLowerCase());
      });

      setFiltredUsers(filtered);
    } else {
      setFiltredUsers([]);
    }
  }, 500);

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

  const countryId = watch("countryCode");

  const countriesWithFlags: DropDownOptionsType[] = formattedData() ?? [];

  const countryValue = countriesWithFlags?.find(
    (item) => Number(item.value) === Number(countryId),
  ) ?? {
    flag: ca,
    label: "+1",
    value: 1,
  };

  return (
    <Fragment>
      <Toaster />
      <div className=" mt-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="my-4 flex flex-col gap-3"
        >
          <Header head={companyId ? "Edit Company" : "Add new Company"} />
          <HeaderLayout name={"Upload Picture"}>
            <div className="flex justify-between">
              {companyId ? (
                <Image
                  alt={"Profile"}
                  className="rounded-full object-cover"
                  src={company?.profileImageUrl || DefaultProfile}
                  width={"100"}
                  height={"100"}
                />
              ) : (
                <p>Choose a file to upload</p>
              )}{" "}
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
                        title={companyId ? "Upload a new picture" : "Upload"}
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

          <HeaderLayout name={"Company Details"}>
            <div className="flex justify-between gap-4">
              {companyId && (
                <InputComponent
                  control={control}
                  label="Client ID"
                  name="companyId"
                  rules={{ required: "Client ID is required" }}
                  type="text"
                  disabled
                />
              )}

              <InputComponent
                control={control}
                label="Company type"
                name="companyType"
                // rules={{ required: "Company Type is required" }}
                type="text"
              />

              {/* <InputComponent
                control={control}
                label="Owner"
                name="owner"
                required={true}
                rules={{ required: "Owner is required" }}
                type="text"
              /> */}

              {/* <SelectComponent
                control={control}
                options={users}
                labelKey="fullname"
                valueKey="id"
                label="Owner"
                name="owner"
                required={true}
                rules={{
                  required: "Owner is required",
                }}
              /> */}

              <div className="mb-4 mt-3 w-full">
                <label htmlFor={"account"} className="subText mb-1 block">
                  {"Owner *"}{" "}
                </label>

                <Controller
                  control={control}
                  name="userId"
                  rules={{
                    required: "Owner is required",
                  }}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <Fragment>
                      <Autocomplete
                        size="small"
                        id="combo-box-demo"
                        noOptionsText="Type to search"
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" />
                        )}
                        onChange={(_, nextValue) => {
                          onChange(nextValue?.userId ?? "");
                        }}
                        value={
                          users.find((user) => user.userId === value) ?? null
                        }
                        options={filterdUsers}
                        onInputChange={handleInputChange}
                        getOptionLabel={(option) => {
                          return option.fullname ?? "";
                        }}
                        isOptionEqualToValue={(_, option) => {
                          return _.userId === option.fullname;
                        }}
                      />
                      <p className="text-sm text-red-500">{error?.message}</p>
                    </Fragment>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <InputComponent
                control={control}
                label="Name"
                name="companyName"
                required={true}
                rules={{ required: "Name is required" }}
                type="text"
              />

              <SelectComponent
                control={control}
                options={businessNature}
                labelKey="name"
                valueKey="id"
                label="Business type"
                name="natureOfBusiness"
                required={true}
                rules={{
                  required: "Please select business type",
                }}
              />

              <SelectComponent
                control={control}
                options={beneficial_owner_type}
                required={true}
                label="Beneficial owner type"
                name="beneficialOwnerType"
              />
            </div>

            <div className="flex justify-between gap-4">
              <InputComponent
                control={control}
                label="Other business type"
                name="otherNatureOfBusiness"
                type="text"
              />

              <SelectComponent
                control={control}
                options={statusTypes}
                required={true}
                label="Account status"
                name="accountStatus"
              />

              <SelectComponent
                control={control}
                options={statusReason}
                required={true}
                label="Status reason"
                name="reasonForRejection"
                rules={{ required: "status reason is required" }}
              />
            </div>

            <div className="flex justify-between gap-4">
              <SelectComponent
                control={control}
                options={verificaficationStatusList}
                required={true}
                label="Verification status"
                name="verificationStatus"
                rules={{ required: "Verification status is required" }}
              />

              <SelectComponent
                control={control}
                required={true}
                options={verificationLevels}
                label="Verification level"
                name="verificationLevel"
              />

              <InputComponent
                control={control}
                required={true}
                label="Incorporation date"
                name="incorporationDate"
                rules={{ required: "incorporation date is required" }}
                type="date"
              />
            </div>

            <div className="flex justify-between gap-4">
              <InputComponent
                control={control}
                label="Beneficial owner positions"
                name="beneficialOwnerPosition"
                // rules={{ required: "Beneficial owner positions is required" }}
                type="text"
              />

              <InputComponent
                control={control}
                label="Tax identification number"
                name="taxIdentificationNumber"
                // rules={{ required: "Tax Identification Number is required" }}
                type="text"
              />

              <InputComponent
                control={control}
                required={true}
                label="Registration number"
                name="registrationNumber"
                rules={{ required: "Registration Number is required" }}
                type="text"
              />
            </div>
          </HeaderLayout>

          <div className="flex w-full justify-between gap-4">
            <HeaderLayout name={"Incorporation address"}>
              <div className="flex justify-between gap-4">
                <SelectComponent
                  control={control}
                  options={countries}
                  required={true}
                  label="Country"
                  name="country"
                  valueKey="id"
                  labelKey="name"
                  rules={{ required: "Country is required" }}
                />
                <InputComponent
                  control={control}
                  required={true}
                  label="City"
                  name="city"
                  rules={{ required: "City is required" }}
                  type="text"
                />
              </div>

              <div className="flex justify-between gap-4">
                <InputComponent
                  control={control}
                  required={true}
                  label="State"
                  name="state"
                  rules={{ required: "State is required" }}
                  type="text"
                />

                <InputComponent
                  control={control}
                  required={true}
                  label="Postal code"
                  name="postalCode"
                  rules={{ required: "Postal Code is required" }}
                  type="text"
                />
              </div>

              <div className="flex justify-between gap-4">
                <InputComponent
                  control={control}
                  required={true}
                  label="Address line 1"
                  name="addressLine1"
                  type="text"
                  rules={{ required: "Address is required" }}
                />

                <InputComponent
                  control={control}
                  label="Address line 2"
                  name="addressLine2"
                  type="text"
                />
              </div>
            </HeaderLayout>
            <HeaderLayout
              name={"Operational address"}
              enabled={"Same as incorporation address"}
              onChange={(e) => onChange(e.target.checked)}
              checked={sameOperatingAddress}
            >
              <div className="flex justify-between gap-4">
                <SelectComponent
                  control={control}
                  options={countries}
                  required={true}
                  label="Country"
                  name="operatingJurisdiction"
                  valueKey="id"
                  labelKey="name"
                  rules={{
                    required: {
                      value: !sameOperatingAddress,
                      message: "Country is required",
                    },
                  }}
                  disabled={sameOperatingAddress}
                />
                <InputComponent
                  control={control}
                  required={true}
                  label="City"
                  name="operatingAddressCity"
                  rules={{
                    required: {
                      value: !sameOperatingAddress,
                      message: "City is required",
                    },
                  }}
                  type="text"
                  disabled={sameOperatingAddress}
                />
              </div>

              <div className="flex justify-between gap-4">
                <InputComponent
                  control={control}
                  required={true}
                  label="State"
                  name="operatingState"
                  rules={{
                    required: {
                      value: !sameOperatingAddress,
                      message: "State is required",
                    },
                  }}
                  type="text"
                  disabled={sameOperatingAddress}
                />

                <InputComponent
                  control={control}
                  required={true}
                  label="Postal code"
                  name="operatingAddressPostalCode"
                  rules={{
                    required: {
                      value: !sameOperatingAddress,
                      message: "Postal Code is required",
                    },
                  }}
                  type="text"
                  disabled={sameOperatingAddress}
                />
              </div>

              <div className="flex justify-between gap-4">
                <InputComponent
                  control={control}
                  required={true}
                  label="Address line 1"
                  name="operatingAddressAddressLine1"
                  type="text"
                  rules={{
                    required: {
                      value: !sameOperatingAddress,
                      message: "Address is required",
                    },
                  }}
                  disabled={sameOperatingAddress}
                />

                <InputComponent
                  control={control}
                  label="Address line 2"
                  name="operatingAddressAddressLine2"
                  type="text"
                  disabled={sameOperatingAddress}
                />
              </div>
            </HeaderLayout>
          </div>

          <div className="flex w-full justify-between gap-4">
            <HeaderLayout name={"Limit Pack"}>
              <SelectComponent
                control={control}
                options={businessTypes}
                label="Personal type limit"
                name="personal_type_limit"
              />
            </HeaderLayout>
            <HeaderLayout
              name={"Settings"}
              enabled={"Skip transfer pre-approval"}
            >
              <SelectComponent
                control={control}
                options={companyPricelist}
                valueKey="id"
                required={true}
                labelKey="name"
                label="Custom price list"
                name="priceList"
                rules={{ required: "Custom price list is required" }}
              />

              <SelectComponent
                control={control}
                options={companyLimitlist}
                valueKey="id"
                required={true}
                labelKey="name"
                label="Custom Limit list"
                name="limitList"
                rules={{ required: "Limit list is required" }}
              />
            </HeaderLayout>
          </div>

          <div className="flex w-full justify-between gap-4">
            <HeaderLayout name={"Security"}>
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
                required={true}
                label="Password"
                name="password"
                rules={{
                  ...(companyId
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
                  ...(companyId
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
            </HeaderLayout>

            <HeaderLayout name={"Contacts"}>
              <div className="flex items-center rounded ">
                <div className="mt-6">
                  <Controller
                    control={control}
                    name="countryCode"
                    rules={{
                      required: "Please select an country code",
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
                />
              </div>

              <InputComponent
                control={control}
                label="Email"
                required={true}
                rules={{ required: "Email is required" }}
                name="companyEmail"
                type="email"
              />

              <InputComponent
                control={control}
                label="URL"
                name="companyUrl"
                type="text"
              />
            </HeaderLayout>
          </div>
          <div className="flex w-full justify-between gap-4">
            <HeaderLayout name={"Payment types"}>
              <SelectComponent
                control={control}
                options={paymentTypes}
                labelKey="name"
                valueKey="id"
                label="Incoming payments*"
                name="incomingPayments"
                rules={{ required: "Please select incoming payments." }}
              />
              <SelectComponent
                control={control}
                options={paymentTypes}
                labelKey="name"
                valueKey="id"
                label="Outgoing payments*"
                name="outgoingPayments"
                rules={{ required: "Please select outgoing payments." }}
              />
              <SelectComponent
                control={control}
                options={frequency}
                labelKey="name"
                valueKey="id"
                label="Frequency*"
                name="frequency"
                rules={{ required: "Please select frequency." }}
              />
              <SelectComponent
                control={control}
                options={monthlyRemmitance}
                labelKey="name"
                valueKey="id"
                label="Expected monthly remittance volume*"
                name="monthlyRemittanceVolume"
                rules={{
                  required: "Please select expected monthly remittance volume.",
                }}
              />
            </HeaderLayout>
            <HeaderLayout name={"Payment from"}>
              <SelectComponent
                control={control}
                options={countries}
                labelKey="name"
                valueKey="id"
                label="Country name*"
                name="paymentFromCountry1"
                rules={{
                  required: "Please select country name for payment from.",
                }}
              />
              <SelectComponent
                control={control}
                options={countries}
                labelKey="name"
                valueKey="id"
                label="Country name*"
                name="paymentFromCountry2"
                rules={{
                  required: "Please select country name for payment from.",
                }}
              />
              <SelectComponent
                control={control}
                options={countries}
                labelKey="name"
                valueKey="id"
                label="Country name*"
                name="paymentFromCountry3"
                rules={{
                  required: "Please select country name for payment from.",
                }}
              />
            </HeaderLayout>
          </div>
          <div className="flex w-1/2 justify-end gap-4">
            <HeaderLayout name={"Payment to"}>
              <SelectComponent
                control={control}
                options={countries}
                labelKey="name"
                valueKey="id"
                label="Country name*"
                name="paymentToCountry1"
                rules={{
                  required: "Please select country name for payment to.",
                }}
              />
              <SelectComponent
                control={control}
                options={countries}
                labelKey="name"
                valueKey="id"
                label="Country name*"
                name="paymentToCountry2"
                rules={{
                  required: "Please select country name for payment to.",
                }}
              />
              <SelectComponent
                control={control}
                options={countries}
                labelKey="name"
                valueKey="id"
                label="Country name*"
                name="paymentToCountry3"
                rules={{
                  required: "Please select country name for payment to.",
                }}
              />
            </HeaderLayout>
          </div>

          <div className="flex w-full justify-end gap-4 px-3">
            <Button
              title="Back"
              type="button"
              onClick={() => {
                router.back();
              }}
              className="btn-outlined"
            />
            <Button
              title={`${companyId ? "Update Company" : "Create company"}`}
              type="submit"
              className="btn-solid"
              loading={isSubmitting}
            >
              <Image width={20} src={Pluse} alt="Add" />
            </Button>
          </div>
        </form>
      </div>

      <DailogBox
        maxWidth={"xs"}
        open={openDialog}
        handleClose={() => {
          router.back();
        }}
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h2 className="text-2xl font-semibold text-black">
            Company {`${companyId ? "updated" : "created"}`} successfully
          </h2>
          <p>
            {`Company with the name ${
              companyName || company.companyName
            } has been ${companyId ? "updated" : "created"} successfully`}
          </p>
          <Button
            className="btn-solid w-full text-white"
            title="Close"
            onClick={() => {
              router.back();
            }}
          />
        </div>
      </DailogBox>
    </Fragment>
  );
};

export default CompanyForm;
