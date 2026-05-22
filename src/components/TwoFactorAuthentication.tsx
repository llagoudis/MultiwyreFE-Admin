import React from "react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import twofa from "~/assets/images/TwoFA.png";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  Box,
  IconButton,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MuiButton from "./common/Button";

interface FormData {
  twoFactorCode: string;
}

interface TwoFactorAuthenticationProps {
  close: () => void;
  submitData: (data: FormData) => void;
  loading?: boolean;
  twofaQR: string;
}

const TwoFactorAuthentication: React.FC<TwoFactorAuthenticationProps> = ({
  close,
  submitData,
  loading,
  twofaQR,
}) => {
  const { handleSubmit, control } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    submitData(data);
  };

  return (
    <Dialog open onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Authorize action with 2FA</Typography>
        <IconButton
          aria-label="close"
          onClick={close}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              width={160}
              height={100}
              alt="Two-factor Authentication"
              src={twofa}
            />
            <Box
              ml={6}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              {twofaQR ? (
                <Image
                  height={150}
                  width={150}
                  alt="Two-factor Authentication QR Code"
                  src={twofaQR}
                />
              ) : (
                "Loading..."
              )}
              <Box mt={2}>
                <Controller
                  name="twoFactorCode"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Two-Factor code is required" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      size="small"
                      placeholder={
                        "Enter your  2FA code to authorize this action"
                      }
                      variant="outlined"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error ? fieldState.error.message : null
                      }
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={close} title="Cancel" />
          <MuiButton
            className="btn-solid"
            title="Continue"
            loading={loading}
            onClick={handleSubmit(onSubmit)}
          />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TwoFactorAuthentication;
