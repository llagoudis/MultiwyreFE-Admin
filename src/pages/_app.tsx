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

const MyApp: AppType = ({ Component, pageProps }) => {
  const { token, roleId } = useAuthStore((state) => state);
  const router = useRouter();
  const currentPath = window.location.pathname;
  useEffect(() => {
    const unprotectedRoutes = ["/", "/auth/signup", "/auth/login"];

    if (
      token &&
      unprotectedRoutes.some((item) => window.location.pathname === item)
    ) {
      void router.push("/");
    } else {
      !token && void router.push("/auth/login");
    }

    void getUserIp();

    if (token) {
      const restrictedRoutes = roleRestrictions[roleId] ?? [];
      if (restrictedRoutes.some((route) => currentPath.startsWith(route))) {
        toast.error("Permission Denied!", {
          duration: 3000,
          position: "top-center",
        });
        void router.back();
        return;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      const restrictedRoutes = roleRestrictions[roleId] ?? [];
      if (restrictedRoutes.some((route) => url.startsWith(route)) && token) {
        toast.error("Permission Denied!", {
          duration: 3000,
          position: "top-center",
        });
        router.events.emit("routeChangeError");
        // Prevent route change
        throw "Permission Denied";
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router]);

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

// export default MyApp;
export default dynamic(() => Promise.resolve(MyApp), { ssr: false });
