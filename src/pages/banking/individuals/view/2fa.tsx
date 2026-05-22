import React from "react";

const TwoFA = () => {
  return (
    <>
      <div className="flex items-center justify-between bg-[#E2E8F080] px-4 py-4">
        <h2 className="font-medium capitalize text-black">
          Two factor authentIcation
        </h2>
        <div className="flex gap-8">
          <div className="flex items-center gap-3">
            <label htmlFor="enable" className="flex items-center gap-2">
              <input
                type="radio"
                id="enable"
                name="twoFA"
                className=" scale-150 accent-black"
                defaultChecked
              />
              <p className=" font-bold">Enable</p>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="Disable" className="flex items-center gap-2">
              <input
                type="radio"
                id="Disable"
                name="twoFA"
                className=" scale-150 accent-black"
              />
              <p className=" font-bold">Disable</p>
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default TwoFA;
