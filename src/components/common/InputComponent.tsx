/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { useState, type FC } from "react";
import { Controller } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
interface InputProps extends TextFieldProps<"standard"> {
  name: string;
  label?: string;
  control: any;
  watch?: any;
  errors?: any;
  required?: boolean;
  placeholder?: string;
  type: "text" | "number" | "email" | "password" | "url" | "date" | "tel";
  rules?: {
    required?: string | { value: boolean; message: string };
    validate?: any;
  };
  bottomText?: string;
  max?: any;
  min?: any;
  copy?: any;
}

const InputComponent: FC<InputProps> = ({
  name,
  label,
  control,
  required,
  placeholder,
  rules,
  bottomText,
  type,
  max,
  min,
  copy,
  ...props
}) => {
  const [eye, setEye] = useState(false);
  const toggleBtn = () => {
    setEye((prevState) => !prevState);
  };

  return (
    <div className="mb-4 mt-3 w-full">
      <label htmlFor={name} className="subText mb-1 block">
        {label}
        {required && <span className=" text-[#565656]"> *</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => {
          const handleCopy = async () => {
            await navigator.clipboard.writeText(field.value);
          };

          return (
            <div className="relative">
              <TextField
                type={eye ? "text" : type}
                id={name}
                size="small"
                placeholder={placeholder}
                className="w-full rounded border border-slate-400 bg-white"
                {...field}
                value={
                  type === "date"
                    ? field.value?.split("T")[0]
                    : field.value ?? ""
                }
                InputProps={{
                  inputProps: {
                    max: type === "date" ? max : undefined,
                    min: type === "date" ? min : undefined,
                  },
                  endAdornment: copy ? (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopy} edge="end">
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                {...props}
              />
              {type === "password" && (
                <div
                  className="absolute right-5 top-[12px]"
                  onClick={toggleBtn}
                >
                  {eye ? (
                    <FiEyeOff size={15} className="text-[#666666]" />
                  ) : (
                    <FiEye size={15} className="text-[#666666]" />
                  )}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500">{error?.message}</p>
              )}
            </div>
          );
        }}
      />
      {bottomText && <span className=" pt-1 text-[#BABABA]">{bottomText}</span>}
    </div>
  );
};

export default InputComponent;
