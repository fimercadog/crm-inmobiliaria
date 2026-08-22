import { useAppSelector } from "@/hooks/redux";

export function usePermissions() {
  const role = useAppSelector((state) => state.auth.user?.role);

  const isAdmin = role === "admin";
  const canWrite = role === "admin" || role === "agente";
  const canDelete = isAdmin;

  return { role, isAdmin, canWrite, canDelete };
}
