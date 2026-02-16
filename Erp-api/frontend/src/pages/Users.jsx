import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser, getUsers } from "../lib/api";
import { loadAuth } from "../lib/storage";
import AccessCard from "../components/AccessCard";

function Users() {
  const navigate = useNavigate();
  const { token, user } = loadAuth();
  const permissions = user?.permissions || [];
  const canView = permissions.includes("users:view");
  const canCreate = permissions.includes("users:create");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    name: "",
    roles: "",
  });
  const [formStatus, setFormStatus] = useState("");

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
    getUsers(token)
      .then((data) => {
        setUsers(data.users || []);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Unable to load users");
      })
      .finally(() => setLoading(false));
  }, [token, canView]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;
    setFormStatus("");

    try {
      const roles = formState.roles
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);

      await createUser(token, {
        email: formState.email.trim(),
        password: formState.password,
        name: formState.name.trim(),
        roles,
      });

      setFormState({ email: "", password: "", name: "", roles: "" });
      setFormStatus("User created successfully.");

      if (canView) {
        const data = await getUsers(token);
        setUsers(data.users || []);
      }
    } catch (err) {
      setFormStatus(err.message || "Failed to create user");
    }
  };

  if (!canView) {
    return (
      <AccessCard
        title="Users access restricted"
        message="You do not have permission to view users."
      />
    );
  }

  return (
    <div className="page-shell">
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2>Users</h2>
            <p className="muted">Create and manage ERP users.</p>
          </div>
          <Link className="link-button secondary" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className="split-grid">
          <div>
            <h3>User List</h3>
            {loading ? (
              <p className="muted">Loading users...</p>
            ) : error ? (
              <p className="status">{error}</p>
            ) : users.length === 0 ? (
              <p className="muted">No users found.</p>
            ) : (
              <div className="list-grid">
                {users.map((u) => (
                  <div className="list-item" key={u.id}>
                    <div>
                      <strong>{u.name || "Unnamed"}</strong>
                      <div className="muted">{u.email}</div>
                    </div>
                    <div className="chip">{(u.roles || []).join(", ") || "No roles"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3>Create User</h3>
            {!canCreate ? (
              <p className="muted">You do not have permission to create users.</p>
            ) : (
              <form className="form-grid" onSubmit={handleSubmit}>
                <label>
                  Email
                  <input
                    type="email"
                    value={formState.email}
                    onChange={handleChange("email")}
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={formState.password}
                    onChange={handleChange("password")}
                    required
                  />
                </label>
                <label>
                  Name
                  <input type="text" value={formState.name} onChange={handleChange("name")} />
                </label>
                <label>
                  Roles (comma separated)
                  <input
                    type="text"
                    value={formState.roles}
                    onChange={handleChange("roles")}
                    placeholder="admin, manager"
                  />
                </label>
                <button type="submit">Create User</button>
                {formStatus ? <p className="status">{formStatus}</p> : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
