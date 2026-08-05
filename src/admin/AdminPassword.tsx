import React, { useState } from "react";
import { Lock } from "lucide-react";
import { API_BASE_URL } from "../config";

interface AdminPasswordProps {
  token: string;
}

export default function AdminPassword({ token }: AdminPasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Las contraseñas nuevas no coinciden.", type: "error" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ text: "Contraseña actualizada con éxito.", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ text: data.message || "Error al cambiar contraseña", type: "error" });
      }
    } catch {
      setPasswordMsg({ text: "Error de conexión con el servidor", type: "error" });
    }
  };

  return (
    <div className="max-w-md bg-zinc-800/40 border border-zinc-700/80 p-6 rounded-2xl space-y-6">
      <div className="pb-3 border-b border-zinc-800">
        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Lock className="w-5 h-5 text-fantasy-purple-400" /> Cambiar Contraseña
        </h3>
        <p className="text-xs text-zinc-400 mt-1">Actualiza las credenciales de acceso para el usuario administrador.</p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Contraseña Actual</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-fantasy-purple-500"
          />
              {currentPassword.length > 50 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> La contraseña no puede exceder los 50 caracteres.
                </p>
              )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Nueva Contraseña</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-fantasy-purple-500"
          />
              {newPassword.length > 50 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> La contraseña no puede exceder los 50 caracteres.
                </p>
              )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-fantasy-purple-500"
          />
              {confirmPassword.length > 50 && (
                <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                  <span>⚠️</span> La contraseña no puede exceder los 50 caracteres.
                </p>
              )}
        </div>

        {passwordMsg.text && (
          <p className={`text-xs p-2.5 rounded-lg text-center font-medium ${
            passwordMsg.type === "success"
              ? "bg-fantasy-purple-950/80 border border-fantasy-purple-500/30 text-fantasy-purple-300"
              : "bg-red-950/80 border border-red-500/30 text-red-300"
          }`}>
            {passwordMsg.text}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-fantasy-pink-600 hover:bg-fantasy-pink-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-fantasy-purple-950/40 cursor-pointer"
        >
          Actualizar Contraseña
        </button>
      </form>
    </div>
  );
}
