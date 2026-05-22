import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Button from "~/components/common/Button";
import DailogBox from "~/components/common/DailogBox";
import HeaderLayout from "~/components/common/HeaderLayout";
import InputComponent from "~/components/common/InputComponent";
import SelectComponent from "~/components/common/SelectComponent";
import { clientType, providerList } from "~/data/country";
import { useAsyncMasterStore } from "~/hook/useAsyncMasterStore";
import { fetchUsers } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { addUserAccount } from "~/service/api";
import Image, { type StaticImageData } from "next/image";
import checkicon from "~/assets/general/check-one.svg";

type formData = {
  azureId: string;
  Name: string;
  provider: string;
  provider_currency: string;
  account_type: string;
  feeActivatedAt: string;
  automaticFeeActivation: string;
};

const accountArray = [
  { label: "Standard ", value: "Standard" },
  { label: "Finance", value: "Finance" },
  { label: "Crypto", value: "Crypto" },
];

const activationArray = [
  { label: "Disabled", value: "Disabled" },
  { label: "Account activation time", value: "Account activation time" },
  { label: "First day of the month", value: "First day of the month" },
];

const AddAccount = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<formData>();

  const onSubmit = async (values: formData) => {
    if (values.provider !== "15") {
      toast.error("Only Fireblocks provider is available");
    } else {
      setLoading(true);
      const [data, error] = await addUserAccount(values);

      if (data?.success) {
        setAzureId(values.azureId);
        setOpenAdd(!openAdd);
      }
      setLoading(false);
    }
  };

  const router = useRouter();

  const { query } = router;

  const [openAdd, setOpenAdd] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [azureId, setAzureId] = useState<string>("");

  const getUsers = async () => {
    const [data, error]: APIResult<User[]> = await ApiHandler(fetchUsers);
    if (error) {
      toast.error("Failed to load users");
    }

    if (data?.success) {
      setUsers(data.body);
    }
  };

  const [assets] = useAsyncMasterStore("assets");

  useEffect(() => {
    void getUsers();
  }, []);

  return (
    <>
      <div>
        <div className=" flex items-center justify-between py-4">
          <div>
            <p className=" text-2xl font-bold text-[#1E293B]">
              {query?.from === "create" ? "Add account" : "Edit accounts"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <HeaderLayout
            name={query?.from === "create" ? "Add account" : "Edit accounts"}
          >
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <SelectComponent
                  control={control}
                  options={users.map((obj) => ({
                    value: obj.azureId,
                    label: `${obj.firstname} ${obj.lastname}`,
                  }))}
                  required={true}
                  label="Client"
                  name="azureId"
                  rules={{ required: "Client is required" }}
                />
                <SelectComponent
                  control={control}
                  options={clientType}
                  label="Client type"
                  name="client_type"
                />

                {/* <InputComponent
                  control={control}
                  errors={errors}
                  required={true}
                  label="Name"
                  name="Name"
                  rules={{ required: "Name is required" }}
                  type="text"
                  watch={watch}
                /> */}

                {/* <InputComponent
                  control={control}
                  errors={errors}
                  required={true}
                  label="Provider Number"
                  name="provider_number"
                  type="text"
                  watch={watch}
                /> */}

                <SelectComponent
                  control={control}
                  options={[
                    ...assets?.filter((val) => val.name !== "Any"),
                    { fireblockAssetId: "EUR", name: "Euro" },
                  ]}
                  label="Provider Currency"
                  valueKey="fireblockAssetId"
                  labelKey="name"
                  name="assetId"
                  rules={{
                    required: "Provider currency is required",
                  }}
                />

                <SelectComponent
                  required={true}
                  control={control}
                  options={providerList}
                  label="Provider Name"
                  name="provider"
                />

                <SelectComponent
                  control={control}
                  options={accountArray}
                  label="Account Type"
                  name="account_type"
                  // rules={{ required: "Account Type is required" }}
                />

                <InputComponent
                  control={control}
                  errors={errors}
                  label="Fee activated at"
                  name="feeActivatedAt"
                  type="date"
                  watch={watch}
                  rules={{ required: "Fee activated at is required" }}
                />

                <SelectComponent
                  control={control}
                  options={activationArray}
                  label="Automatic fee activation"
                  name="automaticFeeActivation"
                  // rules={{ required: "Automatic Fee Activation is required" }}
                />
              </div>
            </div>
          </HeaderLayout>

          <div className="mt-8 flex w-full justify-end gap-4 px-3   ">
            <Button
              title="Cancel"
              className="btn-outlined"
              onClick={() => {
                router.back();
              }}
            ></Button>
            <Button
              title={
                query?.from === "create" ? "Create account" : "Save changes"
              }
              type="submit"
              className="btn-solid"
              loading={loading}
            ></Button>
          </div>
        </form>
      </div>
      <DailogBox
        maxWidth={"xs"}
        open={openAdd}
        handleClose={() =>
          void router.push(`/banking/individuals/view/${azureId}`)
        }
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <Image src={checkicon as StaticImageData} alt="" />
          </div>
          <h1 className="text-2xl font-semibold text-black">
            {"Account created successfully"}
          </h1>
          <p>{"New account creation successfull"}</p>

          <Button
            className="btn-solid w-full"
            title="Close"
            onClick={() =>
              void router.push(`/banking/individuals/view/${azureId}`)
            }
          />
        </div>
      </DailogBox>
    </>
  );
};

export default AddAccount;
