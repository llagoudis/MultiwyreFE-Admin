import Image, { type StaticImageData } from "next/image";
import Sheld from "~/assets/general/sheld.svg";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import MuiButton from "./common/Button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { verify2FAOTP } from "~/service/api/auth";

interface TwoFAProps {
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
}

const TwoFA: FC<TwoFAProps> = ({ onClose, onSubmit, loading }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      otp: "",
    },
  });
  const [load, setLoad] = useState(false);

  const verifyOTP = async ({ otp }: { otp: string }) => {
    setLoad(true);
    const [res, err] = await verify2FAOTP(otp);
    setLoad(false);

    if (err) {
      return toast.error(err || "Failed to validate OTP");
    }
    if (res?.success) {
      await onSubmit();
    }
  };

  console.log({ loading, load });

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div className="flex justify-between border-b-2 border-[#DFDDDD] pb-4">
          <p className="text-sm font-bold sm:text-base lg:text-lg">
            Authorise action with 2FA
          </p>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col items-center justify-between gap-4 border-b-2 border-[#DFDDDD] py-4 md:flex-row">
          <Image src={Sheld as StaticImageData} alt="Sheld" />
          <div>
            <p className="text-lg font-semibold">
              Enter your
              <span className="font-bold text-[#C1922E]"> 2FA code </span>
              to authorize this action.
            </p>
            <input
              {...register("otp", {
                required: "Please enter OTP",
                minLength: 6,
                maxLength: 6,
              })}
              className="mt-2 w-full rounded-md px-4 py-2 outline outline-1 outline-[#c4c4c4] placeholder:text-sm placeholder:font-normal"
              type="text"
              required
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <button className="cursor-pointer text-sm font-bold" onClick={onClose}>
          Cancel
        </button>

        <MuiButton
          loading={loading ? loading : load}
          className="btn-solid"
          title="Continue"
          onClick={handleSubmit(verifyOTP)}
        />
      </DialogActions>
    </Dialog>
  );
};

export default TwoFA;
