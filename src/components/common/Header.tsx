import React from "react";

type propType = {
  head: string;
};

const Header = ({ head }: propType) => {
  return <h1 className="pageHeader text-2xl font-bold ">{head}</h1>;
};

export default Header;
