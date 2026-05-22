/* eslint-disable @typescript-eslint/no-empty-function */
"use client";
import React, { createContext, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type SidebarContextType = {
  open: boolean;
  handleSidebar?: () => void;
  setOpen?: (value: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextType>({
  open: false, // Provide an initial value for 'open'
  handleSidebar: () => {},
});

const SidebarProvider = ({ children }: Props) => {
  const [open, setOpen] = useState(false);

  const handleSidebar = () => {
    setOpen(!open);
  };

  return (
    <SidebarContext.Provider value={{ handleSidebar, open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;
