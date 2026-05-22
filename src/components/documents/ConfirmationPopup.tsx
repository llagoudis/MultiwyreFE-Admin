import React, { type FC, useState } from "react";
import DailogBox from "~/components/common/DailogBox";
import MuiButton from "~/components/common/Button";

interface ConfirmationProps {
  open: boolean;
  onClose(): void;
  onConfirm?(): Promise<void> | void;
  header: string;
  subHeader: string;
}

const ConfirmationPopup: FC<ConfirmationProps> = ({
  open,
  onClose,
  onConfirm,
  header,
  subHeader,
}) => {
  const [loading, setLoading] = useState(false);

  const _onConfirm = async () => {
    if (onConfirm) {
      setLoading(true);
      await onConfirm();
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <DailogBox maxWidth={"sm"} open={open} handleClose={onClose}>
      <div className="flex flex-col gap-4 ">
        <h2 className="text-xl font-semibold text-black">{header}</h2>
        <p>{subHeader}</p>
        <div className="flex justify-end gap-4">
          <MuiButton
            className="btn-outlined "
            title="No, cancel"
            onClick={onClose}
          />
          <MuiButton
            className="btn-solid text-white"
            title="Yes, confirm"
            onClick={_onConfirm}
            loading={loading}
          />
        </div>
      </div>
    </DailogBox>
  );
};

export default ConfirmationPopup;
