import React, { Fragment, type FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image, { type StaticImageData } from "next/image";
import HeaderLayout from "~/components/common/HeaderLayout";
import Button from "~/components/common/Button";
import AddPluse from "~/assets/general/Add_Plus.svg";
import { useGlobalStore, useLimitStore, usePriceStore } from "~/store";
import { findRemittance, formatDate } from "~/common/functions";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { verificationLevels } from "~/data/country";
import { CgProfile } from "react-icons/cg";
import Link from "next/link";
import { getCompanyById } from "~/service/api";

type feesType = {
  key: string;
  value: string | number;
};
type companyProp = {
  Details: {
    Photo: string;
    "Client ID": string | number;
    Name: string;
    "Company type": string;
    Owner: string;
    "Incorporation date": string;
    "Tax identification number": string | number;
    "Registration number": string | number;
    "Verification status": string;
    "Verification level": string;
    "Business type": string;
    "Other business type": string;
    "Beneficial owner type": string;
    "Account status": string;
    "Status reason": string;
    "Created at": string;
    "Updated at": string;
    "Consent Terms": string;
  };
  Locations: {
    "Operational address": string;
    "Incorporation address": string;
  };
  Security: {
    "Access role": string;
    "Actual address": string;
  };
  "Package limits": {
    Limit: string | number;
    "Threshold pack": string | number;
  };
  Accounts: {
    "Primary account": string;
    "Vault account": string | string[];
  };
  Settings: {
    "Price list": string;
    "Actual price list": string;
    "Skip transfer pre approval": string;
  };
  Contacts: {
    Phone: string;
    Email: string;
    Url: string;
  };
  "Custom company threshold": {
    Thresholds: string;
  };
  Fees: FeeTypeIndividuals[];
  "Payment types": {
    "Incoming payments": string;
    "Outgoing payments": string;
    Frequency: string;
    "Expected monthly remittance volume": string;
  };
};

const Details: FC<defaultCompanyProps> = ({ data }) => {
  // const [transfers, setTransfer] = useState<feesType[]>([]);
  // const [fxMarkupFees, setFxMarkupFees] = useState<feesType[]>([]);
  // const [transferFees, setTransferFees] = useState<string | number>();
  // const [recurringFees, setRecurringFees] = useState<string | number>();
  const company = data?.company || {};
  const entity = company.CompanyEntityInfo;
  const registerAddress = `${entity?.city}, ${entity?.addressLine1}, ${entity?.addressLine2}, ${entity?.state}, ${entity?.Country?.name},  ${entity?.postalCode}`;
  const operatingAddress = entity?.sameOperatingAddress
    ? registerAddress
    : `${entity?.operatingAddressCity}, ${entity?.operatingAddressAddressLine1}, ${entity?.operatingState}, ${entity?.Country?.name}, ${entity?.operatingAddressPostalCode}`;
  const payment = company.CompanyPaymentsInfo;
  const router = useRouter();
  const getPriceList = useGlobalStore((state) => state.getPriceList);
  const getLimitList = useGlobalStore((state) => state.getLimitList);

  const pricelist: PriceList = usePriceStore();
  const limitList: Limits = useLimitStore();

  const [countries] = useAsyncMasterStore("countries");
  const [paymentTypes] = useAsyncMasterStore("paymentTypes");
  const [frequency] = useAsyncMasterStore("frequency");
  const [monthlyRemmitance] = useAsyncMasterStore("monthlyRemmitance");

  useEffect(() => {
    if (company.priceList) {
      void getPriceList(company.priceList);
    }

    if (company.limitList) {
      void getLimitList(company.limitList);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (company.id) {
      void getCompanyById(company.id);
    }
  }, [company.id]);

  const findCountryName = (id: any) => {
    return countries.find((obj) => obj.id === id)?.name ?? "---";
  };

  const findPaymentName = (id: any) => {
    return paymentTypes.find((obj) => obj.id === id)?.name ?? "---";
  };

  // useEffect(() => {
  //   if (pricelist) {
  //     const filteredIncomingTransfers = pricelist.TransferFees?.length
  //       ? pricelist.TransferFees.filter(
  //           (tf) => tf.OperationType?.name === "incomingTransfer",
  //         )[0]
  //       : null;
  //     const incomingTransfer = filteredIncomingTransfers
  //       ? `${filteredIncomingTransfers.percent}%`
  //       : "-";
  //     setTransferFees(incomingTransfer);

  //     const recurringFees = pricelist.RecurringFees?.length
  //       ? `${pricelist.RecurringFees[0]?.percentage}%`
  //       : "-";
  //     setRecurringFees(recurringFees);

  //     let transferData = [];
  //     transferData = pricelist.TransferFees?.length
  //       ? pricelist.TransferFees.map((transferFee) => {
  //           return {
  //             key: transferFee.name,
  //             value: `${transferFee.percent}%`,
  //           };
  //         })
  //       : [];
  //     setTransfer(transferData);

  //     let fxMarkupFees = [];
  //     fxMarkupFees = pricelist.TransferFees?.length
  //       ? pricelist.TransferFees.map((transferFee) => {
  //           return {
  //             key: transferFee.name,
  //             value: `${transferFee.percent}%`,
  //           };
  //         })
  //       : [];
  //     setFxMarkupFees(fxMarkupFees);
  //   }
  // }, [pricelist]);

  const feesArray = [
    { TransferFees: pricelist.TransferFees },
    { recurringFees: pricelist.RecurringFees },
    { fxmarkup: pricelist.FxMarkupFees },
  ];
  4;

  function fetchPrimaryAccount() {
    const accountID =
      company?.UserCompanyAssociations[0]?.User?.UserAssets?.filter(
        (item) => item?.assetId === "EUR",
      );

    return accountID ? accountID[0]?.accountNumber : "";
  }

  function fetchVaultAccount() {
    const accountID =
      company?.UserCompanyAssociations[0]?.User?.UserAssets?.filter(
        (item) => item?.assetId !== "EUR",
      ).map((item) => {
        return item?.accountNumber;
      });

    return accountID;
  }

  function fetchVerificationLevel() {
    const level = verificationLevels?.find(
      (item) => item?.value === company?.verificationLevel,
    );

    return level?.label;
  }

  const CompanyDetails: companyProp = {
    Details: {
      Photo: company?.profileImageUrl,
      "Client ID": company?.id,
      Name: company?.companyName,
      "Company type": "",
      Owner: company?.User
        ? `${company?.User?.firstname} ${company?.User?.lastname}`
        : "--",
      "Incorporation date": entity?.incorporationDate,
      "Tax identification number": "-",
      "Registration number": entity?.registrationNumber,
      "Verification status": company.verificationStatus,
      "Verification level": fetchVerificationLevel() ?? "",
      "Business type": entity?.BusinessNature?.name || "-",
      "Other business type": "-",
      "Beneficial owner type": "-",
      "Account status": company?.accountStatus,
      "Status reason": "-",
      "Created at": formatDate(company.createdAt) || "-",
      "Updated at": formatDate(company.updatedAt) || "-",
      "Consent Terms": formatDate(company.createdAt) || "-",
    },
    Locations: {
      "Operational address": operatingAddress,
      "Incorporation address": registerAddress,
    },
    Security: {
      "Access role": company?.UserCompanyAssociations[0]?.User?.roles?.includes(
        "ex_user_viewer",
      )
        ? "Viewer"
        : "User",
      "Actual address": "-",
    },
    "Package limits": {
      Limit: limitList.name,
      "Threshold pack": "-",
    },
    Accounts: {
      "Primary account": fetchPrimaryAccount() ?? "",
      "Vault account": fetchVaultAccount() ?? [],
    },
    Settings: {
      "Price list": pricelist.name,
      "Actual price list": "-",
      "Skip transfer pre approval": "-",
    },
    Contacts: {
      Phone: company.phone ?? "-",
      Email: company.companyEmail ?? "-",
      Url: company.companyUrl ?? "-",
    },
    "Custom company threshold": {
      Thresholds: " ",
    },
    Fees: feesArray,

    "Payment types": {
      "Incoming payments": findPaymentName(payment?.incomingPayments),
      "Outgoing payments": findPaymentName(payment?.outgoingPayments),
      Frequency: frequency.find((obj) => obj.id === payment?.frequency)?.name,
      "Expected monthly remittance volume": monthlyRemmitance.find(
        (obj) => obj.id === payment?.monthlyRemittanceVolume,
      )?.name,
    },
  };

  // page Navigation
  const handleNavigate = async (path: string) => {
    await router.push(path);
  };

  return (
    <Fragment>
      <div className="flex items-center justify-between py-4">
        <p className=" text-2xl font-bold text-[#1E293B]">View Company</p>
        <div className=" flex items-center gap-4">
          <p
            className="subText cursor-pointer"
            onClick={() => {
              void handleNavigate(
                `/banking/companies/company-form?id=${company.id}`,
              );
            }}
          >
            Edit company
          </p>

          <Button
            title="Add new"
            className="btn-solid"
            onClick={() => {
              void handleNavigate("/banking/companies/company-form");
            }}
          >
            <Image src={AddPluse as StaticImageData} alt="Add new button" />
          </Button>
        </div>
      </div>
      <div className=" grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          {/* Details */}
          <HeaderLayout name="Details">
            {Object.entries(CompanyDetails.Details).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                {key === "Photo" ? (
                  value ? (
                    <Image
                      alt="Profile"
                      src={value as string}
                      width="150"
                      height="150"
                    />
                  ) : (
                    <CgProfile className="h-20 w-20" />
                  )
                ) : key === "Owner" ? (
                  <Link
                    href={`/banking/individuals/view/${company?.User?.azureId}`}
                    className="text-blue-600 underline"
                  >
                    {value}
                  </Link>
                ) : (
                  <p className="py-2">{value ?? "---"}</p>
                )}
              </div>
            ))}
          </HeaderLayout>

          {/* Locations */}
          <HeaderLayout name="Locations">
            {Object.entries(CompanyDetails.Locations).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>

          {/* Security */}
          <HeaderLayout name="Security">
            {Object.entries(CompanyDetails.Security).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>

          {/* PackageLimits */}
          <HeaderLayout name="Package Limits">
            {Object.entries(CompanyDetails["Package limits"]).map(
              ([key, value], i) => (
                <div key={i} className="grid grid-cols-2">
                  <p className="py-2">{key}</p>
                  <p className="py-2">{value}</p>
                </div>
              ),
            )}
          </HeaderLayout>

          {/* Payment info */}
          <HeaderLayout name="Payment types">
            {Object.entries(CompanyDetails["Payment types"]).map(
              ([key, value], i) => (
                <div key={i} className="grid grid-cols-2">
                  <p className="py-2">{key}</p>
                  <p className="py-2">{value}</p>
                </div>
              ),
            )}
          </HeaderLayout>
        </div>

        <div className="flex flex-col gap-4">
          {/* Accounts */}
          <HeaderLayout name="Accounts">
            {Object.entries(CompanyDetails.Accounts).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                {Array.isArray(value) ? (
                  <ul className="py-2">
                    {value.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-2">{value ?? "---"}</p>
                )}
              </div>
            ))}
          </HeaderLayout>

          {/* Settings */}
          <HeaderLayout name="Settings">
            {Object.entries(CompanyDetails.Settings).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className=" py-2">{value}</p>
              </div>
            ))}
          </HeaderLayout>

          {/* fees  */}
          <HeaderLayout name="Fees">
            {CompanyDetails?.Fees?.map((item, i) => (
              <div key={i}>
                {item.TransferFees && (
                  <div>
                    {item.TransferFees.map(
                      (feesGroup: any, groupIndex: any, arr: any[]) => (
                        <div key={groupIndex} className="">
                          {!arr[groupIndex - 1] ||
                          arr[groupIndex - 1]?.OperationType?.displayName !==
                            feesGroup?.OperationType?.displayName ? (
                            <p className="py-2 font-semibold">
                              {feesGroup?.OperationType?.displayName}
                            </p>
                          ) : null}

                          <div className="mb-1 grid grid-cols-3">
                            <p className="">({feesGroup.currencyId})</p>
                            <p className="py-[3px] text-center">
                              {feesGroup.fixedFee}
                            </p>
                            <p className="py-[3px] text-center">
                              {feesGroup.percent}%
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {item.recurringFees && (
                  <div>
                    <p className="py-2 font-semibold">Recurring</p>
                    {item.recurringFees.map(
                      (feesGroup: any, groupIndex: any, arr: any[]) => (
                        <div key={groupIndex} className="">
                          {!arr[groupIndex - 1] ||
                          arr[groupIndex - 1]?.OperationType?.displayName !==
                            feesGroup?.OperationType?.displayName ? (
                            <p>
                              {/* {feesGroup?.OperationType?.displayName} */}
                            </p>
                          ) : null}

                          <div className="mb-1 grid grid-cols-3">
                            <p className="py-[3px]">({feesGroup.currencyId})</p>
                            <p className="py-[3px] text-center">
                              {feesGroup.fixedFee}
                            </p>
                            {/* <p className="text-center">{feesGroup.percent}%</p> */}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {item.fxmarkup && (
                  <div>
                    <p className="py-2 font-semibold">FX markup</p>
                    {item.fxmarkup.map(
                      (feesGroup: any, groupIndex: any, arr: any[]) => (
                        <div key={groupIndex} className="">
                          {!arr[groupIndex - 1] ||
                          arr[groupIndex - 1]?.OperationType?.displayName !==
                            feesGroup?.OperationType?.displayName ? (
                            <p className="py-2 font-semibold">
                              {feesGroup?.OperationType?.displayName}
                            </p>
                          ) : null}

                          <div className="mb-1 grid grid-cols-3 items-center">
                            <p className="">
                              ({feesGroup.fromCurrencyId}-
                              {feesGroup.toCurrencyId})
                            </p>
                            <p className="py-[3px] text-center"></p>
                            <p className="py-[3px] text-center">
                              {feesGroup.percent}%
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}
          </HeaderLayout>

          {/* Contacts */}
          <HeaderLayout name="Contacts">
            {Object.entries(CompanyDetails.Contacts).map(([key, value], i) => (
              <div key={i} className=" grid grid-cols-2 ">
                <p className=" py-2">{key}</p>
                <p className="py-2">
                  {key === "Phone"
                    ? `+${company.countryCode} ${value} `
                    : value}
                </p>
              </div>
            ))}
          </HeaderLayout>

          {/* CustomCompanyThreshold */}
          <HeaderLayout name="Custom company threshold">
            {Object.entries(CompanyDetails["Custom company threshold"]).map(
              ([key, value], i) => (
                <div key={i} className=" grid grid-cols-2 ">
                  <p className=" py-2">{key}</p>
                  <p className=" py-2">{value}</p>
                </div>
              ),
            )}
          </HeaderLayout>

          <HeaderLayout name="Payments from">
            {[
              payment?.paymentFromCountry1,
              payment?.paymentFromCountry2,
              payment?.paymentFromCountry3,
            ].map((id, index) => (
              <div className="grid grid-cols-2" key={index}>
                <p className=" py-2">{findCountryName(id)}</p>
              </div>
            ))}
          </HeaderLayout>
          <HeaderLayout name="Payments to">
            {[
              payment?.paymentToCountry1,
              payment?.paymentToCountry2,
              payment?.paymentToCountry3,
            ].map((id, index) => (
              <div className="grid grid-cols-2" key={index}>
                <p className=" py-2">{findCountryName(id)}</p>
              </div>
            ))}
          </HeaderLayout>
        </div>
      </div>

      <div className="my-4 flex justify-end">
        <Button
          title="Back"
          className="btn-outlined"
          onClick={() => {
            router.back();
          }}
        />
      </div>
    </Fragment>
  );
};

export default Details;
