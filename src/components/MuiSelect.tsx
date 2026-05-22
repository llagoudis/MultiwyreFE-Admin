import React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

type Optiontype = {
  value: string;
  label: string;
};

type OptionProps = {
  options?: Optiontype[];
  value?: string;
  onChange?: (e: any) => void;
  placeHolder?: string;
  placeHolderColor?: string;
};

function MuiSelect({
  options,
  value,
  onChange,
  placeHolder,
  placeHolderColor,
}: OptionProps) {
  return (
    <FormControl sx={{ width: "100%" }}>
      <Select
        size="small"
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
        value={value}
        sx={{
          fontSize: "14px",
        }}
        MenuProps={{
          style: { width: "200px" }, // Set the desired width here
        }}
        renderValue={(value) => {
          if (!value) {
            return (
              <span
                className={`font-extralight ${
                  placeHolderColor ? placeHolderColor : "text-[#bfbfbf]"
                }`}
              >
                {placeHolder}
              </span>
            );
          }
          return value;
        }}
        onChange={onChange}
        variant="outlined"
      >
        <MenuItem disabled value="">
          <span>{placeHolder}</span>
        </MenuItem>
        {options?.map((option) => (
          <MenuItem
            style={{ whiteSpace: "normal" }}
            key={option.value}
            value={option.label}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default MuiSelect;
