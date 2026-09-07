import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import React, { Fragment, useContext, useEffect, useState } from "react";
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
import { useAuthStore, useGlobalStore } from "~/store";
import { logoutAdmin } from "~/utils/logout";

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

const formatNavLabel = (name?: string) => {
  if (name === "banking") return "Management";
  if (name === "apipage") return "Api";
  return name ?? "";
};

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
        name: "Whitelist addresses",
        path: "/banking/whitelist",
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
  const sidebarprop = useContext(SidebarContext);
  const admin = useGlobalStore((state) => state.admin);

  const { firstname, lastname, email } = useAuthStore((state) => state);

  const [heading, setHeading] = useState<string | undefined>("");

  const isRouteActive = (path?: string) => {
    if (!path) return false;
    if (path === "/") {
      return pathName === "/" || pathName.startsWith("/banking");
    }
    return pathName === path || pathName.startsWith(`${path}/`);
  };

  const isSectionRouteActive = (
    path: string | undefined,
    subitems?: subitemsType[],
  ) => {
    if (path && path !== "/" && isRouteActive(path)) return true;
    return Boolean(subitems?.some((sub) => isRouteActive(sub.path)));
  };

  const SidebarItem = ({ name, path, icon, menu, subitems }: Route) => {
    const isOpen = heading === name;
    // Only mark active from the current route — not merely because the section is expanded
    const highlighted = isSectionRouteActive(path, subitems);

    return (
      <Link
        href={path ? path : pathName}
        className={`sidebar-item${highlighted ? " active" : ""}${isOpen ? " is-open" : ""} flex min-h-[40px] shrink-0 cursor-pointer items-center justify-between p-1 px-2`}
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
        <div className="group flex items-center gap-3">
          <Image alt="" src={icon} className="sidebar-icon h-5 w-5" />
          <h1 className="sidebar-item-label capitalize">{formatNavLabel(name)}</h1>
        </div>

        {menu && (
          <Image
            src={arrowdown as ImageType}
            className={`sidebar-chevron${isOpen ? " is-open" : ""}`}
            alt=""
          />
        )}
      </Link>
    );
  };

  const SidebarNestedItem = ({ name, path }: subitemsType) => {
    const active = isRouteActive(path);

    return (
      <Link
        href={path}
        className={`group flex items-center gap-3 sidebar-nested-item${active ? " active" : ""}`}
      >
        <h1 className="sidebar-nested-label p-1 text-sm font-medium capitalize">{formatNavLabel(name)}</h1>
      </Link>
    );
  };

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

  useEffect(() => {
    const activeSection = routes.find((item) =>
      item.subitems?.some((sub) => {
        if (sub.path === "/") return pathName === "/";
        return pathName === sub.path || pathName.startsWith(`${sub.path}/`);
      }),
    );
    setHeading(activeSection?.name ?? "");
  }, [pathName]);

  const renderNavRoutes = () =>
    routes.map((item, i) => (
      <div key={i} className="shrink-0">
        <SidebarItem {...item} />

        <ul
          className={`${
            heading === item.name ? "mt-1 block pl-5" : "hidden"
          } ml-3 border-[#2D2F39]`}
        >
          {item.subitems?.map((subitem, j) => (
            <li
              key={j}
              className="relative py-0.5 before:absolute before:-left-5 before:top-0 before:h-full before:w-4 before:rounded-bl-xl before:border-b-2 before:border-l-2 before:border-[#2D2F39] before:content-['']"
            >
              <SidebarNestedItem {...subitem} />
            </li>
          ))}
        </ul>
      </div>
    ));

  const renderFooter = (hidden?: boolean) => (
    <div className={`${hidden ? "hidden" : ""} shrink-0 border-t border-black/5 bg-white pb-2 pt-2`}>
      <div
        className="group flex cursor-pointer items-center gap-5 px-3"
        onClick={() => {
          logoutAdmin();
        }}
      >
        <Image
          src={logout as StaticImageData}
          alt=""
          className="group-hover:brightness-200"
        />
        <h1 className="p-1 text-[#8B8D91]">Logout</h1>
      </div>
      <div className="flex items-center gap-2 px-3">
        <Image
          src={adminprofile as StaticImageData}
          alt=""
          className="h-8 w-auto"
        />

        <div className="break-words text-xs text-[#8B8D91]">
          <p suppressHydrationWarning>
            {firstname ? firstname : " "} {lastname ? lastname : " "}
          </p>
          <p suppressHydrationWarning>{email ? email : " "}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Fragment>
      <nav
        className={`${
          !sidebarprop?.open ? " w-60" : "w-full md:w-0"
        } hidden h-screen overflow-hidden border-r bg-black duration-500 md:block sidebar-container`}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="h-16 w-full shrink-0 bg-[#4775F2]">
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
          </div>

          <div
            className={`min-h-0 flex-1 overflow-y-auto px-3 py-4 capitalize ${
              sidebarprop?.open && "opacity-0"
            }`}
          >
            <div className="flex flex-col gap-2">{renderNavRoutes()}</div>
          </div>

          {renderFooter(sidebarprop?.open)}
        </div>
      </nav>
      <nav
        className={`fixed inset-y-0 z-50 flex h-full w-1/2 flex-col overflow-hidden bg-black p-1 duration-500 lg:w-[35vw] md:hidden mobile-sidebar ${
          sidebarprop?.open ? "left-0" : "-left-full"
        }`}
      >
        <div className="logo relative flex shrink-0 justify-end p-5">
          <RiCloseCircleLine
            onClick={sidebarprop?.handleSidebar}
            className="h-5 w-5 cursor-pointer"
          />
        </div>
        {sidebarprop?.open && admin && (
          <div className="logo relative flex h-16 shrink-0 items-center justify-center">
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
          className={`min-h-0 flex-1 overflow-y-auto px-3 capitalize ${
            !sidebarprop?.open && "opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2 py-2">{renderNavRoutes()}</div>
        </div>

        {renderFooter(!sidebarprop?.open)}
      </nav>
    </Fragment>
  );
};

export default Sidebar;
