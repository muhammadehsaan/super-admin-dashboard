import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { loadAuth } from "../lib/storage";
import AccessCard from "../components/AccessCard";

const MODULES = {
  inventory: {
    title: "Inventory",
    permission: "inventory:manage",
    description: "Track stock levels, items, and warehouse activity.",
  },
  sales: {
    title: "Sales",
    permission: "sales:manage",
    description: "Monitor orders, revenue, and sales performance.",
  },
  accounts: {
    title: "Accounts",
    permission: "accounts:manage",
    description: "Manage ledgers, invoices, and financial records.",
  },
  reports: {
    title: "Reports",
    permission: "reports:view",
    description: "Access KPIs, audit reports, and analytics dashboards.",
  },
  settings: {
    title: "System Settings",
    permission: "settings:access",
    description: "Control system configurations and organization settings.",
  },
};

function ModulePage() {
  const navigate = useNavigate();
  const { key: moduleKey } = useParams();
  const { token, user } = loadAuth();
  const permissions = user?.permissions || [];
  const config = MODULES[moduleKey];

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  if (!config) {
    return (
      <AccessCard
        title="Module not found"
        message="This module does not exist yet."
        actionLabel="Back to dashboard"
      />
    );
  }

  const allowed = permissions.includes(config.permission);
  if (!allowed) {
    return (
      <AccessCard
        title={`${config.title} access restricted`}
        message="You do not have permission to open this module."
      />
    );
  }

  return (
    <div className="page-shell">
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2>{config.title}</h2>
            <p className="muted">{config.description}</p>
          </div>
          <Link className="link-button secondary" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className="empty-state">
          <h3>{config.title} module</h3>
          <p className="muted">
            This module is wired with permissions and ready for data integration.
            Add APIs when you are ready to go live.
          </p>
          <button onClick={() => navigate("/dashboard")}>Return to dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default ModulePage;
