import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createRole, getRoles } from "../lib/api";
import { loadAuth } from "../lib/storage";
import AccessCard from "../components/AccessCard";

function Roles() {
  const navigate = useNavigate();
  const { token, user } = loadAuth();
  const permissions = user?.permissions || [];
  const canView = permissions.some((perm) => perm.startsWith("roles:"));
  const canCreate = permissions.includes("roles:create");

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token || !canView) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getRoles(token)
      .then((data) => {
        setRoles(data.roles || []);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Unable to load roles");
      })
      .finally(() => setLoading(false));
  }, [token, canView]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;
    setStatus("");

    try {
      await createRole(token, { name: name.trim() });
      setName("");
      setStatus("Role created.");
      if (canView) {
        const data = await getRoles(token);
        setRoles(data.roles || []);
      }
    } catch (err) {
      setStatus(err.message || "Failed to create role");
    }
  };

  if (!canView) {
    return (
      <AccessCard
        title="Roles access restricted"
        message="You do not have permission to view roles."
      />
    );
  }

  return (
    <div className="page-shell">
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2>Roles</h2>
            <p className="muted">Create and organize access roles.</p>
          </div>
          <Link className="link-button secondary" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className="split-grid">
          <div>
            <h3>Role List</h3>
            {loading ? (
              <p className="muted">Loading roles...</p>
            ) : error ? (
              <p className="status">{error}</p>
            ) : roles.length === 0 ? (
              <p className="muted">No roles found.</p>
            ) : (
              <div className="list-grid">
                {roles.map((role) => (
                  <div className="list-item" key={role.id || role._id || role.name}>
                    <strong>{role.name}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3>Create Role</h3>
            {!canCreate ? (
              <p className="muted">You do not have permission to create roles.</p>
            ) : (
              <form className="form-grid" onSubmit={handleSubmit}>
                <label>
                  Role name
                  <input value={name} onChange={(event) => setName(event.target.value)} required />
                </label>
                <button type="submit">Create Role</button>
                {status ? <p className="status">{status}</p> : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Roles;
