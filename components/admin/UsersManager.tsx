"use client";

import { useMemo, useState } from "react";

import type { Tables } from "@/src/types/database.types";

type UserRow = Tables<"admin_profiles">;
type UserRole = UserRow["role"];

function roleLabel(role: UserRole) {
  return role === "admin" ? "Administrador" : "Editor";
}

export function UsersManager({
  initialUsers,
  isAdmin,
}: {
  initialUsers: UserRow[];
  isAdmin: boolean;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      if (!term) return true;
      return `${user.email} ${user.full_name ?? ""}`.toLowerCase().includes(term);
    });
  }, [users, search]);

  async function refreshUsers() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "No se pudieron recargar los usuarios.");
    }
    setUsers(payload.data ?? []);
  }

  async function updateUser(
    userId: string,
    patch: { role?: UserRole; isActive?: boolean },
    successMessage: string,
  ) {
    if (!isAdmin) {
      setError("Solo el administrador puede gestionar usuarios.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...patch }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo actualizar el usuario.");
      }
      setUsers((prev) => prev.map((user) => (user.id === userId ? payload.data : user)));
      setMessage(successMessage);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-wide">Usuarios</h1>
        <p className="text-sm text-neutral-400">
          Gestión de usuarios internos del panel y sus permisos.
        </p>
      </div>

      <div className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="w-full max-w-md space-y-1 text-sm">
            <span className="text-neutral-300">Buscar usuario</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por email o nombre"
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={() => void refreshUsers()}
            className="rounded-md border border-white/15 px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5"
          >
            Recargar
          </button>
        </div>
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.1em] text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Rol</th>
              <th className="px-3 py-2 text-left">Alta</th>
              <th className="px-3 py-2 text-left">Acceso</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-3 py-2 text-neutral-200">{user.email}</td>
                <td className="px-3 py-2 text-neutral-300">{roleLabel(user.role)}</td>
                <td className="px-3 py-2 text-neutral-400">
                  {new Date(user.created_at).toLocaleString("es-ES")}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-[11px] ${
                      user.is_active
                        ? "border-emerald-300/35 bg-emerald-500/10 text-emerald-200"
                        : "border-red-300/35 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {user.is_active ? "Activo" : "Desactivado"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        void updateUser(
                          user.id,
                          { role: event.target.value as UserRole },
                          "Rol actualizado.",
                        )
                      }
                      disabled={!isAdmin || isLoading}
                      className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-xs text-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-500"
                    >
                      <option value="admin">Administrador</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        void updateUser(
                          user.id,
                          { isActive: !user.is_active },
                          user.is_active ? "Usuario desactivado." : "Usuario activado.",
                        )
                      }
                      disabled={!isAdmin || isLoading}
                      className="rounded-md border border-white/15 px-3 py-1 text-xs text-neutral-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:text-neutral-500"
                    >
                      {user.is_active ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredUsers.length ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-neutral-400">
                  No hay usuarios para el filtro actual.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
