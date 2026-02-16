import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { saveAuth } from "../lib/storage";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("login-body");
    return () => document.body.classList.remove("login-body");
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      saveAuth(data.token, data.user, remember);
      navigate("/dashboard");
    } catch (err) {
      setStatus(err.message || "Unable to connect to API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <section className="brand">
        <div className="brand-badge">ERP Suite</div>
        <h1>Super Admin Command Center</h1>
        <p>
          Secure access to every module in the ERP. Manage users, assign roles,
          and unlock full system control from one secure login.
        </p>
        <div className="feature-list">
          <div className="feature">
            <span className="feature-dot"></span>
            Full dashboard access and system settings
          </div>
          <div className="feature">
            <span className="feature-dot"></span>
            Users, roles, inventory, sales, purchases, accounts
          </div>
          <div className="feature">
            <span className="feature-dot"></span>
            All reports with real-time visibility
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="card">
          <h2>Sign in</h2>
          <p className="muted">Use your company credentials to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="actions">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                Remember me
              </label>
              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="status" role="status">
              {status}
            </div>
          </form>

          <div className="helper">
            No database yet? Open the demo dashboard for UI testing.
          </div>
          <button className="secondary" onClick={() => navigate("/dashboard?demo=1")}>
            Open Demo Mode
          </button>
        </div>
        <div className="trust">Protected by JWT + role based access control</div>
      </section>
    </main>
  );
}

export default Login;
