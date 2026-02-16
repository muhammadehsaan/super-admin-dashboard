import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updateProfile, me } from "../lib/api";
import { loadAuth, saveAuth } from "../lib/storage";
import AccessCard from "../components/AccessCard";

function Profile() {
  const navigate = useNavigate();
  const { token, user } = loadAuth();
  const permissions = user?.permissions || [];
  const canView = permissions.includes("profile:view") || permissions.includes("profile:edit");
  const canEdit = permissions.includes("profile:edit");

  const [formState, setFormState] = useState({
    name: user?.name || "",
    password: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if (token && canView) {
      me(token)
        .then((data) => {
          if (data.user) {
            setFormState((prev) => ({ ...prev, name: data.user.name || "" }));
            saveAuth(token, data.user, true);
          }
        })
        .catch(() => null);
    }
  }, [token, canView, navigate]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token || !canEdit) return;
    setStatus("");

    try {
      await updateProfile(token, {
        name: formState.name,
        password: formState.password,
      });
      setFormState((prev) => ({ ...prev, password: "" }));
      setStatus("Profile updated.");
    } catch (err) {
      setStatus(err.message || "Failed to update profile");
    }
  };

  if (!canView) {
    return (
      <AccessCard
        title="Profile access restricted"
        message="You do not have permission to view this page."
      />
    );
  }

  return (
    <div className="page-shell">
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2>My Profile</h2>
            <p className="muted">Update your personal information.</p>
          </div>
          <Link className="link-button secondary" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={formState.name} onChange={handleChange("name")} disabled={!canEdit} />
          </label>
          <label>
            New password
            <input
              type="password"
              value={formState.password}
              onChange={handleChange("password")}
              placeholder="Leave blank to keep current"
              disabled={!canEdit}
            />
          </label>
          <button type="submit" disabled={!canEdit}>
            {canEdit ? "Update Profile" : "Read Only"}
          </button>
          {status ? <p className="status">{status}</p> : null}
        </form>
      </div>
    </div>
  );
}

export default Profile;
