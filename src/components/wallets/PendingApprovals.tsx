import React from "react";
import MuiButton from "../common/Button";
import { Dialog } from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import Sheld from "~/assets/general/sheld.svg";

const PendingApprovals = () => {
  const activitiesData = [
    {
      date: "12-Sep-2023 | 08:23:22 ",
      desc: "Name Surname has requested wallet change from   “0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK” to  “0xn4ae3Jare6NpGw413Jare6NpGfgmC5hhQK”",
    },
    {
      date: "12-Sep-2023 | 08:23:22 ",
      desc: "Name Surname has requested wallet change from   “0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK” to  “0xn4ae3Jare6NpGw413Jare6NpGfgmC5hhQK”",
    },
  ];

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(!open);
  };
  return (
    <div>
      {activitiesData.map((item, i) => (
        <div key={i} className="border-b py-4">
          {/* <p className="text-[12px]">{item.date}</p> */}
          <p className="text-[14px] font-medium">{item.desc}</p>

          <div className="mt-2 flex gap-3">
            <MuiButton
              className="btn-solid bg-[#C3922E] text-white"
              title="Approve"
              onClick={handleClose}
            />
            <MuiButton className="btn-solid" title="Reject" />
          </div>
        </div>
      ))}

      <Dialog open={open} onClose={handleClose}>
        <div className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex  justify-between border-b-2 border-[#DFDDDD] pb-4 ">
            <p className=" text-sm font-bold sm:text-base lg:text-lg">
              Authorise action with 2FA
            </p>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-b-2 border-[#DFDDDD] py-4 md:flex-row">
            <Image src={Sheld as StaticImageData} alt="Sheld" />
            <div>
              <p className=" text-lg font-semibold">
                Enter your
                <span className=" font-bold text-[#C1922E]">2FA code</span>{" "}
                authorize this action.
              </p>
              <input
                className="mt-2 w-full rounded-md px-4 py-2 outline outline-1 outline-[#c4c4c4] placeholder:text-sm placeholder:font-normal "
                type="text"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-6 ">
            <button
              className=" cursor-pointer text-sm font-bold"
              onClick={handleClose}
            >
              Cancel
            </button>
            <MuiButton className=" btn-solid bg-[#217EFD]" title={"Continue"} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PendingApprovals;
