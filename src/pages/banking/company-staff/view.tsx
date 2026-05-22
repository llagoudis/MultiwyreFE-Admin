import React, { useEffect, useState } from "react";
import HeaderLayout from "~/components/common/HeaderLayout";
import { useRouter } from "next/router";
import Button from "~/components/common/Button";
import Header from "~/components/common/Header";
import { getStaffById } from "~/service/api";
import Link from "next/link";

const ViewCompanyStaff = () => {
  const router = useRouter();
  const [association, setAssociation] = useState<UserCompanyAssociations>();
  const associationId = router.query.id as string;
  const from = router.query.from as string;

  const handleNavigate = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  useEffect(() => {
    if (from === "company") {
      sessionStorage.setItem("companiesActiveTab", "3");
    }

    if (associationId) {
      void getStaffById(associationId).then(([res]) => {
        setAssociation(res?.body);
      });
    }
  }, [associationId, from]);

  const roleLower = association?.roles.toLowerCase();
  const actualRole = roleLower?.includes("ex_user_viewer") ? "Viewer" : "Admin";

  return (
    <div className="my-4">
      <Header head="Company Staff" />
      <div className="mt-4"></div>
      <HeaderLayout name={"Company Staff"} enabled={"Enabled"}>
        <div className="flex justify-between gap-5">
          <div>
            <p>Company*</p>
            <Link
              href={`/banking/companies/view/${association?.CompanyProfile?.id}`}
              className="text-blue-600 underline"
            >
              {association?.CompanyProfile?.companyName}
            </Link>
          </div>
          <div>
            <p>Person</p>
            <Link
              href={`/banking/individuals/view/${association?.owner?.azureId}`}
              className="text-blue-600 underline"
            >
              {`${association?.owner.firstname ?? ""} ${
                association?.owner?.lastname ?? ""
              }`}
            </Link>
          </div>
          <div>
            <p>Permissions</p>
            <p className="mt-2 font-semibold text-black">{actualRole}</p>
          </div>
          <div>
            <p>Enabled</p>
            <p className="mt-2 font-semibold text-black">No</p>
          </div>
        </div>

        <br />
        <br />

        <div className="flex w-full justify-end gap-4">
          <Button
            title="Back"
            onClick={() => {
              router.back();
            }}
            className="btn-outlined"
          />
          <Button
            title="Edit"
            onClick={() => {
              handleNavigate("/banking/company-staff/form", {
                id: associationId,
              });
            }}
            className="btn-solid"
          />
        </div>
      </HeaderLayout>
    </div>
  );
};

export default ViewCompanyStaff;
