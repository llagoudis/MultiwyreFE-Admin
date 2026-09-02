import { MenuItem, Select } from "@mui/material";
import { type FC } from "react";
import { Controller } from "react-hook-form";

type optionType = Record<string, any>;

interface InputProps {
  name: string;
  options: optionType[];
  label: string;
  control: any;
  required?: boolean;
  labelKey?: string;
  valueKey?: string;
  getOptionLabel?(option: optionType): string;
  rules?: {
    required?: string | { value: boolean; message: string };
    validate?: any;
  };
  disabled?: boolean;
}

const SelectComponent: FC<InputProps> = ({
  name,
  label,
  control,
  rules,
  required,
  options,
  valueKey,
  labelKey,
  getOptionLabel,
  disabled,
  ...props
}) => {
  const getOptionValue = (option: optionType, index: number) => {
    if (valueKey) {
      return option[valueKey];
    }
    return option.value ?? index;
  };

  const getOptionText = (option: optionType) => {
    if (getOptionLabel) return getOptionLabel(option);
    if (labelKey) return option[labelKey];
    return option.label;
  };

  return (
    <div className="mb-4 mt-3 w-full">
      <label htmlFor={name} className="subText mb-1 block">
        {label} {required && <span className=" text-[#565656]">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => {
          const selectedValue =
            field.value === undefined || field.value === null
              ? ""
              : field.value;

          return (
            <div>
              <Select
                id={name}
                size="small"
                displayEmpty
                {...props}
                name={field.name}
                value={selectedValue}
                onBlur={field.onBlur}
                inputRef={field.ref}
                onChange={(event) => field.onChange(event.target.value)}
                className="w-full rounded bg-white"
                disabled={disabled}
                MenuProps={{
                  disableScrollLock: true,
                  sx: { zIndex: 1500 },
                  PaperProps: {
                    style: { maxHeight: 320 },
                  },
                }}
                renderValue={(value) => {
                  if (value === "" || value === undefined || value === null) {
                    return (
                      <span className="text-sm text-[#94A3B8]">
                        Select {label.toLowerCase()}
                      </span>
                    );
                  }

                  const match = options.find(
                    (option, index) =>
                      String(getOptionValue(option, index)) === String(value),
                  );

                  return match ? getOptionText(match) : String(value);
                }}
              >
                <MenuItem disabled value="">
                  <em>Select {label.toLowerCase()}</em>
                </MenuItem>
                {options.map((code, index) => {
                  const optionValue = getOptionValue(code, index);
                  return (
                    <MenuItem
                      key={String(optionValue)}
                      value={optionValue}
                      className="font-small cursor-pointer"
                    >
                      {getOptionText(code)}
                    </MenuItem>
                  );
                })}
              </Select>
              {error && (
                <p className="text-sm text-red-500">{error.message}</p>
              )}
              {!disabled && options.length === 0 && (
                <p className="mt-1 text-xs text-[#94A3B8]">
                  No options available
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default SelectComponent;
