import React, { useState } from "react";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const resData = await res.json();
      if (resData.success && resData.token) {
        sessionStorage.setItem("admin_token", resData.token);
        onLoginSuccess(resData.token);
      } else {
        setLoginError(resData.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setLoginError("Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-16 px-4 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl border border-zinc-800 p-8 shadow-2xl shadow-fantasy-purple-950/30">
        <div className="text-center mb-8">
          <div className="inline-flex bg-fantasy-purple-950/80 border border-fantasy-purple-500/30 text-fantasy-purple-400 p-3.5 rounded-full mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">Acceso Administrativo</h2>
          <p className="text-xs text-zinc-400 mt-1">Por favor inicia sesión para gestionar el contenido</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Usuario
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500 focus:ring-1 focus:ring-fantasy-purple-500"
              id="login-username"
            />
            {username.length > 50 && (
              <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                <span>⚠️</span> El usuario no puede exceder los 50 caracteres.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-fantasy-purple-500 focus:ring-1 focus:ring-fantasy-purple-500"
              id="login-password"
            />
            {password.length > 50 && (
              <p className="text-xs font-bold text-red-400 mt-1.5 flex items-center gap-1.5 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-lg shadow-sm">
                <span>⚠️</span> La contraseña no puede exceder los 50 caracteres.
              </p>
            )}
          </div>

          {loginError && (
            <p className="text-xs text-red-300 bg-red-950/60 border border-red-800/50 p-2.5 rounded-md font-medium text-center">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center gap-2 py-3 bg-fantasy-pink-600 hover:bg-fantasy-pink-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-fantasy-purple-950/50 cursor-pointer"
            id="login-submit"
          >
            <Lock className="w-4 h-4" />
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-fantasy-purple-400 font-semibold transition-colors cursor-pointer"
          >
            ← Volver al Sitio Web
          </a>
        </div>
      </div>
    </div>
  );
}
