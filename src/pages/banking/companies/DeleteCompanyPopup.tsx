import ConfirmationPopup from "~/components/documents/ConfirmationPopup";
import React from "react";
import { deleteCompany } from "~/service/api";

const DeleteCompanyPopup = ({
    companyId,
    onClose,
    onConfirm,
}: {
    companyId: string;
    onClose: () => void;
    onConfirm: () => void;
}) => {
    return (
        <ConfirmationPopup
            open={!!companyId}
            header="Are you sure want to delete this Company?"
            subHeader="By doing this action the company will be removed permanently. Are
    you sure you want to remove this company"
            onClose={onClose}
            onConfirm={async () => {
                const [res] = await deleteCompany(companyId);
                res?.success && onConfirm();
            }}
        />
    );
};

export default DeleteCompanyPopup;
