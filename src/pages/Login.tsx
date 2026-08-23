import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, User, AlertCircle } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

export default function Login() {
  const { login } = useAuth();
  const { settings } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = (location.state as { from?: string })?.from ?? "/";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = login(username, password);
    if (ok) {
      navigate(from, { replace: true });
    } else {
      setError("Incorrect username or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory-100 dark:bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-maroon-500 text-gold-300 font-display text-2xl font-semibold overflow-hidden mb-4">
            {settings.logoDataUrl ? (
              <img src={settings.logoDataUrl} alt={settings.banquetName} className="h-full w-full object-cover" />
            ) : (
              settings.banquetName.charAt(0)
            )}
          </div>
          <p className="font-display text-xl font-semibold text-ink-800 dark:text-ivory-100">
            {settings.banquetName}
          </p>
          <p className="text-sm text-ink-400">Management Console</p>
        </div>

        <div className="rounded-2xl border border-ink-100/60 dark:border-ink-600/60 bg-white dark:bg-ink-800/60 shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3 top-[38px] text-ink-400" />
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="pl-9"
                autoFocus
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-[38px] text-ink-400" />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9"
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-danger-500">
                <AlertCircle size={13} /> {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-400 mt-5">
          Demo credentials — Username: <span className="font-mono-tabular">admin</span> · Password:{" "}
          <span className="font-mono-tabular">banquet123</span>
        </p>
      </div>
    </div>
  );
}
