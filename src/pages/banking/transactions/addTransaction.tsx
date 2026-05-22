import React, { Fragment, useEffect, useState } from "react";
import Button from "~/components/common/Button";
import Header from "~/components/common/Header";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import { Controller, useForm } from "react-hook-form";
import SelectComponent from "~/components/common/SelectComponent";
import { Autocomplete, TextField, TextareaAutosize } from "@mui/material";
import { countries } from "~/data/country";
import { useRouter } from "next/router";
import { getAllUserAssets } from "~/service/api";
import {
  createTransactions,
  updateTransactionFeeValue,
} from "~/service/api/transaction";
import toast from "react-hot-toast";
import { number } from "zod";
import { Debounce } from "~/common/functions";

type formData = {
  azureId: string;
  assetId: string;
  operationType: string;
  amount_type: string;
  provider: string;
  amount: string;
  note: string;
  reference_transaction: string;
  from_account: string;
  to_account: string;
  account: string;
  payment_type: string;
  orderType: string;
  assetPair: string;
  rate: number;
  total: number;
  volume: number;
  order: string;
  currency: string;
  toAccount: string;
  transactionFee: string;
  exchangeFee: string;
  spendingAmount: string;
  receivingAmount: string;
};

// const initialFormValues: formData = {
//   operationType: "1",
//   amount_type: "", // Initial value for amount_type
//   provider: "",
//   amount: "",
//   currency: "",
//   details: "",
//   reference_transaction: "",
//   from_account: "",
//   to_account: "",
//   account: "",
//   payment_type: "",
// };
const asset1: any[] = ["value1", "value2"];

type LabeledValue = {
  label: string;
  value: string;
};
const transferTypeList = [
  { label: "Incoming transfer", value: "1" },
  { label: "Internal transfer", value: "6" },
  { label: "Fee", value: "8" },
  { label: "Outgoing transfer", value: "2" },
  { label: "Exchange", value: "5" },
];

// const amountType = [
//   { label: "Incoming transfer", value: "1" },
//   { label: "Internal transfer", value: "2" },
//   { label: "Fee", value: "3" },
//   { label: "Outgoing transfer", value: "4" },
//   { label: "Exchange", value: "5" },
// ];

const providerList = [
  { label: "SEPA", value: "1" },
  { label: "Swift", value: "2" },
  { label: "Local", value: "3" },
  { label: "Crypto", value: "4" },
];
export const orderTypeList = [
  { label: "Market ", value: "market" },
  { label: "Limit ", value: "limit" },
];
export const orderList = [
  { label: "Buy ", value: "buy" },
  { label: "Sell ", value: "sell" },
];

type useAsset = {
  label: string;
  value: string;
  currencyName?: string;
  userIdNumber?: string;
};

const AddTransaction = () => {
  const [userAssets, setUserAssets] = useState<useAsset[]>([]);
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<formData>();

  const router = useRouter();

  // page Navigation
  const handleNavigate = (path: string, data?: any) => {
    router
      .push({
        pathname: path, // Replace with the actual page path
        query: data,
      })
      .then(() => {
        // The navigation was successful
      })
      .catch((error) => {
        // Handle any errors that occur during navigation
      });
  };

  const fieldValue = watch("operationType") ? watch("operationType") : "";
  const accountValue = watch("account") || "";
  const toAccountWatch = watch("toAccount") || "";
  const { rate, volume, order, currency, assetPair } = watch() || "";
  const orderTypeValue = watch("orderType") ? watch("orderType") : "";
  const [filtersOptions, setFilteredOptions] = useState<useAsset[]>([]);
  const [toAccountAssets, setToAccountAssets] = useState<useAsset[]>([]);
  const [fromAccount, setfromAccount] = useState("");
  // const [filteredCurriencyPair, setFilteredCurriencyPair] = useState<
  //   useAsset[]
  // >([]);
  const getUserAccountInfo = async () => {
    const [data] = await getAllUserAssets();

    if (data?.success) {
      const modifiedUserAssets = data.body.map((asset) => ({
        label: `${asset.accountNumber ?? "--"} - ${
          asset.User?.firstname ?? "--"
        } ${asset.User?.lastname ?? "--"} ${"--"} ${asset.assetId}`,
        value: asset.accountNumber ?? "--",
        currencyName: asset.assetId ?? "--",
        userIdNumber: asset.userId ?? "--",
      }));
      setUserAssets(modifiedUserAssets);
    }
  };

  const currencyName = userAssets?.find((item) => item.value === accountValue);

  useEffect(() => {
    setValue("assetId", currencyName?.currencyName ?? "");
    setValue("azureId", currencyName?.userIdNumber ?? "");
    setfromAccount(currencyName?.currencyName ?? "");
  }, [accountValue]);

  useEffect(() => {
    void getUserAccountInfo();
  }, []);

  const handleInputChange = Debounce((_: any, inputValue: string) => {
    if (inputValue?.toLowerCase()) {
      const filtered = userAssets.filter((option) => {
        return option.label.toLowerCase().includes(inputValue?.toLowerCase());
      });

      setFilteredOptions(filtered);
      // To account
      if (filtersOptions.length > 0 && filtered.length > 0) {
        const assetsFilter = userAssets.filter((option) => {
          return (
            option.userIdNumber === filtersOptions[0]?.userIdNumber &&
            option.currencyName !== filtered[0]?.currencyName
          );
        });
        setToAccountAssets(assetsFilter);
      }
    } else {
      setFilteredOptions([]);
    }
  }, 1500);

  // console.log("filtersOptions", filtersOptions[0]?.currencyName);
  // console.log("filteredCurriencyPair", filteredCurriencyPair);

  // useEffect(() => {
  //   if (toAccountWatch) {
  //     setFilteredCurriencyPair((prev) => [
  //       ...prev,
  //       { label: toAccountWatch, value: toAccountWatch },
  //     ]);
  //   }
  // }, [toAccountWatch]);

  // useEffect(() => {
  //   if (filteredCurriencyPair) {
  //     setValue("currency", filteredCurriencyPair[0]?.value ?? "");
  //   }
  // }, [assetPair]);

  useEffect(() => {
    setValue("total", Math.max(rate, 0) * Math.max(volume, 0) ?? 0);
  }, [rate, volume, currency, order]);

  const onSubmit = async (values: formData) => {
    const {
      operationType,
      reference_transaction,
      from_account,
      to_account,
      account,
      payment_type,
      amount,
      note,
      azureId,
      assetId,
      currency,
      rate,
      volume,
      order,
      total,
      orderType,
      transactionFee,
      exchangeFee,
    } = values;

    let receivingCurrency, spendingCurrency;
    let spendingAmount,
      receivingAmount = 0;

    // const transactionFeeCal = Number(transactionFee) + Number(exchangeFee);

    if (order) {
      receivingCurrency = toAccountWatch;
      spendingCurrency = fromAccount;
      spendingAmount = Math.max(volume, 0);
      receivingAmount = Math.max(total, 0);
    }

    const responseData = {
      operationType,
      reference_transaction,
      from_account,
      to_account,
      account,
      payment_type,
      amount,
      note,
      azureId,
      assetId,
      rate,
      order,
      receivingCurrency,
      spendingCurrency,
      orderType,
      transactionFee,
      exchangeFee,
      spendingAmount,
      receivingAmount,
    };

    // await createTransactions(responseData);

    if (
      operationType === "1" ||
      operationType === "5" ||
      operationType === "2"
    ) {
      const [res, error] = await createTransactions(responseData);

      if (res?.success && res?.message) {
        toast.success(res.message);
      }
    }

    if (operationType === "8") {
      const [res] = await updateTransactionFeeValue(responseData);

      if (res?.success) {
        res?.message && toast.success(res?.message);
      }
    }

    // responseData = {
    //   ...responseData,
    // };
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Header head={"Create transactions"} />
      <br />

      <HeaderLayout name={"General"}>
        <div className="grid grid-cols-2 gap-5">
          {/* transfer  */}
          <SelectComponent
            control={control}
            options={transferTypeList}
            label="Transfer type"
            required={true}
            name="operationType"
            rules={{ required: "Transfer type is required" }}
          />
          {/* deposit  */}
          {fieldValue === "8" && (
            <InputComponent
              control={control}
              label="Reference transaction"
              name="reference_transaction"
              rules={{ required: "Reference transaction is required" }}
              required={true}
              type="text"
              watch={watch}
            />
          )}
          {/* from account  */}
          {(fieldValue === "2" || fieldValue === "6" || fieldValue === "5") && (
            // <SelectComponent
            //   control={control}
            //   options={userAssets}
            //   valueKey="value"
            //   labelKey="label"
            //   label="From account"
            //   required={true}
            //   name="account"
            //   rules={{ required: "From account is required" }}
            // />

            <div className="mb-4 mt-3 w-full">
              <label htmlFor={"account"} className="subText mb-1 block">
                {"From account"}{" "}
              </label>

              <Controller
                control={control}
                name="account"
                rules={{
                  required: "From account is required",
                }}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <Fragment>
                    <Autocomplete
                      size="small"
                      id="combo-box-demo"
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" />
                      )}
                      noOptionsText="Type to search"
                      onChange={(_, nextValue) => {
                        onChange(nextValue?.value ?? "");
                      }}
                      options={filtersOptions}
                      onInputChange={handleInputChange}
                      getOptionLabel={(option) => {
                        return option.label ?? "";
                      }}
                      isOptionEqualToValue={(_, option) => {
                        return _.value === option.label;
                      }}
                    />
                    <p className="text-sm text-red-500">{error?.message}</p>
                  </Fragment>
                )}
              />
            </div>
          )}
          {/* To Account (Exchange) */}
          {fieldValue === "5" && (
            <SelectComponent
              control={control}
              options={toAccountAssets}
              label="To account"
              required={true}
              name="toAccount"
              valueKey="currencyName"
              rules={{ required: "To account is required" }}
            />
          )}
          {/* Order */}
          {fieldValue === "5" && (
            <SelectComponent
              control={control}
              options={orderList}
              required={true}
              label="Order"
              name="order"
              rules={{ required: "Order is required" }}
            />
          )}
          {/* Order Type */}
          {fieldValue === "5" && (
            <SelectComponent
              control={control}
              options={orderTypeList}
              label="Order Type"
              required={true}
              name="orderType"
              rules={{ required: "Order Type is required" }}
            />
          )}
          {/* {fieldValue === "5" && (
            <SelectComponent
              control={control}
              options={pairs}
              label="Asset pair"
              required={true}
              name="assetPair"
              rules={{ required: "Asset pair is required" }}
            />
          )} */}
          {/* to account  */}
          {fieldValue === "6" && (
            <SelectComponent
              control={control}
              options={userAssets}
              required={true}
              valueKey="value"
              labelKey="label"
              label="To account"
              name="to_account"
              rules={{ required: "To account is required" }}
            />
          )}
          {fieldValue === "5" && (
            <div className=" flex ">
              <InputComponent
                control={control}
                errors={errors}
                required={true}
                label="Debit Amount"
                name="volume"
                rules={{ required: "Debit Amount is required" }}
                type="text"
              />

              {/* <SelectComponent
                control={control}
                options={filteredCurriencyPair}
                required={true}
                valueKey="value"
                label="Currency"
                name="currency"
                rules={{ required: "Currency is required" }}
              /> */}
            </div>
          )}
          {fieldValue === "5" && (
            <InputComponent
              control={control}
              errors={errors}
              required={true}
              label="Credit Amount "
              name="total"
              rules={{ required: "Credit Amount is required" }}
              type="number"
            />
          )}

          {fieldValue === "5" && (
            <InputComponent
              control={control}
              errors={errors}
              required={true}
              label="Rate"
              name="rate"
              rules={{ required: "Rate is required" }}
              type="text"
            />
          )}

          {fieldValue === "5" && (
            <InputComponent
              control={control}
              errors={errors}
              required={true}
              label="Transaction Fee (Amount)"
              name="transactionFee"
              rules={{ required: "Transaction Fee (Amount) is required" }}
              type="text"
            />
          )}
          {fieldValue === "5" && (
            <InputComponent
              control={control}
              errors={errors}
              required={true}
              label=" Exchange Fee (Amount)"
              name="exchangeFee"
              rules={{ required: " Exchange Fee (Amount) is required" }}
              type="text"
            />
          )}
          {/* account  */}
          {(fieldValue === "1" || fieldValue === "8") && (
            <>
              {/* <SelectComponent
                control={control}
                options={userAssets}
                valueKey="value"
                labelKey="label"
                label="Account"
                name="account"
                rules={{ required: "Account is required" }}
              /> */}
              <div className="mb-4 mt-3 w-full">
                <label htmlFor={"account"} className="subText mb-1 block">
                  {"Account"}{" "}
                </label>

                <Controller
                  control={control}
                  name="account"
                  rules={{
                    required: "Please select an account",
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
                          onChange(nextValue?.value ?? "");
                        }}
                        options={filtersOptions}
                        onInputChange={handleInputChange}
                        getOptionLabel={(option) => {
                          return option.label ?? "";
                        }}
                        isOptionEqualToValue={(_, option) => {
                          return _.value === option.label;
                        }}
                      />
                      <p className="text-sm text-red-500">{error?.message}</p>
                    </Fragment>
                  )}
                />
              </div>
            </>
          )}
          {/* Payment type  */}
          {(fieldValue === "1" || fieldValue === "2") && (
            <SelectComponent
              control={control}
              options={providerList}
              required={true}
              label="Payment type"
              name="payment_type"
              rules={{ required: "Payment type is required" }}
            />
          )}
          {/* amount negative  */}
          {(fieldValue === "2" || fieldValue === "6") && (
            <InputComponent
              control={control}
              errors={errors}
              label="Amount(Should be a negative value)"
              required={true}
              name="amount"
              rules={{
                required: "Amount is required",

                validate: (value: string) => {
                  const intValue = Number(value);

                  if (isNaN(intValue) || intValue > 0) {
                    return "Please enter a negative number eg: -10";
                  }
                  return true;
                },
              }}
              type="text"
              watch={watch}
            />
          )}

          {/* positive amount  */}
          {(fieldValue === "1" || fieldValue === "8") && (
            <InputComponent
              control={control}
              label="Amount(Should be a positive value)"
              name="amount"
              rules={{
                required: "Amount is required",

                validate: (value: string) => {
                  const intValue = Number(value);

                  if (isNaN(intValue) || intValue < 0) {
                    return "Please enter a positive number eg: 10";
                  }
                  return true;
                },
              }}
              required={true}
              type="text"
              watch={watch}
            />
          )}
          {/* amount  */}
          {/* {fieldValue === "8" && (
            <InputComponent
              control={control}
              label="Amount"
              required={true}
              name="amount"
              rules={{ required: "Amount is required" }}
              type="text"
              watch={watch}
            />
          )} */}
        </div>

        {/* currency  */}
        {/* <SelectComponent
          control={control}
          options={assets}
          label="Currency"
          valueKey="fireblockAssetId"
          labelKey="name"
          name="currencyId"
          rules={{ required: "Currency is required" }}
          watch={watch}
        /> */}

        {(fieldValue === "1" || fieldValue === "2" || fieldValue === "8") && (
          <InputComponent
            control={control}
            label="Currency"
            required={true}
            name="assetId"
            rules={{ required: "Currency is required" }}
            type="text"
            watch={watch}
            disabled
          />
        )}

        <div className=" hidden">
          <InputComponent
            control={control}
            label="UserId"
            required={true}
            name="azureId"
            rules={{ required: "UserId is required" }}
            type="text"
            watch={watch}
          />
        </div>
        {orderTypeValue === "5" && (
          <InputComponent
            control={control}
            errors={errors}
            label="Price"
            required={true}
            name="price"
            rules={{ required: "Price is required" }}
            type="text"
            watch={watch}
          />
        )}

        <div>
          <label htmlFor={"text"} className="subText mb-1">
            Details <span className=" text-[#565656]">*</span>
          </label>

          <Controller
            name={"note"}
            control={control}
            rules={{ required: "Details is required" }}
            render={({ field }) => (
              <div>
                <TextareaAutosize
                  className=" rounded border border-[#c4c4c4] pl-2 hover:border-none hover:outline hover:outline-1"
                  minRows={4}
                  style={{ width: "100%", resize: "none" }}
                  {...field}
                />
                <p className="text-sm text-red-500">{errors.note?.message}</p>
              </div>
            )}
          />
        </div>
      </HeaderLayout>

      {(fieldValue === "1" || fieldValue === "2") && (
        <HeaderLayout name={"Bank Details"}>
          <div className="grid grid-cols-2 gap-5">
            {fieldValue === "1" && (
              <InputComponent
                control={control}
                errors={errors}
                label="Sender name"
                name="sender_name"
                type="text"
                watch={watch}
              />
            )}

            {fieldValue === "2" && (
              <InputComponent
                control={control}
                errors={errors}
                label="Beneficiary name"
                name="beneficiary_name"
                type="text"
                watch={watch}
              />
            )}
            <InputComponent
              control={control}
              errors={errors}
              label="Account number"
              name="account_number"
              type="text"
              watch={watch}
            />

            <InputComponent
              control={control}
              errors={errors}
              label=" BIC/SWIFT"
              name="bic"
              type="text"
              watch={watch}
            />

            {fieldValue === "1" && (
              <InputComponent
                control={control}
                errors={errors}
                label=" Sender address"
                name="sender_address"
                type="text"
                watch={watch}
              />
            )}

            {fieldValue === "2" && (
              <InputComponent
                control={control}
                errors={errors}
                label="Beneficiary address"
                name="beneficiary_address"
                type="text"
                watch={watch}
              />
            )}

            {fieldValue === "1" && (
              <InputComponent
                control={control}
                errors={errors}
                type="text"
                watch={watch}
                label="Sender city"
                name="sender_city"
              />
            )}

            {fieldValue === "2" && (
              <InputComponent
                type="text"
                watch={watch}
                control={control}
                errors={errors}
                label="Beneficiary city"
                name="beneficiary_city"
              />
            )}

            {fieldValue === "1" && (
              <InputComponent
                control={control}
                errors={errors}
                label="Sender postal code"
                name="sender_postal_code"
                type="text"
                watch={watch}
              />
            )}

            {fieldValue === "2" && (
              <InputComponent
                control={control}
                errors={errors}
                label="Beneficiary postal code"
                name="beneficiary_postal_code"
                type="text"
                watch={watch}
              />
            )}

            {fieldValue === "1" && (
              <InputComponent
                control={control}
                errors={errors}
                label="Sender state"
                name="sender_state"
                type="text"
                watch={watch}
              />
            )}

            {fieldValue === "2" && (
              <InputComponent
                control={control}
                errors={errors}
                label="Beneficiary state"
                name="beneficiary_state"
                type="text"
                watch={watch}
              />
            )}

            {fieldValue === "1" && (
              <SelectComponent
                control={control}
                options={countries}
                label="Sender country"
                name="sender_country"
              />
            )}

            {fieldValue === "2" && (
              <SelectComponent
                control={control}
                options={countries}
                label="Beneficiary country"
                name="beneficiary_country"
              />
            )}

            <InputComponent
              control={control}
              errors={errors}
              label="Bank name"
              name="bank_name"
              type="text"
              watch={watch}
            />

            <SelectComponent
              control={control}
              label="Bank Country"
              name="bank_country"
              options={countries}
            />

            <InputComponent
              control={control}
              errors={errors}
              label="Bank address"
              name="bank_address"
              type="text"
              watch={watch}
            />
          </div>
        </HeaderLayout>
      )}

      <div className="mb-4 flex w-full justify-end gap-4 px-3">
        <Button
          title="Cancel"
          onClick={() => {
            handleNavigate("/banking/transactions");
          }}
          className="btn-outlined"
        ></Button>
        <Button
          title="Create a transaction"
          type="submit"
          className="btn-solid"
          loading={isSubmitting}
        ></Button>
      </div>
    </form>
  );
};

export default AddTransaction;
