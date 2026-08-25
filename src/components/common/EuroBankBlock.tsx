import React from "react";

/** Standard EUR bank display: Company Name / IBAN / BIC / Bank Name */
export function EuroBankBlock({
  euro,
}: {
  euro?: EuroTransaction | null;
}) {
  if (!euro) return null;
  return (
    <div className="text-xs leading-none">
      <p className="font-semibold">{euro.customerName || "-"}</p>
      <p>
        <span className="font-semibold">IBAN: </span>
        {euro.IBAN || "-"}
      </p>
      <p>
        <span className="font-semibold">BIC: </span>
        {euro.swift || "-"}
      </p>
      <p>
        <span className="font-semibold">Bank Name: </span>
        {euro.bankName || "-"}
      </p>
    </div>
  );
}

export function euroBankDetailsMap(euro?: EuroTransaction | null) {
  return {
    "Company Name": euro?.customerName ?? "-",
    IBAN: euro?.IBAN ?? "-",
    BIC: euro?.swift ?? "-",
    "Bank Name": euro?.bankName ?? "-",
  };
}
