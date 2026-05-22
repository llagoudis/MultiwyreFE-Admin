import React, { type FC } from "react";
import DailogBox from "~/components/common/DailogBox";
import Button from "~/components/common/Button";
import checkicon from "~/assets/general/check-one.svg";
import Image, { type StaticImageData } from "next/image";

interface SuccessProps {
  open: boolean;
  onClose(): void;
  header: string;
  message?: string;
}

const SuccessPopup: FC<SuccessProps> = ({ open, onClose, header, message }) => {
  return (
    <DailogBox maxWidth={"xs"} open={open} handleClose={onClose}>
      <div className="flex flex-col items-center gap-5 text-center">
        <div>
          <Image src={checkicon as StaticImageData} alt="" />
        </div>
        <h1 className="text-2xl font-semibold text-black">{header}</h1>
        <p>{message}</p>

        <Button className="btn-solid w-full" title="Close" onClick={onClose} />
      </div>
    </DailogBox>
  );
};
export default SuccessPopup;
