import React from "react";

const Activities = () => {
  const activitiesData = [
    {
      date: "12-Sep-2023 | 08:23:22 ",
      desc: "BTC wallet address change approved by Name Surname",
    },
    {
      date: "12-Sep-2023 | 08:23:22 ",
      desc: "BTC Wallet Address Added by Name Surname as  0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK",
    },
    {
      date: "12-Sep-2023 | 08:23:22 ",
      desc: "BTC wallet address change approved by Name Surname",
    },
    {
      date: "12-Sep-2023 | 08:23:22 ",
      desc: "BTC Wallet Address Added by Name Surname as  0xn4aeDCbLXk413Jare6NpGw8cDj7SC5hhQK",
    },
  ];
  return (
    <div>
      {activitiesData.map((item, i) => (
        <div key={i} className="border-b py-4">
          <p className="text-[12px]">{item.date}</p>
          <p className="text-[14px] font-medium">{item.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default Activities;
