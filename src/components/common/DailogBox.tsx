import React, { type FC } from "react";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import closeicon from "../../assets/general/dialogclose.svg";
import Image, { type StaticImageData } from "next/image";
import { type Breakpoint } from "@mui/system";
import DialogContent from "@mui/material/DialogContent";

interface CustomDialogProps extends DialogProps {
  children?: React.ReactNode;
  open: boolean;
  handleClose?(event?: any, reason?: "backdropClick" | "escapeKeyDown"): void;
  maxWidth?: Breakpoint | undefined;
  dailogHeader?: string;
  closeButton?: boolean;
}

const DailogBox: FC<CustomDialogProps> = ({
  children,
  open,
  handleClose,
  maxWidth,
  dailogHeader,
  closeButton = true,
  ...props
}) => {
  return (
    <Dialog
      {...props}
      onClose={handleClose}
      open={open}
      fullWidth
      maxWidth={maxWidth ? maxWidth : "md"}
    >
      <DialogContent sx={{ padding: 2 }}>
        <div
          className={`flex ${dailogHeader ? "justify-between" : "justify-end"}`}
        >
          <p className="subHeader text-black">{dailogHeader}</p>
          {closeButton && (
            <Image
              onClick={handleClose}
              src={closeicon as StaticImageData}
              alt=""
              className="cursor-pointer"
            />
          )}
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DailogBox;
