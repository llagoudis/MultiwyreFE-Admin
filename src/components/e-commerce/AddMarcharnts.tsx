import {
  Autocomplete,
  CircularProgress,
  Drawer,
  TextField,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Button from "~/components/common/Button";
import InputComponent from "~/components/common/InputComponent";
import CloseIcon from "@mui/icons-material/Close";
import {
  createMerchant,
  searchableCompanies,
  updateMerchants,
} from "~/service/api/ecommerce";
import toast from "react-hot-toast";

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
};
const AddMarchants = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<Merchant>();

  const Id = props.getById;

  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<User[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<User | null>();
  const [companyInputValue, setCompanyInputValue] = useState("");
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
        await updateMerchants(requestBody);
      } else {
        await createMerchant(createFormValues);
      }
      setLoadingBtn(false);
      // toast.success("Merchant saved successfully");
      props.onClose();
    } catch (error) {
      toast.error("Error saving Merchant");
      console.error("Error saving Merchant:", error);
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
        console.error("Failed to fetch companies", error);
        setLoading(false);
      }
    };

    void fetchCompanies();
  }, [companyInputValue]);

  const [openAdd, setOpenAdd] = useState(false);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  useEffect(() => {
    // reset({
    //   ...props.recurringFees,
    //   status: props.recurringFees.status ? "active" : "inactive",
    // });
  }, [props]);

  return (
    <Drawer anchor={"right"} open={true}>
      <form onSubmit={handleSubmit(onSubmit)} className="my-4 w-[30vw] p-7">
        <div className=" flex items-center justify-between pb-4 pt-4 ">
          <p className=" text-2xl font-medium">
            {props.openAdd === "edit" ? "Edit Merchant" : "Add New Merchant"}
          </p>

          <div
            onClick={() => {
              props.onClose();
            }}
          >
            <CloseIcon className="cursor-pointer" />
          </div>
        </div>
        <div className="flex  flex-col">
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
          {props.openAdd === "edit" ? (
            <>
              <InputComponent
                control={control}
                copy
                errors={errors}
                label="Public Key"
                disabled
                name="publicKey"
                type="text"
                watch={watch}
              />

              <InputComponent
                control={control}
                copy
                errors={errors}
                label="Private Key"
                disabled
                name="privateKey"
                type="text"
                watch={watch}
              />
            </>
          ) : (
            " "
          )}

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
        </div>

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <Button
            title={
              props.openAdd === "edit" ? "Update Merchant" : "Add Merchant"
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

export default AddMarchants;
