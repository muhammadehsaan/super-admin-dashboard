import { Link } from "react-router-dom";

function AccessCard({ title = "Access Restricted", message, actionLabel = "Back to dashboard" }) {
  return (
    <div className="page-shell">
      <div className="page-card">
        <h2>{title}</h2>
        <p className="muted">{message}</p>
        <Link className="link-button" to="/dashboard">
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

export default AccessCard;
