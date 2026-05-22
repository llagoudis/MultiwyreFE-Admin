/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { Fragment, useEffect, useMemo, useState } from "react";
import HeaderLayout from "~/components/common/HeaderLayout";
import MuiSelect from "~/components/MuiSelect";
import DailogBox from "~/components/common/DailogBox";
import Button from "~/components/common/Button";
import { CgProfile } from "react-icons/cg";
import { formatDate } from "~/common/functions";
import { useRouter } from "next/router";
import Image from "next/image";
import { useGlobalStore, useLimitStore, usePriceStore } from "~/store";
import { verificationLevels } from "~/data/country";
import { enforcePermission } from "~/utils/permissions";

interface DetailsProps {
  userDetails: UserStore;
}

const Details: React.FC<DetailsProps> = ({ userDetails }) => {
  const router = useRouter();
  const [personDetails, setPersonDetails] = useState<any>({});
  const getPriceList = useGlobalStore((state) => state.getPriceList);
  const getLimitList = useGlobalStore((state) => state.getLimitList);

  const pricelist: PriceList = usePriceStore();
  const limitList: Limits = useLimitStore();

  useEffect(() => {
    if (userDetails.priceList) {
      void getPriceList(userDetails.priceList);
    }

    if (userDetails.limitList) {
      void getLimitList(userDetails.limitList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetails]);

  // const primaryEmail = useMemo(
  //   () =>
  //     userDetails?.ContactDetails?.find(
  //       (email: any) => email.isPrimary && email.type === "EMAIL",
  //     ),
  //   [userDetails?.ContactDetails],
  // );

  // const allEmails = useMemo(
  //   () =>
  //     userDetails?.ContactDetails?.filter((email) => email.type === "EMAIL")
  //       .map((email) => email.value)
  //       ?.join(", "),
  //   [userDetails?.ContactDetails],
  // );

  // const primaryPhone = useMemo(
  //   () =>
  //     userDetails.ContactDetails?.find(
  //       (obj: any) => obj.isPrimary && obj.type === "PHONE",
  //     ),
  //   [userDetails?.ContactDetails],
  // );

  function dateValidation(item: TransferFees | FXMarkup | RecurringFees) {
    const currentDate = new Date();
    const validFromDate = new Date(item?.validFrom);
    const validToDate = new Date(item?.validTo);
    return currentDate >= validFromDate && currentDate <= validToDate;
  }

  const feesArray = [
    {
      TransferFees:
        pricelist?.TransferFees?.filter(
          (item) => item.status && dateValidation(item),
        ) ?? [],
    },
    {
      recurringFees:
        pricelist?.RecurringFees?.filter(
          (item) => item.status && dateValidation(item),
        ) ?? [],
    },
    {
      fxmarkup:
        pricelist?.FxMarkupFees?.filter(
          (item) => item.status && dateValidation(item),
        ) ?? [],
    },
  ];

  const thresholdArray = [
    {
      All:
        userDetails?.checkLimits?.Thresholds?.filter(
          (item: { transferDirection: string }) =>
            item.transferDirection === "3",
        ) ?? [],
    },
    {
      Incoming:
        userDetails?.checkLimits?.Thresholds?.filter(
          (item: any) => item.transferDirection === "1",
        ) ?? [],
    },
    {
      Outgoing:
        userDetails?.checkLimits?.Thresholds?.filter(
          (item: any) => item.transferDirection === "2",
        ) ?? [],
    },
    {
      Exchange:
        userDetails?.checkLimits?.Thresholds?.filter(
          (item: any) => item.transferDirection === null,
        ) ?? [],
    },
  ];

  function fetchPrimaryAccount() {
    const accountID = userDetails?.UserAssets?.filter(
      (item) => item?.assetId === "EUR",
    );

    return accountID[0]?.accountNumber;
  }

  function fetchVaultAccount() {
    const accountID = userDetails?.UserAssets?.filter(
      (item) => item?.assetId !== "EUR",
    ).map((item) => {
      return item?.accountNumber;
    });

    return accountID;
  }

  function fetchVerificationLevel() {
    const level = verificationLevels?.find(
      (item) => item?.value === userDetails?.verificationLevel,
    );
    return level?.label;
  }


  const UserDetails: IndividualsDetailsType = useMemo(
    () => ({
      Details: [
        {
          key: "profileImgLink",
          label: "Photo",
          value: userDetails.profileImgLink,
        },
        {
          key: "clientId",
          label: "Client ID",
          value: userDetails.id,
        },
        {
          key: "personType",
          label: "Person type",
          value: userDetails.personType,
        },
        {
          key: "firstname",
          label: "First name",
          value: userDetails.firstname,
        },
        {
          key: "lastname",
          label: "Last name",
          value: userDetails.lastname,
        },
        { key: "dob", label: "Birthdate", value: formatDate(userDetails.dob) },
        { key: "gender", label: "Gender", value: userDetails.gender },
        {
          key: "nationality",
          label: "Nationality",
          value: userDetails.nationality,
        },
        { key: "language", label: "Language", value: userDetails.language },
        {
          key: "ApprovedBy",
          label: "Approved by",
          value: userDetails.AdminUser
            ? `${userDetails?.AdminUser?.firstname} ${userDetails?.AdminUser?.lastname}`
            : "--",
        },
        {
          key: "createdAt",
          label: "Created at",
          value: formatDate(userDetails.createdAt),
        },
        {
          key: "updatedAt",
          label: "Updated at",
          value: formatDate(userDetails.updatedAt),
        },
        {
          key: "createdAt",
          label: "Consent Terms",
          value: formatDate(userDetails.updatedAt),
        },
      ],
      Accounts: [
        {
          key: "PrimaryAccount",
          label: "Primary Account",
          value: fetchPrimaryAccount(),
        },
        {
          key: "VaultAccount",
          label: "Vault account",
          value: fetchVaultAccount(),
        },
      ],
      Contacts: [
        {
          key: "PrimaryEmail",
          label: "Primary email",
          value: userDetails?.email,
        },
        { key: "Email", label: "Email", value: userDetails?.email },
        {
          key: "PrimaryPhone",
          label: "Primary phone",
          value: `+${userDetails?.countryCode} ${userDetails?.phone}`,
        },
      ],
      Locations: [
        {
          key: "address",
          label: "Legal address",
          value: userDetails.UserVerification
            ? `${userDetails?.UserVerification?.city}, ${userDetails?.UserVerification?.state}, ${userDetails?.UserVerification?.Country?.name}`
            : "-",
        },
      ],
      Settings: [
        {
          key: "defaultCurrency",
          label: "Default currency",
          value: userDetails.defaultCurrency,
        },
        {
          key: "customPriceList",
          label: "Price list",
          value: pricelist.name,
        },
        { key: "ActualPriceList", label: "Actual price list", value: "" },
        {
          key: "SkipTransferApproval",
          label: "Skip transfer pre approval",
          value: "",
        },
        { key: "ReferralCode", label: "Referral code", value: "" },
        { key: "limitList", label: "Exchange Limit", value: limitList.name },
      ],
      Security: [
        {
          key: "VerificationStatus",
          label: "Verification status",
          value: userDetails.isUserVerified,
        },
        {
          key: "VerificationLevel",
          label: "Verification level",
          value: fetchVerificationLevel(),
        },
        {
          key: "accountStatus",
          label: "Account status",
          value: userDetails.active
            ? "Active"
            : userDetails.reasonForRejection
              ? "Suspended"
              : "---",
        },
        {
          key: "reasonForRejection",
          label: "Account status reason",
          value: userDetails.reasonForRejection,
        },
        {
          key: "roles",
          label: "Access roles",
          value: userDetails?.roles?.includes("ex_user_viewer")
            ? "Viewer"
            : "User",
        },
      ],
      Thresholds: thresholdArray,
      Fees: feesArray,
    }),
    [userDetails, pricelist],
  );

  const options = [
    {
      value: "add_new",
      label: "Add new",
    },
    {
      value: "edit",
      label: "Edit",
    },
    {
      value: "delete",
      label: "Delete",
    },
    {
      value: "active",
      label: "Active",
    },
    {
      value: "terminated",
      label: "Terminated",
    },
    {
      value: "dormanted",
      label: "Dormanted",
    },
  ];

  const [filter, setFilter] = useState<any>("");

  const handleChange = async (event: any) => {
    if (event.target.value) {
      setFilter(event.target.value);
    }

    try {
      if (event.target.value === "Add new") {
        await router.push("/banking/individuals/user-form");
      } else if (event.target.value === "Edit") {
        await router.push(
          `/banking/individuals/user-form?id=${userDetails.azureId}`,
        );
      } else if (event.target.value === "Delete") {
        enforcePermission("delete", [() => setOpenDialog("delete")]);
      }
    } catch (error) {}
  };

  const [openDialog, setOpenDialog] = useState("");

  useEffect(() => {
    userDetails && setPersonDetails(userDetails);
  }, [userDetails]);

  return (
    <div className="grid grid-cols-2 gap-4 py-4">
      <DailogBox
        maxWidth={"sm"}
        open={openDialog === "delete"}
        handleClose={() => {
          setOpenDialog("");
        }}
      >
        <div className="flex flex-col gap-4 ">
          <h2 className="text-xl font-semibold text-black">
            Are you sure want to delete the person?
          </h2>
          <p>
            By doing this action the user will be removed permanently from the
            list. Are yousure you want to remove this person
          </p>
          <div className="mt-4 flex justify-end gap-4">
            <Button
              className="btn-outlined "
              title="No, cancel"
              onClick={() => {
                setOpenDialog("");
              }}
            />
            <Button className="btn-solid text-white" title="Yes, confirm" />
          </div>
        </div>
      </DailogBox>
      <p className="text-2xl font-bold text-[#1E293B]">View Individual</p>
      <div className="ml-auto w-fit">
        <MuiSelect
          placeHolder="Actions"
          options={options}
          placeHolderColor="#000000"
          value={filter}
          onChange={handleChange}
        />
      </div>

      <div>
        <div className="flex flex-col gap-4">
          {/* Details */}
          <HeaderLayout name="Details">
            {UserDetails.Details.map(({ key, label, value }, i) => (
              <div key={i} className="grid grid-cols-2">
                <p className="py-2">{label}</p>
                {key === "profileImgLink" ? (
                  personDetails[key] ? (
                    <Image
                      alt="Profile"
                      src={personDetails[key]}
                      width="150"
                      height="150"
                    />
                  ) : (
                    <CgProfile className="h-20 w-20" />
                  )
                ) : (
                  <p className="py-2">{value ?? "---"}</p>
                )}
              </div>
            ))}
          </HeaderLayout>

          {/* Fees */}
          <HeaderLayout name="Fees">
            {UserDetails?.Fees?.map((item, i) => (
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
                            <p className=" py-[3px]">
                              ({feesGroup.currencyId})
                            </p>
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
                            <p className="py-2 font-semibold">
                              {feesGroup?.OperationType?.displayName}
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

                          <div className="mb-1 grid grid-cols-2">
                            <p className="py-[3px]">
                              ({feesGroup.fromCurrencyId} -{" "}
                              {feesGroup.toCurrencyId})
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
              </div>
            ))}
          </HeaderLayout>

          {/* Threshold */}

          <HeaderLayout name="Transaction Limits">
            {UserDetails?.Thresholds?.map((item, i) => (
              <div key={i}>
                {item.All && (
                  <div>
                    <p className="py-2 font-semibold">All</p>
                    {item.All.map((thresholdGroup: any, groupIndex: any) => (
                      <div
                        key={groupIndex}
                        className="mb-2 grid grid-cols-5 justify-items-start gap-4"
                      >
                        {thresholdGroup.thresholdType ===
                          "TransactionAmount" && (
                          <p className="py-[3px]">
                            Amount: {thresholdGroup.amount}
                          </p>
                        )}

                        {thresholdGroup.thresholdType ===
                          "TransactionCount" && (
                          <p className="py-[3px]">
                            Count: {thresholdGroup.amount}
                          </p>
                        )}

                        {thresholdGroup.thresholdType ===
                          "FXTransactionAmount" && (
                          <p className="py-[3px]">
                            Amount: {thresholdGroup.amount}
                          </p>
                        )}

                        {/* <p className="py-[3px] text-center">
                            {thresholdGroup.amount}
                          </p> */}
                        <p className="py-[3px] text-center">
                          {thresholdGroup.currency}
                        </p>
                        {thresholdGroup.actionTypes === "notify" && (
                          <p className=" py-[3px]">Notify</p>
                        )}
                        {thresholdGroup.actionTypes === "suspendClient" && (
                          <p className=" py-[3px]">Suspend</p>
                        )}
                        <p className="py-[3px] text-center capitalize">
                          {thresholdGroup.period}
                        </p>
                        <p className="py-[3px] text-center">
                          {thresholdGroup.periodCount}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {item.Incoming && (
                  <div>
                    <p className="py-2 font-semibold">Incoming</p>
                    {item.Incoming.map(
                      (thresholdGroup: any, groupIndex: any) => (
                        <div
                          key={groupIndex}
                          className="mb-2 grid grid-cols-5 justify-items-start gap-4"
                        >
                          {thresholdGroup.thresholdType ===
                            "TransactionAmount" && (
                            <p className="py-[3px]">
                              Amount: {thresholdGroup.amount}
                            </p>
                          )}

                          {thresholdGroup.thresholdType ===
                            "TransactionCount" && (
                            <p className="py-[3px]">
                              Count: {thresholdGroup.amount}
                            </p>
                          )}

                          {thresholdGroup.thresholdType ===
                            "FXTransactionAmount" && (
                            <p className="py-[3px]">
                              Amount: {thresholdGroup.amount}
                            </p>
                          )}

                          {/* <p className="py-[3px] text-center">
                           {thresholdGroup.amount}
                         </p> */}
                          <p className="py-[3px] text-center">
                            {thresholdGroup.currency}
                          </p>
                          {thresholdGroup.actionTypes === "notify" && (
                            <p className=" py-[3px]">Notify</p>
                          )}
                          {thresholdGroup.actionTypes === "suspendClient" && (
                            <p className=" py-[3px]">Suspend</p>
                          )}
                          <p className="py-[3px] text-center capitalize">
                            {thresholdGroup.period}
                          </p>
                          <p className="py-[3px] text-center">
                            {thresholdGroup.periodCount}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
                {item.Outgoing && (
                  <div>
                    <p className="py-2 font-semibold">Outgoing</p>
                    {item.Outgoing.map(
                      (thresholdGroup: any, groupIndex: any) => (
                        <div
                          key={groupIndex}
                          className="mb-2 grid grid-cols-5 justify-items-start gap-4"
                        >
                          {thresholdGroup.thresholdType ===
                            "TransactionAmount" && (
                            <p className="py-[3px]">
                              Amount: {thresholdGroup.amount}
                            </p>
                          )}

                          {thresholdGroup.thresholdType ===
                            "TransactionCount" && (
                            <p className="py-[3px]">
                              Count: {thresholdGroup.amount}
                            </p>
                          )}

                          {thresholdGroup.thresholdType ===
                            "FXTransactionAmount" && (
                            <p className="py-[3px]">
                              Amount: {thresholdGroup.amount}
                            </p>
                          )}

                          {/* <p className="py-[3px] text-center">
                           {thresholdGroup.amount}
                         </p> */}
                          <p className="py-[3px] text-center">
                            {thresholdGroup.currency}
                          </p>
                          {thresholdGroup.actionTypes === "notify" && (
                            <p className=" py-[3px]">Notify</p>
                          )}
                          {thresholdGroup.actionTypes === "suspendClient" && (
                            <p className=" py-[3px]">Suspend</p>
                          )}
                          <p className="py-[3px] text-center capitalize">
                            {thresholdGroup.period}
                          </p>
                          <p className="py-[3px] text-center">
                            {thresholdGroup.periodCount}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {item.Exchange && (
                  <div>
                    <p className="py-2 font-semibold">Exchange</p>
                    {item.Exchange.map(
                      (thresholdGroup: any, groupIndex: any) => (
                        <div
                          key={groupIndex}
                          className="mb-2 grid grid-cols-5 justify-items-start gap-4"
                        >
                          {thresholdGroup.thresholdType ===
                            "TransactionAmount" && (
                            <p className="py-[3px]">
                              Amount: {thresholdGroup.amount}
                            </p>
                          )}

                          {thresholdGroup.thresholdType ===
                            "TransactionCount" && (
                            <p className="py-[3px]">
                              Count: {thresholdGroup.amount}
                            </p>
                          )}

                          {thresholdGroup.thresholdType ===
                            "FXTransactionAmount" && (
                            <p className="py-[3px]">
                              Amount: {thresholdGroup.amount}
                            </p>
                          )}

                          {/* <p className="py-[3px] text-center">
                           {thresholdGroup.amount}
                         </p> */}
                          <p className="py-[3px] text-center">
                            {thresholdGroup.currency}
                          </p>
                          {thresholdGroup.actionTypes === "notify" && (
                            <p className=" py-[3px]">Notify</p>
                          )}
                          {thresholdGroup.actionTypes === "suspendClient" && (
                            <p className=" py-[3px]">Suspend</p>
                          )}
                          <p className="py-[3px] text-center capitalize">
                            {thresholdGroup.period}
                          </p>
                          <p className="py-[3px] text-center">
                            {thresholdGroup.periodCount}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}
          </HeaderLayout>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {/* Accounts */}
        <HeaderLayout name="Accounts">
          {UserDetails.Accounts.map(({ key, label, value }) => (
            <div key={key} className="grid grid-cols-2">
              <p className="py-2">{label}</p>
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
        {/* Contacts */}
        <HeaderLayout name="Contacts">
          {UserDetails.Contacts.map(({ key, label, value }) => (
            <div key={key} className="grid grid-cols-2">
              <p className=" py-2">{label}</p>
              <p className=" py-2">{value ?? "---"}</p>
            </div>
          ))}
        </HeaderLayout>
        {/* Locations */}
        <HeaderLayout name="Locations">
          {UserDetails.Locations.map(({ key, label, value }) => (
            <div key={key} className="grid grid-cols-2">
              <p className=" py-2">{label}</p>
              <p className=" py-2">{value ?? "---"}</p>
            </div>
          ))}
        </HeaderLayout>
        {/* Settings */}
        <HeaderLayout name="Settings">
          {UserDetails.Settings.map(({ key, label, value }) => (
            <div key={key} className=" grid grid-cols-2 ">
              <p className=" py-2">{label}</p>
              <p className=" py-2">{value ?? "---"}</p>
            </div>
          ))}
        </HeaderLayout>
        {/* Security */}
        <HeaderLayout name="Security">
          {UserDetails.Security.map(({ key, label, value }) => (
            <div key={key} className="grid grid-cols-2">
              <p className=" py-2">{label}</p>
              <p className=" py-2">{value ?? "---"}</p>
            </div>
          ))}
        </HeaderLayout>
      </div>
    </div>
  );
};

export default Details;
