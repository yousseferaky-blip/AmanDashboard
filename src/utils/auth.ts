import { PERMISSIONS_ROUTES } from "../config/permissionsMap";

export const getAllowedRoutes = (): string[] => {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

    if (!user?.permissions) return [];

    return user.permissions
      .map((p: any) => PERMISSIONS_ROUTES[p.name])
      .filter(Boolean); 
  } catch {
    return [];
  }
};
