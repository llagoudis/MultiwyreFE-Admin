import {
  Autocomplete,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  TextField,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import InputComponent from "~/components/common/InputComponent";
import CloseIcon from "@mui/icons-material/Close";
import { searchableCompanies } from "~/service/api/ecommerce";
import toast from "react-hot-toast";
import {
  createCheckoutMerchant,
  updateCheckoutMerchants,
} from "~/service/api/checkoutMerchant";
import SelectComponent from "../common/SelectComponent";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { ApiHandler } from "~/service/UtilService";
import { getAllAcquirers } from "~/service/ApiRequests";
import MuiButton from "~/components/common/Button";

type Mapping = {
  paymentMethod: number;
  acquirer: number;
};

type Merchant = {
  projectName: string;
  webURL: string;
  company: string;
  companyId?: string;
  User?: User;
  publicKey?: string;
  privateKey?: string;
  callbackURL?: string;
  id: string;
  azureId: string;
  MerchantWallets: MerchantWallet[];
  UserAssets: UserAssets[];
  payoutType?: string;
  walletAddress?: string;
  mappings?: Mapping[];
};

interface MerchantWallet {
  id: number;
  assetId: string;
  balance: number;
}

type propType = {
  onClose: () => void;
  merchant?: Merchant;
  openAdd: string;
  getById: string;
  getRowData: any;
  onFetch: () => void;
  acquirers: Acquirer[];
};
const AddMarchantsProcessing = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<Merchant>({
    defaultValues: {
      mappings: [
        { paymentMethod: NaN, acquirer: NaN }, // first row
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "mappings",
  });

  const Id = props.getById;
  const payoutType = watch("payoutType");

  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<User[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<User | null>();
  const [companyInputValue, setCompanyInputValue] = useState("");
  const [paymentMethods] = useAsyncMasterStore("paymentMethods");
  const openAddedit = props?.openAdd === "edit";

  useEffect(() => {
    if (openAddedit) {
      reset(props.getRowData);
      setSelectedCompany(props.getRowData?.User || null);
    } else {
      reset();
      setSelectedCompany(null);
    }
  }, [openAddedit, props.getRowData, reset]);

  const onSubmit = async (formValues: Merchant) => {
    const createFormValues = formValues;
    const { publicKey, privateKey, ...filteredFormValues } = formValues;
    const requestBody = {
      ...filteredFormValues,
      Id,
    };
    setLoadingBtn(true);
    try {
      if (openAddedit) {
        await updateCheckoutMerchants(requestBody);
      } else {
        await createCheckoutMerchant(createFormValues);
      }
      setLoadingBtn(false);
      // toast.success("Merchant saved successfully");
      props.onFetch();
    } catch (error) {
      toast.error("Error saving Merchant");
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      if (companyInputValue === "") {
        setCompanyOptions([]);
        return;
      }

      setLoading(true);
      try {
        const companies: any = await searchableCompanies(companyInputValue);

        setCompanyOptions(companies[0].body);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    void fetchCompanies();
  }, [companyInputValue]);

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  const getFilteredAcquirers = (paymentMethodId: number) => {
    if (!paymentMethodId) return [];

    return props?.acquirers?.filter(
      (a) =>
        Array.isArray(a.paymentIds) && a.paymentIds.includes(paymentMethodId),
    );
  };

  return (
    <Drawer anchor={"right"} open={true}>
      <form onSubmit={handleSubmit(onSubmit)} className="my-2 w-[45vw] p-7">
        <div className=" flex items-center justify-between pb-4 pt-2 ">
          <p className=" text-2xl font-medium">
            {props.openAdd === "edit" ? "Edit Merchant" : "Add New Merchant"}
          </p>

          <IconButton
            onClick={() => {
              props.onClose();
            }}
          >
            <CloseIcon className="cursor-pointer" />
          </IconButton>
        </div>
        <div className="flex flex-col">
          <Controller
            control={control}
            name="companyId"
            rules={{
              required: "From Company is required",
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Fragment>
                <p className="mb-1 font-semibold text-[#565656]">
                  Company Name *
                </p>
                <Autocomplete
                  disablePortal
                  size="small"
                  id="combo-box-demo"
                  options={companyOptions.filter(
                    (option) => option !== null && option !== undefined,
                  )}
                  getOptionLabel={(option) => option.firstname}
                  value={selectedCompany ? selectedCompany : null}
                  onInputChange={(event, newInputValue) => {
                    setCompanyInputValue(newInputValue);
                  }}
                  onChange={(_, nextValue) => {
                    setSelectedCompany(nextValue);
                    onChange(nextValue?.azureId ?? "");
                  }}
                  loading={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <p className="text-sm text-red-500">{error?.message}</p>
              </Fragment>
            )}
          />

          <InputComponent
            control={control}
            errors={errors}
            label="Project Name"
            required={true}
            name="projectName"
            rules={{ required: "Project is required" }}
            type="text"
            watch={watch}
          />

          <Box className="grid grid-cols-2 gap-4">
            <InputComponent
              control={control}
              errors={errors}
              label="URL"
              required={true}
              name="webURL"
              rules={{ required: "URL is required" }}
              type="text"
              watch={watch}
            />

            <InputComponent
              control={control}
              errors={errors}
              label="Callback URL"
              required={true}
              name="callbackURL"
              rules={{ required: "Callback URL is required" }}
              type="text"
              watch={watch}
            />
          </Box>

          <Controller
            control={control}
            name="payoutType"
            defaultValue="dedicated"
            rules={{ required: "Payout type is required" }}
            render={({ field }) => (
              <div className="mb-4 space-y-4">
                <p className="text-lg font-semibold">Choose payout type</p>

                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 transition ${
                      field.value === "dedicated"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value="dedicated"
                      checked={field.value === "dedicated"}
                      onChange={() => field.onChange("dedicated")}
                      className="accent-blue-600"
                    />
                    <span
                      className={`text-xs font-normal ${
                        field.value === "dedicated"
                          ? " text-[#0051C0]"
                          : "text-black"
                      }`}
                    >
                      Dedicated wallet
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 transition ${
                      field.value === "user"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value="user"
                      checked={field.value === "user"}
                      onChange={() => field.onChange("user")}
                      className="accent-blue-600"
                    />
                    <span
                      className={`text-xs font-normal ${
                        field.value === "user"
                          ? " text-[#0051C0]"
                          : "text-black"
                      }`}
                    >
                      User selected wallet
                    </span>
                  </label>
                </div>
              </div>
            )}
          />

          {payoutType === "dedicated" && (
            <InputComponent
              control={control}
              errors={errors}
              label="Wallet address"
              name="walletAddress"
              placeholder="Enter wallet address"
              rules={{ required: "Wallet address is required" }}
              type="text"
              watch={watch}
            />
          )}

          {fields.map((item, index) => {
            const selectedPaymentMethod = watch(
              `mappings.${index}.paymentMethod`,
            );

            const filteredAcquirers = getFilteredAcquirers(
              selectedPaymentMethod,
            );

            return (
              <div key={item.id} className="flex items-center gap-4">
                {/* Payment Method */}
                <SelectComponent
                  control={control}
                  options={paymentMethods}
                  required={true}
                  labelKey="name"
                  valueKey="id"
                  label="Payment Method"
                  name={`mappings.${index}.paymentMethod`}
                />

                {/* Acquirer */}
                <SelectComponent
                  control={control}
                  options={filteredAcquirers}
                  required={true}
                  labelKey="acquirer"
                  valueKey="id"
                  label="Acquirer"
                  name={`mappings.${index}.acquirer`}
                />

                {/* Delete Button */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-5 text-xl font-bold text-red-600"
                  >
                    &#10007;
                  </button>
                )}
              </div>
            );
          })}

          <MuiButton
            onClick={() => append({ paymentMethod: NaN, acquirer: NaN })}
            className="btn-outlined mt-4"
          >
            + Add More
          </MuiButton>
        </div>

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <Button
            title="Cancel"
            onClick={() => {
              props.onClose();
            }}
            className=" btn-outlined"
          ></Button>
          <Button
            title={
              props.openAdd === "edit" ? "Update Merchant" : "Create Merchant"
            }
            type="submit"
            className=" btn-solid"
            onClick={handleChange}
            loading={loadingBtn}
          ></Button>
        </div>
      </form>
    </Drawer>
  );
};

export default AddMarchantsProcessing;
