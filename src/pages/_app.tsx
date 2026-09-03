import { Fragment, useEffect } from "react";
import { type AppType } from "next/dist/shared/lib/utils";
import Layout from "~/components/layout";
import SidebarProvider from "~/context/SidebarProvider";

import "~/styles/globals.css";
import { useRouter } from "next/router";
import { useAuthStore } from "~/store";
import { getUserIp } from "~/utils/getUserIp";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import { roleRestrictions } from "~/utils/permissions";

const GUEST_ROUTES = new Set(["/auth/signup", "/auth/login"]);
const TWO_FA_ROUTES = new Set(["/auth/setup-2fa", "/auth/verify-2fa"]);

const MyApp: AppType = ({ Component, pageProps }) => {
  const { token, roleId } = useAuthStore((state) => state);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const path = router.pathname;
    const preAuthToken = sessionStorage.getItem("preAuthToken");
    const isPublicRoute = GUEST_ROUTES.has(path) || TWO_FA_ROUTES.has(path);

    if (token && GUEST_ROUTES.has(path)) {
      void router.replace("/");
      return;
    }

    if (!token && preAuthToken) {
      if (path === "/auth/login" || path === "/") {
        const setup = sessionStorage.getItem("requires2FASetup") === "true";
        void router.replace(setup ? "/auth/setup-2fa" : "/auth/verify-2fa");
        return;
      }
      if (!isPublicRoute) {
        void router.replace("/auth/login");
        return;
      }
    }

    if (!token && !preAuthToken && !isPublicRoute) {
      void router.replace("/auth/login");
      return;
    }

    void getUserIp();

    if (token) {
      const restrictedRoutes = roleRestrictions[roleId] ?? [];
      if (restrictedRoutes.some((route) => path.startsWith(route))) {
        toast.error("Permission Denied!", {
          duration: 3000,
          position: "top-center",
        });
        void router.back();
      }
    }
  }, [router.isReady, router.pathname, token, roleId]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      const restrictedRoutes = roleRestrictions[roleId] ?? [];
      if (restrictedRoutes.some((route) => url.startsWith(route)) && token) {
        toast.error("Permission Denied!", {
          duration: 3000,
          position: "top-center",
        });
        router.events.emit("routeChangeError");
        throw "Permission Denied";
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router, roleId, token]);

  return (
    <Fragment>
      <Toaster />
      <SidebarProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SidebarProvider>
    </Fragment>
  );
};

export default dynamic(() => Promise.resolve(MyApp), { ssr: false });
