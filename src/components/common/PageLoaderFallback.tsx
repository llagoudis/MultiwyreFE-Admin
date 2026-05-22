import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

const Loading = () => (
  <div className="flex min-h-[80vh] w-full items-center justify-center">
    <CircularProgress size={50} color="inherit" />
  </div>
);

export default Loading;
