import toast from "react-hot-toast";
import localStorageService from "~/service/LocalstorageService";
import { useAuthStore } from "~/store";

export type Permission =
  | "read"
  | "write"
  | "delete"
  | "edit"
  | "super-read"
  | "super-write"
  | "super-delete"
  | "super-edit"
  | "trx-update";

// 1- Customer/ user
// 2- Viewer
// 3- Admin
// 4- Super Admin

export const roleRestrictions: Record<string, string[]> = {
  "1": [
    "/banking/individuals/user-form",
    "/banking/companies/company-form",
    "/banking/company-staff/form",
    "/banking/accounts/addAccount",
    "/banking/limits/addLimits",
    "/banking/price-list/price-list-form",
    "/banking/transactions/addTransaction",
    "/administration/administrators/create",
    "/exchange/limits/view/addLimit",
    "/exchange/limits/view/editLimit",
    "/profile/addNew",
  ],
  "2": [
    "/banking/individuals/user-form",
    "/banking/companies/company-form",
    "/banking/company-staff/form",
    "/banking/accounts/addAccount",
    "/banking/limits/addLimits",
    "/banking/price-list/price-list-form",
    "/banking/transactions/addTransaction",
    "/administration/administrators/create",
    "/exchange/limits/view/addLimit",
    "/exchange/limits/view/editLimit",
    "/profile/addNew",
  ],
  // "3": ["/administration/administrators/create"],
};

export interface User {
  permissions: Permission[];
}

const getCurrentUser = (): User => {
  const roleId = localStorageService.decodeAuthBody()?.roleId;
  console.log("roleId: ", roleId);

  if (roleId === 1) {
    return {
      permissions: ["read"],
    };
  } else if (roleId === 2) {
    return {
      permissions: ["read"],
    };
  } else if (roleId === 3) {
    return {
      permissions: [
        "read",
        "write",
        "delete",
        "edit",
        "super-write",
        "trx-update",
      ],
    };
  } else if (roleId === 4) {
    return {
      permissions: [
        "read",
        "write",
        "delete",
        "edit",
        "super-read",
        "super-write",
        "super-delete",
        "super-edit",
        "trx-update",
      ],
    };
  }
  return {
    permissions: ["read"],
  };
};

export const hasPermission = (
  user: User,
  requiredPermission: Permission,
): boolean => {
  return user.permissions.includes(requiredPermission);
};

export const enforcePermission = <T extends (...args: any[]) => void>(
  requiredPermission: Permission,
  actions: T | T[],
): void => {
  if (hasPermission(getCurrentUser(), requiredPermission)) {
    if (Array.isArray(actions)) {
      actions.forEach((action) => action());
    } else {
      actions();
    }
  } else {
    toast.error("Permission Denied!");
  }
};
