import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  IconButton,
  Checkbox,
  Typography,
  FormHelperText,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import MuiButton from "../common/Button";
import { MdVisibility } from "react-icons/md";
import TwoFA from "../TwoFA";
import { ApiHandler } from "~/service/UtilService";
import { fetchAcquirerKey } from "~/service/ApiRequests";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  initialData?: any;
  paymentMethods?: any[];
  onClose: () => void;
  onSubmit: (body: any) => Promise<void>;
}

type AcquirerKeys = {
  apiKey: boolean;
  secretKey: boolean;
  publicKey: boolean;
  [key: string]: boolean;
};

type FormValues = {
  acquirer: string;
  paymentIds: string[];
  status: boolean;
  apiKey: string;
  secretKey: string;
  publicKey: string;
};

const AcquirerDialog = ({
  open,
  mode,
  initialData,
  paymentMethods = [],
  onClose,
  onSubmit,
}: Props) => {
  const isView = mode === "view";

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      acquirer: "",
      paymentIds: [],
      status: false,
      apiKey: "",
      secretKey: "",
      publicKey: "",
    },
  });

  const [popupState, setPopupState] = useState("");
  const [keyToUnlock, setKeyToUnlock] = useState("");
  const [unlockedKeys, setUnlockedKeys] = useState<AcquirerKeys>({
    apiKey: mode === "add",
    secretKey: mode === "add",
    publicKey: mode === "add",
  });

  const formValues = watch();

  useEffect(() => {
    if (initialData) {
      reset({
        acquirer: initialData.acquirer || "",
        paymentIds: initialData.paymentIds || [],
        status: initialData.status || false,
        apiKey: initialData.apiKey || "",
        secretKey: initialData.secretKey || "",
        publicKey: initialData.publicKey || "",
      });
    } else {
      reset({
        acquirer: "",
        paymentIds: [],
        status: false,
        apiKey: "",
        secretKey: "",
        publicKey: "",
      });
    }
  }, [initialData, mode, reset]);

  // Eye Button Click → ask 2FA
  function handleEyeClick(field: string) {
    if (mode === "add") return;
    setKeyToUnlock(field);
    setPopupState("2FA");
  }

  // 2FA Verified → fetch + unlock ONLY that key
  async function on2FASubmit() {
    const [res] = await ApiHandler<Acquirer>(fetchAcquirerKey, {
      id: initialData?.id,
      key: keyToUnlock,
    });

    if (res?.success && res?.body) {
      const value = (res.body as Record<string, any>)[keyToUnlock];

      setValue(keyToUnlock as keyof FormValues, value);

      setUnlockedKeys((prev) => ({
        ...prev,
        [keyToUnlock]: true,
      }));

      setPopupState("");
    }
  }

  const onFormSubmit = async (data: FormValues) => {
    await onSubmit(data);
  };

  const handleClose = () => {
    onClose();
    reset();
    setUnlockedKeys({
      apiKey: mode === "add",
      secretKey: mode === "add",
      publicKey: mode === "add",
    });
  };

  // Mask value if not unlocked
  const mask = (field: string, value: string) => {
    if (mode === "edit") return value;
    if (mode === "add") return value;
    return unlockedKeys[field] ? value : "********";
  };

  return (
    <>
      {popupState === "2FA" && (
        <TwoFA onClose={() => setPopupState("")} onSubmit={on2FASubmit} />
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {mode === "add" && "Add Acquirer"}
          {mode === "edit" && "Edit Acquirer"}
          {mode === "view" && "View Acquirer"}
        </DialogTitle>

        <DialogContent dividers>
          {/* ACQUIRER */}
          <Controller
            name="acquirer"
            control={control}
            rules={{ required: "Acquirer name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                variant="outlined"
                size="small"
                label="Acquirer Name"
                sx={{ mt: 2 }}
                disabled={isView}
                error={!!errors.acquirer}
                helperText={errors.acquirer?.message}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Checkbox
                    {...field}
                    checked={field.value}
                    disabled={isView}
                  />
                  <Typography>
                    Status ({field.value ? "Active" : "InActive"})
                  </Typography>
                </Box>
              </FormControl>
            )}
          />

          {/* PAYMENT METHODS */}
          <Controller
            name="paymentIds"
            control={control}
            rules={{
              required: "At least one payment method is required",
              validate: (value) =>
                value.length > 0 || "At least one payment method is required",
            }}
            render={({ field }) => (
              <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.paymentIds}>
                <InputLabel>Payment Methods</InputLabel>
                <Select
                  {...field}
                  label="Payment Methods"
                  variant="outlined"
                  multiple
                  size="small"
                  disabled={isView}
                  renderValue={(selected: any) => (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {Array.isArray(selected) &&
                        selected.map((id: any) => {
                          const pm = paymentMethods.find((p) => p.id === id);
                          return <Chip key={id} label={pm?.name} />;
                        })}
                    </Box>
                  )}
                >
                  {paymentMethods.map((pm: any) => (
                    <MenuItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.paymentIds && (
                  <FormHelperText>{errors.paymentIds.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          {/* API KEY */}
          <Controller
            name="apiKey"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={mask("apiKey", field.value)}
                onChange={(e) => {
                  if (
                    mode === "add" ||
                    mode === "edit" ||
                    unlockedKeys.apiKey
                  ) {
                    field.onChange(e);
                  }
                }}
                size="small"
                fullWidth
                label="API Key"
                sx={{ mt: 2 }}
                disabled={isView}
                InputProps={{
                  endAdornment:
                    mode !== "add" ? (
                      <IconButton onClick={() => handleEyeClick("apiKey")}>
                        <MdVisibility />
                      </IconButton>
                    ) : null,
                }}
              />
            )}
          />

          {/* SECRET KEY */}
          <Controller
            name="secretKey"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={mask("secretKey", field.value)}
                onChange={(e) => {
                  if (
                    mode === "add" ||
                    mode === "edit" ||
                    unlockedKeys.secretKey
                  ) {
                    field.onChange(e);
                  }
                }}
                size="small"
                fullWidth
                label="Secret Key"
                sx={{ mt: 2 }}
                disabled={isView}
                InputProps={{
                  endAdornment:
                    mode !== "add" ? (
                      <IconButton onClick={() => handleEyeClick("secretKey")}>
                        <MdVisibility />
                      </IconButton>
                    ) : null,
                }}
              />
            )}
          />

          {/* PUBLIC KEY */}
          <Controller
            name="publicKey"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={mask("publicKey", field.value)}
                onChange={(e) => {
                  if (
                    mode === "add" ||
                    mode === "edit" ||
                    unlockedKeys.publicKey
                  ) {
                    field.onChange(e);
                  }
                }}
                size="small"
                fullWidth
                label="Public Key"
                sx={{ mt: 2 }}
                disabled={isView}
                InputProps={{
                  endAdornment:
                    mode !== "add" ? (
                      <IconButton onClick={() => handleEyeClick("publicKey")}>
                        <MdVisibility />
                      </IconButton>
                    ) : null,
                }}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <MuiButton onClick={handleClose}>Cancel</MuiButton>
          {!isView && (
            <MuiButton
              className="btn-solid"
              onClick={rhfHandleSubmit(onFormSubmit)}
            >
              {mode === "add" ? "Create" : "Update"}
            </MuiButton>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AcquirerDialog;
