import React, { Fragment, useState, type FC } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

interface ButtonProps {
  title?: string;
  className?: string; // Change to string type
  onClick?: () => Promise<void> | void;
  disabled?: boolean;
  type?: "button" | "submit";
  loading?: boolean;
  icon?: React.ReactNode; // Change to React.ReactNode
  children?: React.ReactNode;
  link?: string;
  useLoading?: boolean;
}

const MuiButton: FC<ButtonProps> = ({
  title,
  onClick,
  disabled = false,
  type = "button",
  loading = false,
  icon = null,
  children,
  className,
  useLoading = false,
}) => {
  const [isLoading, setLoading] = useState(false);

  const _onClick = async () => {
    if (onClick) {
      setLoading(true);
      await onClick();
      setLoading(false);
    }
  };
  return (
    <button
      disabled={disabled || loading}
      onClick={useLoading ? _onClick : onClick}
      type={type}
      className={className}
    >
      <div className="flex flex-row items-center justify-center px-2">
        {loading || isLoading ? (
          <Stack
            sx={{ color: "white", minWidth: "4rem", alignItems: "center" }}
            spacing={4}
          >
            <CircularProgress size="1.5rem" color="inherit" />
          </Stack>
        ) : (
          <Fragment>
            {children} &nbsp;
            {icon && <span className="mr-2">{icon}</span>}
            <span className="flex text-sm">{title}</span>
          </Fragment>
        )}
      </div>
    </button>
  );
};

export default MuiButton;
