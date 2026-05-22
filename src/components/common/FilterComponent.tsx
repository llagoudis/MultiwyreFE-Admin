import React from "react";
import { useForm } from "react-hook-form";
import InputComponent from "./InputComponent";
import SelectComponent from "./SelectComponent";
import MuiButton from "./Button";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { type filterType } from "~/pages/banking/individuals";

type props = {
  fields: filterType[];
  onCloseFilter: (value: any) => void;
  onReset: () => void;
  handleCheckboxChange: (value: string) => void;
};

const FilterComponent = ({
  fields,
  onCloseFilter,
  onReset,
  handleCheckboxChange,
}: props) => {
  const {
    handleSubmit,
    control,
    formState: {},
    watch,
  } = useForm();

  const onSubmit = (values: any) => {
    onCloseFilter(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-start justify-between bg-[#E2E8F080] px-4 py-4">
        <div className="grid w-8/12 grid-cols-1 justify-between gap-5 md:grid-cols-2">
          {fields?.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-full">
                {item.type === "text" ? (
                  <div className="w-full">
                    <InputComponent
                      control={control}
                      name={item.name}
                      label={item.label}
                      watch={watch}
                      type={item.type}
                    />
                  </div>
                ) : item.type === "select" ? (
                  <div className="w-full">
                    <SelectComponent
                      control={control}
                      options={item.list ? item.list : []}
                      name={item.name}
                      label={item.label}
                    />
                  </div>
                ) : item.type === "date" ? (
                  <div className=" w-full">
                    <p className="subText">{item.label}</p>
                    <div className="flex w-1/2 gap-2">
                      <InputComponent
                        control={control}
                        name={`${item.name}_from`}
                        // label={`From`}
                        type={item.type}
                      />

                      <InputComponent
                        control={control}
                        name={`${item.name}_to`}
                        // label={`To`}
                        type={item.type}
                      />
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <RemoveCircleIcon
                onClick={() => {
                  handleCheckboxChange(item.name);
                }}
                className="mt-5 cursor-pointer"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <MuiButton
            title="Filter"
            type="submit"
            className="btn-outlined border-2 border-[#E2E8F0]"
          />
          <MuiButton
            title="Reset"
            onClick={() => {
              onReset();
            }}
            className="btn-outlined border-2 border-[#E2E8F0]"
          />
        </div>
      </div>
    </form>
  );
};

export default FilterComponent;
