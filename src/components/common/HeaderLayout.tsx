import React, { type ChangeEvent } from "react";

type propType = {
  children?: React.ReactNode;
  name: string;
  enabled?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
};

const HeaderLayout = ({
  children,
  name,
  enabled,
  checked = false,
  onChange = () => null,
}: propType) => {
  return (
    <div className="w-full  border border-slate-200 ">
      <div className="flex justify-between bg-[#E2E8F080] px-3 py-4">
        <h2 className="subHeader">{name}</h2>

        {enabled && (
          <div className="">
            <label className="flex items-center gap-2">
              <input
                className="mt-[2px] scale-125 cursor-pointer accent-black"
                type="checkbox"
                onChange={onChange}
                checked={checked}
              />
              {enabled}
            </label>
          </div>
        )}
      </div>

      {children && <div className=" px-3 py-4">{children}</div>}
    </div>
  );
};

export default HeaderLayout;
