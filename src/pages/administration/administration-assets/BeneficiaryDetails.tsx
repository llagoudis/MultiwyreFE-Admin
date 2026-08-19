import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import toast from "react-hot-toast";
import MuiButton from "~/components/common/Button";
import {
  fetchAdminBeneficiary,
  saveAdminBeneficiary,
} from "~/service/api/administrator";

type BeneficiaryForm = AdminBeneficiaryDetails;

const EMPTY: BeneficiaryForm = {
  iban: "",
  customerName: "",
  customerAddress: "",
  customerZip: "",
  destinationAddress: "",
  customerSwift: "",
  bankName: "",
  bankAddress: "",
  bankLocation: "",
  bankCountry: "",
  bankReference: "",
};

const toForm = (data?: Partial<BeneficiaryForm> | null): BeneficiaryForm => ({
  ...EMPTY,
  ...Object.fromEntries(
    (Object.keys(EMPTY) as (keyof BeneficiaryForm)[]).map((key) => [
      key,
      data?.[key] ?? "",
    ]),
  ),
});

const SECTIONS: [string, [keyof BeneficiaryForm, string][]][] = [
  ["Customer Information", [
    ["iban", "IBAN"],
    ["customerName", "Customer name"],
    ["customerAddress", "Customer address"],
    ["customerZip", "Customer ZIP code"],
    ["destinationAddress", "Destination address"],
  ]],
  ["Banking information", [
    ["customerSwift", "Customer swift"],
    ["bankName", "Bank name"],
    ["bankAddress", "Bank address"],
    ["bankLocation", "Bank location"],
    ["bankCountry", "Bank country"],
    ["bankReference", "Bank reference"],
  ]],
];

const BeneficiaryDetails = () => {
  const [saved, setSaved] = useState<BeneficiaryForm>(EMPTY);
  const [draft, setDraft] = useState<BeneficiaryForm>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [res] = await fetchAdminBeneficiary();
      if (!res?.success) return;
      const form = toForm(res.body);
      setSaved(form);
      setDraft(form);
    };
    load();
  }, []);

  const startEdit = () => {
    setDraft(saved);
    setEditing(true);
  };
  const cancel = () => {
    setDraft(saved);
    setEditing(false);
  };
  const handleSave = async () => {
    setSaving(true);
    const [res] = await saveAdminBeneficiary(draft);
    setSaving(false);
    if (!res?.success) return;
    const form = toForm(res.body);
    setSaved(form);
    setDraft(form);
    setEditing(false);
    toast.success(res.message || "Beneficiary details saved");
  };

  return (
    <div className="mt-4 max-w-[460px] rounded border border-slate-200 bg-white">
      <div className="px-4 py-3.5">
        {SECTIONS.map(([section, rows]) => (
          <div key={section}>
            <div className="mb-1 mt-3 text-sm font-bold uppercase tracking-wide text-[#4775F2]">
              {section}
            </div>
            {editing ? (
              <div className="flex flex-col gap-2">
                {rows.map(([key, label]) => (
                  <TextField
                    key={key}
                    label={label}
                    size="small"
                    value={draft[key]}
                    onChange={(e) => setDraft((s) => ({ ...s, [key]: e.target.value }))}
                    className="w-full bg-white"
                  />
                ))}
              </div>
            ) : (
              rows.map(([key, label]) => (
                <div
                  key={key}
                  className="flex justify-between gap-3 border-b border-slate-100 py-1.5"
                >
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-right text-sm font-semibold text-[#1E293B]">
                    {saved[key] || "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-3.5">
          {editing ? (
            <>
              <MuiButton title="Cancel" className="btn-outlined" onClick={cancel} />
              <MuiButton
                title="Save"
                className="btn-solid"
                onClick={handleSave}
                loading={saving}
              />
            </>
          ) : (
            <MuiButton title="Edit" className="btn-outlined" onClick={startEdit} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDetails;
