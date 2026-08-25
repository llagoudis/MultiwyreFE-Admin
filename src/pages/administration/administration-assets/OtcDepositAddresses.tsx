import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import toast from "react-hot-toast";
import MuiButton from "~/components/common/Button";
import {
  fetchAdminOtcDepositAddresses,
  saveAdminOtcDepositAddresses,
} from "~/service/api/administrator";

type OtcDepositRow = {
  id?: number | null;
  assetId: string;
  address: string;
  label: string;
};

const OtcDepositAddresses = () => {
  const [saved, setSaved] = useState<OtcDepositRow[]>([]);
  const [draft, setDraft] = useState<OtcDepositRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [res] = await fetchAdminOtcDepositAddresses();
    setLoading(false);
    if (!res?.success || !Array.isArray(res.body)) return;
    const rows = res.body.map((r) => ({
      id: r.id ?? null,
      assetId: r.assetId,
      address: r.address ?? "",
      label: r.label || r.assetId,
    }));
    setSaved(rows);
    setDraft(rows);
  };

  useEffect(() => {
    void load();
  }, []);

  const startEdit = () => {
    setDraft(saved.map((r) => ({ ...r })));
    setEditing(true);
  };
  const cancel = () => {
    setDraft(saved.map((r) => ({ ...r })));
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const [res] = await saveAdminOtcDepositAddresses({
      addresses: draft.map((r) => ({
        assetId: r.assetId,
        address: r.address.trim(),
        label: r.label,
      })),
    });
    setSaving(false);
    if (!res?.success) {
      toast.error("Failed to save OTC deposit addresses");
      return;
    }
    const rows = Array.isArray(res.body)
      ? res.body.map((r) => ({
          id: r.id ?? null,
          assetId: r.assetId,
          address: r.address ?? "",
          label: r.label || r.assetId,
        }))
      : draft;
    setSaved(rows);
    setDraft(rows);
    setEditing(false);
    toast.success(res.message || "OTC deposit addresses saved");
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="mt-4 max-w-[640px] rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 text-sm text-slate-600">
        Company crypto receive addresses for User OTC Order Request
        (Deposit address when From = BTC / ETH / USDC / USDT…). Leave blank to
        clear. Project/plugin deposit lists remain under E-Commerce → Wallets.
      </div>
      <div className="px-4 py-3.5">
        <div className="mb-1 mt-1 text-sm font-bold uppercase tracking-wide text-[#4775F2]">
          Per asset / network
        </div>
        {editing ? (
          <div className="flex flex-col gap-3">
            {draft.map((row, idx) => (
              <div key={row.assetId} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-[#1E293B]">
                  {row.label}
                </span>
                <TextField
                  label="Deposit address"
                  size="small"
                  value={row.address}
                  onChange={(e) =>
                    setDraft((list) =>
                      list.map((r, i) =>
                        i === idx ? { ...r, address: e.target.value } : r,
                      ),
                    )
                  }
                  className="w-full bg-white"
                  placeholder={`Enter ${row.label} receive address`}
                />
              </div>
            ))}
          </div>
        ) : (
          saved.map((row) => (
            <div
              key={row.assetId}
              className="flex justify-between gap-3 border-b border-slate-100 py-2"
            >
              <span className="text-sm text-slate-500">{row.label}</span>
              <span className="break-all text-right text-sm font-semibold text-[#1E293B]">
                {row.address || "—"}
              </span>
            </div>
          ))
        )}

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

export default OtcDepositAddresses;
