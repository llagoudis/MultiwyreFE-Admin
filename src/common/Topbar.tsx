"use client";
import React, { useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import menu from "~/assets/headericons/menu.svg";
import HOMEICON from "~/assets/general/breadcrumHome.svg";
import chevronright from "~/assets/general/Chevron_Right.svg";
import { SidebarContext } from "~/context/SidebarProvider";
import Link from "next/link";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
import { useCompanyStore, useGlobalStore } from "~/store";

const Topbar: React.FC = () => {
  const companyName = useCompanyStore((state) => state.company.companyName);
  const UserStoreFirstName = useGlobalStore((state) => state.persons.firstname);
  const UserStoreLastName = useGlobalStore((state) => state.persons.lastname);
  const userStoreFullName = UserStoreFirstName + " " + UserStoreLastName;
  const sidebarprop = useContext(SidebarContext);
  const [pathSegement, setPathSegment] = useState<string[]>([]);

  const router = useRouter();
  const pathName = usePathname() || router.asPath;

  function camelToSpace(text: string) {
    const words = text.split(/(?=[A-Z])/);
    const result = words.join(" ").toLocaleLowerCase();
    return result;
  }

  useEffect(() => {
    const refineBreadcrumb = (pathSegments: string[]): string[] => {
      const bankingKeywords = [
        "allTransactions",
        "currencyTurnover",
        "fees",
        "chargedFees",
        "balances",
        "totalBalances",
      ];
      const eComKeywords = ["ecomFees", "ecomChargedFees", "merchantTurnover"];
      if (pathName.includes("companies") && pathName.includes("view")) {
        if (typeof companyName === "string") {
          pathSegments[pathSegments.length - 1] = companyName;
        }
      } else if (
        pathName.includes("individuals") &&
        pathName.includes("view")
      ) {
        pathSegments[pathSegments.length - 1] = userStoreFullName;
      } else if (eComKeywords.some((keyword) => pathName.includes(keyword))) {
        if (pathName.includes("ecomFees")) {
          pathSegments.splice(1, 0, "Total Fees");
          console.log("pathSegments", pathSegments);
          const indexToRemove = pathSegments.indexOf("ecomFees");
          if (indexToRemove !== -1) {
            pathSegments.splice(indexToRemove, 1);
          }
        }
        if (pathName.includes("ecomChargedFees")) {
          pathSegments.splice(1, 0, "E-Commerce", "Charged Fees");
          const indexToRemove = pathSegments.indexOf("ecomChargedFees");
          if (indexToRemove !== -1) {
            pathSegments.splice(indexToRemove, 1);
          }
        } else {
          pathSegments.splice(1, 0, "E-Commerce");
        }
      } else if (
        bankingKeywords.some((keyword) => pathName.includes(keyword))
      ) {
        pathSegments.splice(1, 0, "Banking");
      }
      return pathSegments;
    };

    const pathSegments = pathName
      .split("/")
      .filter((segment) => segment !== "");

    setPathSegment(refineBreadcrumb(pathSegments));
  }, [pathName, companyName, userStoreFullName]);

  const makePath = (array: string[], index: number) => {
    return "/" + array.slice(0, index).join("/");
  };

  const splitCamelCase = (str: string) => {
    return str.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  return (
    <div
      style={{
        boxShadow: "1.1802083253860474px 0px 5.901041507720947px 0px #0000000D",
      }}
      className="bg-primary-gradient"
    >
      <div
        className={`m-auto flex h-16 w-[95%] items-center justify-between text-white`}
      >
        <div className="flex items-center gap-8">
          <Image
            src={menu as StaticImageData}
            alt=""
            className="cursor-pointer"
            onClick={sidebarprop?.handleSidebar}
          />
          <h1 className="flex items-center gap-3 px-1 text-sm font-semibold md:text-sm">
            <Link href="/">
              <Image src={HOMEICON as StaticImageData} alt="" />
            </Link>

            {pathSegement.map((segment, index) => (
              <Box
                key={index}
                className="flex items-center gap-3 px-1 text-sm font-semibold md:text-sm"
              >
                <Image
                  src={chevronright as StaticImageData}
                  className="text-black"
                  alt=""
                />
                <Box className="capitalize">
                  {index === 0 ||
                  segment.toLowerCase() === "view" ||
                  segment === "E-Commerce" ||
                  segment === "Banking" ||
                  "merchantTurnover" ||
                  "allTransactions" ? (
                    <span>{splitCamelCase(segment)}</span>
                  ) : (
                    <>
                      <Link
                        href={makePath(pathSegement, index + 1)}
                        className="underline underline-offset-2 hover:bg-slate-200"
                      >
                        {camelToSpace(segment)}
                      </Link>
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
