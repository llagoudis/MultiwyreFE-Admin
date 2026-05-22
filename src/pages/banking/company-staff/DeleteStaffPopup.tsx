import ConfirmationPopup from "~/components/documents/ConfirmationPopup";

import React from "react";
import { deleteCompanyStaff } from "~/service/api";

const DeleteStaffPopup = ({
  associationId,
  onClose,
  onConfirm,
}: {
  associationId: string;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <ConfirmationPopup
      open={!!associationId}
      header="Are you sure want to delete this Staff ?"
      subHeader="By doing this action the staff will be removed permanently. Are
  you sure you want to remove this staff"
      onClose={onClose}
      onConfirm={async () => {
        const [res] = await deleteCompanyStaff(associationId);
        res?.success && onConfirm();
      }}
    />
  );
};

export default DeleteStaffPopup;
