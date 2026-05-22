import {
  Autocomplete,
  CircularProgress,
  Drawer,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import SelectComponent from "~/components/common/SelectComponent";
import {} from "~/service/api/pricelists";
import CloseIcon from "@mui/icons-material/Close";
import MuiButton from "~/components/common/Button";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import {
  createAutoconversion,
  searchableProjects,
  updateAutoConversion,
} from "~/service/api/ecommerce";
import toast from "react-hot-toast";
type propType = {
  onClose: () => void;
  merchant?: Merchant;
  openAdd: string;
  getById: string | number;
  getRowData: any;
};

const AddAutoConversion = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: {},
    reset,
    watch,
  } = useForm<AutoConversions>();

  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const openAddedit = props?.openAdd === "edit";
  const Id = props.getById;
  const [openAdd, setOpenAdd] = useState(false);

  const onSubmit = async (formValues: AutoConversions) => {
    const createFormValues = formValues;
    const { ...filteredFormValues } = formValues;
    const requestBody = {
      ...filteredFormValues,
      Id,
    };
    setLoadingBtn(true);
    try {
      if (openAddedit) {
        await updateAutoConversion(requestBody);
      } else {
        await createAutoconversion(createFormValues);
      }
      setLoadingBtn(false);
      props.onClose();
    } catch (error) {
      toast.error("Error saving Merchant");
    }
  };

  const [projectInputValue, setProjectInputValue] = useState("");
  const [projectOptions, setProjectOptions] = useState<Merchant[]>([]);
  const [selectedProject, setSelectedProject] = useState<Merchant | null>(null);

  const handleChange = () => {
    setOpenAdd(!openAdd);
  };

  useEffect(() => {
    if (openAddedit) {
      reset(props.getRowData);
      setSelectedProject(props.getRowData?.Merchant || null);
    } else {
      reset();
      setSelectedProject(null);
    }
  }, [openAddedit, reset, props.getRowData]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (projectInputValue === "") {
        setProjectOptions([]);
        return;
      }

      setLoading(true);
      try {
        const projects: any = await searchableProjects(projectInputValue);

        setProjectOptions(projects[0].body);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    void fetchProjects();
  }, [projectInputValue]);

  let [assets] = useAsyncMasterStore("assets");

  assets = assets.filter((item) => item.fireblockAssetId !== "ANY");

  const targetAsset = watch("targetAsset");
  const finalAsset = watch("finalAsset");

  return (
    <Drawer anchor={"right"} open={true}>
      <form onSubmit={handleSubmit(onSubmit)} className="my-3 w-[30vw] p-4">
        <div className=" flex items-center justify-between pb-4 pt-4 ">
          <p className=" text-2xl font-medium">
            {props.openAdd === "edit"
              ? "Edit Auto Conversion"
              : "Add New Auto Conversion"}
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
            name="projectId"
            rules={{
              required: "Project is required",
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Fragment>
                <p className="mb-1 font-semibold text-[#565656]">
                  Project Name *
                </p>
                <Autocomplete
                  disablePortal
                  size="small"
                  id="combo-box-demo"
                  options={projectOptions.filter(
                    (option) => option !== null && option !== undefined,
                  )}
                  getOptionLabel={(option) => option.projectName}
                  value={selectedProject}
                  onInputChange={(event, newInputValue) => {
                    setProjectInputValue(newInputValue);
                  }}
                  onChange={(_, nextValue) => {
                    setSelectedProject(nextValue);
                    onChange(nextValue?.projectId ?? "");
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

          <div className="mt-4 flex items-center justify-between ">
            <p className="subText">Status</p>
            <Controller
              name="status"
              control={control}
              // rules={{ required: true }}
              render={({ field }) => (
                <RadioGroup
                  row
                  {...field}
                  value={field?.value ? "active" : "disable"} // Convert boolean to string
                  onChange={(event) =>
                    field.onChange(event.target.value === "active")
                  }
                >
                  <FormControlLabel
                    value="active"
                    control={<Radio />}
                    label="Active"
                  />
                  <FormControlLabel
                    value="disable"
                    control={<Radio />}
                    label="Disable"
                  />
                </RadioGroup>
              )}
            />
          </div>

          <SelectComponent
            control={control}
            options={assets.filter(
              (item) =>
                item.fireblockAssetId !== finalAsset &&
                item.fireblockAssetId !== "USD" &&
                item.fireblockAssetId !== "EUR" &&
                item.fireblockAssetId !== "USDC_BSC" &&
                item.fireblockAssetId !== "USDT_BSC",
            )}
            required={true}
            valueKey="fireblockAssetId"
            labelKey="name"
            label="Target Asset"
            name="targetAsset"
            rules={{ required: "Target Asset is required" }}
          />

          <SelectComponent
            control={control}
            options={assets.filter(
              (item) =>
                item.fireblockAssetId !== targetAsset &&
                item.fireblockAssetId !== "USD" &&
                item.fireblockAssetId !== "USDC_BSC" &&
                item.fireblockAssetId !== "USDT_BSC",
            )}
            required={true}
            valueKey="fireblockAssetId"
            labelKey="name"
            label="Final Asset"
            name="finalAsset"
            rules={{ required: "Final Asset is required" }}
          />
        </div>

        <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
          <MuiButton
            title={props.openAdd === "edit" ? "Update" : "Add Auto Conversion"}
            type="submit"
            className=" btn-solid"
            onClick={handleChange}
            loading={loadingBtn}
          ></MuiButton>
        </div>
      </form>
    </Drawer>
  );
};

export default AddAutoConversion;
