import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Router, { useRouter } from "next/router";
import React, { Fragment, useContext, useMemo, useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";
import arrowdown from "~/assets/general/arrow_down.svg";
import eCommerce from "~/assets/navicons/e-commerce.svg";
import exchange from "~/assets/navicons/exchange.svg";
import home from "~/assets/navicons/home.svg";
import profile from "~/assets/navicons/profile.svg";
import admin from "~/assets/sidebaricons/admin.svg";
import banking from "~/assets/sidebaricons/banking.svg";
import logout from "~/assets/sidebaricons/logout.svg";
import processingIcon from "~/assets/sidebaricons/processing.svg";
import adminprofile from "~/assets/sidebaricons/profile.svg";
import reports from "~/assets/sidebaricons/reports.svg";
import { SidebarContext } from "~/context/SidebarProvider";
import localStorageService from "~/service/LocalstorageService";
import { useAuthStore, useGlobalStore } from "~/store";

export type ImageType = StaticImageData;

interface subitemsType {
  name?: string;
  path: string;
  icon: ImageType;
  subitems?: subitemsType[]; // Assu
}

interface Route {
  id?: number;
  name?: string;
  path?: string;
  icon: ImageType;
  menu?: boolean;
  subitems?: subitemsType[];
}

// routes array
const routes: Route[] = [
  {
    id: 1,
    name: "banking",
    path: "/",
    icon: banking as ImageType,
    menu: true,
    subitems: [
      {
        name: "individuals",
        path: "/banking/individuals",
        icon: home as ImageType,
      },
      {
        name: "companies",
        path: "/banking/companies",
        icon: home as ImageType,
      },
      {
        name: "company Staff",
        path: "/banking/company-staff",
        icon: home as ImageType,
      },
      {
        name: "accounts",
        path: "/banking/accounts",
        icon: home as ImageType,
      },
      {
        name: "Identification requests",
        path: "/banking/identificationRequest",
        icon: home as ImageType,
      },
      {
        name: "price lists",
        path: "/banking/price-list",
        icon: home as ImageType,
      },
      { name: "limits", path: "/banking/limits", icon: home as ImageType },
      {
        name: "transactions",
        path: "/banking/transactions",
        icon: home as ImageType,
      },

      {
        name: "sweep Transactions",
        path: "/banking/sweepTransactions",
        icon: home as ImageType,
      },

      {
        name: "Commission Transactions",
        path: "/banking/commissionTransactions",
        icon: home as ImageType,
      },
    ],
  },
  {
    id: 2,
    name: "exchange",
    icon: exchange as ImageType,
    menu: true,
    subitems: [
      { name: "orders", path: "/exchange/orders", icon: home as ImageType },
      {
        name: "limits",
        path: "/exchange/limits",
        icon: home as ImageType,
      },
    ],
  },
  // {
  //   id: 2,
  //   path: "/reports/allTransactions",
  //   name: "reports",
  //   icon: reports as ImageType,
  // },
  {
    id: 3,
    name: "e-commerce",
    icon: eCommerce as ImageType,
    menu: true,
    subitems: [
      {
        name: "Ecom-Transactions",
        path: "/e-commerce/ecom-Transactions",
        icon: home as ImageType,
      },

      {
        name: "Transactions",
        path: "/e-commerce/transactions",
        icon: home as ImageType,
      },

      {
        name: "Sweep Transactions",
        path: "/e-commerce/sweepTransactions",
        icon: home as ImageType,
      },

      {
        name: "Auto Conversions",
        path: "/e-commerce/autoConversions",
        icon: home as ImageType,
      },

      {
        name: "wallets",
        path: "/e-commerce/wallets/customerWallets",
        icon: home as ImageType,
        subitems: [
          {
            name: "E-commerce",
            path: "/e-commerce/wallets/customerWallets",
            icon: reports as ImageType,
          },
          {
            name: "banking",
            path: "/e-commerce/wallets/merchantWallets",
            icon: reports as ImageType,
          },
        ],
      },

      {
        name: "Merchants",
        path: "/e-commerce/merchants",
        icon: home as ImageType,
      },

      // {
      //   name: "Project Balances",
      //   path: "/e-commerce/ProjectBalances",
      //   icon: home as ImageType,
      // },

      // {
      //   name: "legal document",
      //   path: "/administration/legalDocument",
      //   icon: home as ImageType,
      // },

      // {
      //   name: "Bulk Transactions",
      //   path: "/e-commerce/bulkTransactions",
      //   icon: home as ImageType,
      // },

      // {
      //   name: "wallet",
      //   path: "/administration/wallet",
      //   icon: home as ImageType,
      // },
      // {
      //   name: "Notification templates",
      //   path: "/administration/notificationTemplate",
      //   icon: home as ImageType,
      // },
    ],
  },
  {
    id: 4,
    name: "Processing",
    icon: processingIcon as ImageType,
    menu: true,
    subitems: [
      {
        name: "Merchants",
        path: "/processing/merchants",
        icon: home as ImageType,
      },
      {
        name: "Transactions",
        path: "/processing/transactions",
        icon: home as ImageType,
      },

      {
        name: "Acquirers",
        path: "/processing/acquirers",
        icon: home as ImageType,
      },
      // {
      //   name: "Project balances",
      //   path: "/processing/projectBalances",
      //   icon: home as ImageType,
      // },
    ],
  },

  {
    id: 5,
    name: "reports",
    icon: reports as ImageType,
    menu: true,
    subitems: [
      {
        name: "E-commerce",
        path: "/reports/ecomFees",
        icon: reports as ImageType,
      },
      {
        name: "banking",
        path: "/reports/allTransactions",
        icon: reports as ImageType,
      },
      {
        name: "Processing",
        path: "/reports/processingTurnover",
        icon: reports as ImageType,
      },
    ],
  },
  {
    id: 6,
    name: "administration",
    icon: admin as ImageType,
    menu: true,
    subitems: [
      {
        name: "activity log",
        path: "/administration/activityLog",
        icon: home as ImageType,
      },
      {
        name: "client activity log",
        path: "/administration/clientActivityLog",
        icon: home as ImageType,
      },
      {
        name: "administrators",
        path: "/administration/administrators",
        icon: home as ImageType,
      },
      // {
      //   name: "legal document",
      //   path: "/administration/legalDocument",
      //   icon: home as ImageType,
      // },
      {
        name: "security",
        path: "/administration/security",
        icon: home as ImageType,
      },
      {
        name: "asset management",
        path: "/administration/assetManagement",
        icon: home as ImageType,
      },

      {
        name: "manual Transaction",
        path: "/administration/manualTransaction",
        icon: home as ImageType,
      },

      // {
      //   name: "wallet",
      //   path: "/administration/wallet",
      //   icon: home as ImageType,
      // },
      // {
      //   name: "Notification templates",
      //   path: "/administration/notificationTemplate",
      //   icon: home as ImageType,
      // },
    ],
  },

  // { id: 4, path: "/API", name: "API", icon: api as ImageType },
  { id: 7, path: "/profile", name: "profile", icon: profile as ImageType },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathName = usePathname() || router.asPath;
  const parts = pathName.split("/");
  const firstTwoPaths = parts.slice(0, 3).join("/");
  const sidebarprop = useContext(SidebarContext);
  const admin = useGlobalStore((state) => state.admin);

  const { firstname, lastname, email } = useAuthStore((state) => state);

  const [heading, setHeading] = useState<string | undefined>("");

  const SidebarItem = ({ name, path, icon, menu, subitems }: Route) => (
    <Link
      href={path ? path : pathName}
      className={` sidebar-item ${
        heading === name && "rounded-xl bg-white/10"
      } flex cursor-pointer justify-between p-1 px-2`}
      onClick={(e) => {
        if (subitems?.length) {
          e.preventDefault();
        }

        if (heading === name) {
          setHeading("");
        } else {
          setHeading(name);
        }
      }}
    >
      <div className={`group flex items-center gap-3 `}>
        <Image
          alt=""
          src={icon}
          className={`sidebar-icon ${
            heading === name && "brightness-200"
          } h-5 w-5 group-hover:brightness-200`}
        />
        <h1
          className={` text-[#8B8D91] group-hover:text-white  ${
            heading === name && "text-white"
          } `}
        >
          {name === "apipage" ? "Api" : name}
        </h1>
      </div>

      {menu && (
        <Image
          src={arrowdown as ImageType}
          className={`${
            heading === name && "rotate-180"
          }  transition-all duration-300`}
          alt=""
        />
      )}
    </Link>
  );

  const SidebarNestedItem = ({ name, path }: subitemsType) => (
    <Link href={path} className="group flex items-center gap-3 sidebar-nested-item">
      <h1
        className={`p-1 text-sm font-medium text-[#8B8D91] group-hover:text-white  ${
          firstTwoPaths === path &&
          "rounded-md bg-white/10  font-semibold text-white"
        }`}
      >
        {name}
      </h1>
    </Link>
  );

  // async function fetchAdmin() {
  //   const [res, error]: APIResult<AdminProfile[]> =
  //     await ApiHandler(fetchAdminProfile);

  //   if (res?.body) {
  //     const response = {
  //       file: res?.body[0]?.profileImgLink,
  //       companyLegalName: res?.body[0]?.companyLegalName,
  //       email: res?.body[0]?.email,
  //     };

  //     setAdminImage(res?.body[0]?.profileImgLink);
  //   }

  useMemo(() => {
    if (router.pathname === "/") {
      setHeading("");
    }
  }, [router]);

  return (
    <Fragment>
      <nav
        className={`${
          !sidebarprop?.open ? " w-60" : "w-full md:w-0"
        } hidden h-screen  border-r bg-black text-white duration-500 md:block sidebar-container`}
      >
        <div className="flex min-h-screen flex-col justify-between">
          <div className="flex flex-col gap-5 pt-3 bg-[#4775F2]">
            {admin?.profileImgLink && (
              <div className="logo relative flex h-16 items-center justify-center">
                <Image
                  alt={"Profile"}
                  className="h-auto w-[100px] object-cover"
                  src={
                    admin?.profileImgLink
                      ? `${admin?.profileImgLink}?t=${new Date().getTime()}`
                      : ""
                  }
                  width={"150"}
                  height={"150"}
                />
              </div>
            )}

            <div
              className={`flex flex-col justify-center gap-3 px-3 capitalize ${
                sidebarprop?.open && "opacity-0"
              }`}
            >
              {routes.map((item, i) => (
                <div key={i}>
                  <SidebarItem {...item} />

                  <ul
                    className={`${
                      heading === item.name ? "block pl-5" : "hidden"
                    }  ${
                      item.subitems && heading === item.name && "mt-6"
                    }    ml-3 border-[#2D2F39] `}
                  >
                    {item.subitems?.map((subitem, j) => (
                      <li
                        key={j}
                        className="relative py-[1px]  before:absolute before:-left-5 before:-top-6 before:h-[50px] before:w-4 before:rounded-bl-xl before:border-b-2  before:border-l-2 before:border-[#2D2F39]  before:content-['']"
                      >
                        <SidebarNestedItem {...subitem} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className={`${sidebarprop?.open && "hidden"}  pb-2`}>
            <div
              className="group flex cursor-pointer items-center  gap-5 px-3"
              onClick={() => {
                localStorageService.clearStorage();
                void Router.replace("/auth/login");
              }}
            >
              <Image
                src={logout as StaticImageData}
                alt=""
                className="group-hover:brightness-200"
              />
              <h1
                className={`p-1 text-[#8B8D91] group-hover:text-white  
          `}
              >
                Logout
              </h1>
            </div>
            <div className="flex items-center gap-2 px-3">
              <Image
                src={adminprofile as StaticImageData}
                alt=""
                className="h-8 w-auto"
              />

              <div className="break-words text-xs  text-[#8B8D91]">
                <p suppressHydrationWarning>
                  {firstname ? firstname : " "} {lastname ? lastname : " "}
                </p>
                <p suppressHydrationWarning>{email ? email : " "} </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <nav
        className={`fixed h-full  w-1/2 bg-black lg:w-[35vw] ${
          sidebarprop?.open ? "left-0" : "-left-full"
        } top-0 z-50 block p-1 duration-500 md:hidden mobile-sidebar`}
      >
        <div className="logo relative flex h-[15vh] justify-end p-5 text-white">
          <RiCloseCircleLine
            onClick={sidebarprop?.handleSidebar}
            className="h-5 w-5 cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-5">
          {sidebarprop?.open && admin && (
            <div className="logo relative flex h-[10vh] items-center justify-center text-white">
              <Image
                alt={"Profile"}
                className="h-auto w-[100px] object-cover"
                src={
                  admin?.profileImgLink
                    ? `${admin?.profileImgLink}?t=${new Date().getTime()}`
                    : ""
                }
                width={"150"}
                height={"150"}
              />
            </div>
          )}

          <div
            className={`flex flex-col justify-center gap-3 px-3 capitalize ${
              !sidebarprop?.open && "opacity-0"
            }`}
          >
            {routes.map((item, i) => (
              <div key={i}>
                <SidebarItem {...item} />

                <ul
                  className={`${
                    heading === item.name ? "block pl-5" : "hidden"
                  }  ${
                    item.subitems && heading === item.name && "mt-6"
                  }    ml-3 border-[#2D2F39] `}
                >
                  {item.subitems?.map((subitem, j) => (
                    <li
                      key={j}
                      className="relative py-[1px]  before:absolute before:-left-5 before:-top-6 before:h-[50px] before:w-4 before:rounded-bl-xl before:border-b-2  before:border-l-2 before:border-[#2D2F39]  before:content-['']"
                    >
                      <SidebarNestedItem {...subitem} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 mt-5 flex flex-col justify-center gap-7 pl-6 capitalize">
          <div className={`${!sidebarprop?.open && "hidden"}  pb-2`}>
            <div
              className="group flex cursor-pointer items-center  gap-5 px-3"
              onClick={() => {
                localStorageService.clearStorage();
                void Router.replace("/auth/login");
              }}
            >
              <Image
                src={logout as StaticImageData}
                alt=""
                className="group-hover:brightness-200"
              />
              <h1
                className={`p-1 text-[#8B8D91] group-hover:text-white  
          `}
              >
                Logout
              </h1>
            </div>
            <div className="flex items-center gap-3 px-3">
              <Image
                src={adminprofile as StaticImageData}
                alt=""
                className="h-8 w-auto"
              />

              <div className="break-words text-xs  text-[#8B8D91]">
                <p suppressHydrationWarning>
                  {firstname ? firstname : " "} {lastname ? lastname : " "}
                </p>
                <p suppressHydrationWarning>{email ? email : " "} </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </Fragment>
  );
};

export default Sidebar;
