import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dashboardSummary, me } from "../lib/api";
import { clearAuth, loadAuth } from "../lib/storage";
import { mockStats, mockUser } from "../data/mockData";

const PERMISSION_CATALOG = {
  "users:create": {
    label: "Create users",
    category: "Users",
    description: "Create new user accounts",
  },
  "users:edit": {
    label: "Edit users",
    category: "Users",
    description: "Edit user profile and status",
  },
  "users:delete": {
    label: "Delete users",
    category: "Users",
    description: "Remove users from the system",
  },
  "users:view": {
    label: "View users",
    category: "Users",
    description: "View user list and details",
  },
  "roles:create": {
    label: "Create roles",
    category: "Roles",
    description: "Create new access roles",
  },
  "roles:edit": {
    label: "Edit roles",
    category: "Roles",
    description: "Edit existing roles",
  },
  "roles:delete": {
    label: "Delete roles",
    category: "Roles",
    description: "Remove roles from the system",
  },
  "inventory:manage": {
    label: "Manage inventory",
    category: "Inventory",
    description: "Inventory tracking and updates",
  },
  "sales:manage": {
    label: "Manage sales",
    category: "Sales",
    description: "Sales orders and pipeline",
  },
  "accounts:manage": {
    label: "Manage accounts",
    category: "Accounts",
    description: "Finance and accounting operations",
  },
  "reports:view": {
    label: "View reports",
    category: "Reports",
    description: "Access reports and analytics",
  },
  "settings:access": {
    label: "System settings",
    category: "Settings",
    description: "Access configuration settings",
  },
  "dashboard:access": {
    label: "Dashboard access",
    category: "Dashboard",
    description: "Access dashboard overview",
  },
  "profile:view": {
    label: "View profile",
    category: "Profile",
    description: "View your profile",
  },
  "profile:edit": {
    label: "Edit profile",
    category: "Profile",
    description: "Edit your profile details",
  },
};

const CATEGORY_ORDER = [
  "Users",
  "Roles",
  "Inventory",
  "Sales",
  "Accounts",
  "Reports",
  "Settings",
  "Dashboard",
  "Profile",
  "Other",
];

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(mockUser);
  const [stats, setStats] = useState(mockStats);
  const [mode, setMode] = useState("offline");
  const [notice, setNotice] = useState("");
  const [sessionStatus, setSessionStatus] = useState("Offline");
  const [permissionFilter, setPermissionFilter] = useState("");
  const [permissionStatus, setPermissionStatus] = useState("");

  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isDemo = search.get("demo") === "1";

  useEffect(() => {
    document.body.classList.add("dashboard-body");
    return () => document.body.classList.remove("dashboard-body");
  }, []);

  useEffect(() => {
    if (isDemo) {
      setMode("demo");
      setNotice("Demo mode enabled. Connect DB later for live data.");
      setSessionStatus("Offline");
      setUser(mockUser);
      setStats(mockStats);
      return;
    }

    const { token, user: storedUser } = loadAuth();
    if (!token) {
      setMode("offline");
      setNotice("No active session. Use login or demo mode.");
      setSessionStatus("Offline");
      setUser(mockUser);
      setStats(mockStats);
      return;
    }

    setMode("live");
    setNotice("Connecting to API...");
    setSessionStatus("Online");

    me(token)
      .then((data) => {
        const apiUser = data.user || storedUser || mockUser;
        setUser({
          ...mockUser,
          ...apiUser,
          roles: apiUser.roles || mockUser.roles,
          permissions: apiUser.permissions || mockUser.permissions,
        });

        return dashboardSummary(token)
          .then((summary) => {
            setStats({ ...mockStats, ...(summary.stats || {}) });
            setNotice("Connected to API.");
          })
          .catch(() => {
            setStats(mockStats);
            setNotice("Connected to API. Summary unavailable.");
          });
      })
      .catch(() => {
        setMode("offline");
        setSessionStatus("Offline");
        setNotice("API not reachable. Demo data is shown.");
        setUser(mockUser);
        setStats(mockStats);
      });
  }, [isDemo]);

  const roles = user.roles || [];
  const permissions = user.permissions || [];
  const token = loadAuth().token;
  const hasPermission = (perm) => permissions.includes(perm);
  const hasAnyPermission = (list) => list.some((perm) => permissions.includes(perm));
  const isSuperAdmin = roles.includes("super_admin");
  const roleLabelMap = {
    super_admin: "Super Admin",
    admin: "Admin",
    manager: "Manager",
    accountant: "Accountant",
    employee: "Employee",
  };
  const primaryRole = roles[0] || "employee";
  const roleLabel = roleLabelMap[primaryRole] || primaryRole;

  const moduleAccess = [
    { label: "Inventory", permission: "inventory:manage", path: "/module/inventory" },
    { label: "Sales", permission: "sales:manage", path: "/module/sales" },
    { label: "Accounts", permission: "accounts:manage", path: "/module/accounts" },
    { label: "Reports", permission: "reports:view", path: "/module/reports" },
    { label: "System Settings", permission: "settings:access", path: "/module/settings" },
  ];

  const actionItems = [
    {
      label: "Create a new user",
      permission: "users:create",
      path: "/users",
      button: "New User",
    },
    {
      label: "Create or update roles",
      permissionAny: ["roles:create", "roles:edit", "roles:delete"],
      path: "/roles",
      button: "Manage Roles",
    },
    {
      label: "Review all reports",
      permission: "reports:view",
      path: "/module/reports",
      button: "Reports",
    },
    {
      label: "My profile",
      permissionAny: ["profile:view", "profile:edit"],
      path: "/profile",
      button: "Profile",
    },
  ];

  const visibleActions = actionItems.filter((item) => {
    if (item.permission) return hasPermission(item.permission);
    if (item.permissionAny) return hasAnyPermission(item.permissionAny);
    return false;
  });

  const visibleModules = moduleAccess.filter((module) => hasPermission(module.permission));
  const moduleCount = visibleModules.length;

  const permissionItems = permissions.map((permission) => {
    const meta = PERMISSION_CATALOG[permission] || {
      label: permission,
      category: "Other",
      description: "Custom permission",
    };
    return {
      key: permission,
      raw: permission,
      ...meta,
    };
  });

  const filterValue = permissionFilter.trim().toLowerCase();
  const filteredPermissions = filterValue.length
    ? permissionItems.filter((item) => {
        const label = item.label.toLowerCase();
        const raw = item.raw.toLowerCase();
        const category = item.category.toLowerCase();
        return (
          label.includes(filterValue) ||
          raw.includes(filterValue) ||
          category.includes(filterValue)
        );
      })
    : permissionItems;

  const groupedPermissions = filteredPermissions.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const orderedGroups = CATEGORY_ORDER.filter((category) => groupedPermissions[category]).map(
    (category) => ({
      category,
      items: groupedPermissions[category],
    })
  );

  const extraGroups = Object.keys(groupedPermissions)
    .filter((category) => !CATEGORY_ORDER.includes(category))
    .sort()
    .map((category) => ({ category, items: groupedPermissions[category] }));

  const permissionGroups = [...orderedGroups, ...extraGroups];
  const permissionCount = permissions.length;
  const filteredCount = filteredPermissions.length;

  const statCards = [
    {
      label: "Total Users",
      value: stats.users,
      show: hasPermission("users:view"),
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      show: hasPermission("users:view"),
    },
    {
      label: "Active Roles",
      value: stats.roles,
      show: hasAnyPermission(["roles:create", "roles:edit", "roles:delete"]),
    },
    {
      label: "Permissions",
      value: stats.permissions,
      show: hasAnyPermission(["roles:create", "roles:edit", "roles:delete"]),
    },
    {
      label: "Modules Enabled",
      value: moduleCount,
      show: hasPermission("dashboard:access"),
    },
  ];

  const visibleStats = statCards.filter((card) => card.show);
  const initials = (user.name || user.email || "SA")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "SA";

  const handleCopyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setNotice("Token copied.");
    } catch (err) {
      setNotice("Unable to copy token.");
    }
  };

  const handleCopyPermissions = async () => {
    if (!permissions.length) return;
    try {
      await navigator.clipboard.writeText(permissions.join(", "));
      setPermissionStatus("Permissions copied.");
    } catch (err) {
      setPermissionStatus("Unable to copy permissions.");
    }
  };

  const handleSignOut = () => {
    clearAuth();
    navigate("/");
  };

  const goTo = (path, allowed = true) => {
    if (!allowed) return;
    navigate(path);
  };

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div className="brand-mark">
          <span>ERP Suite</span>
          <strong>{roleLabel}</strong>
        </div>

        <div className="search">
          <input type="search" placeholder="Search users, roles, modules" />
        </div>

        <div className="user-card">
          <div className="avatar">{initials}</div>
          <div>
            <div>{user.name || user.email || "User"}</div>
            <div className={`badge ${isSuperAdmin ? "" : "teal"}`}>
              {isSuperAdmin ? "Full Control" : roleLabel}
            </div>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-card">
          <div className={`badge ${mode === "live" ? "teal" : ""}`}>
            {mode === "live" ? "Live Mode" : mode === "demo" ? "Demo Mode" : "Offline"}
          </div>
          <h2>Welcome back, {user.name || "User"}</h2>
          <p>
            {isSuperAdmin
              ? "You have complete visibility across users, roles, inventory, sales, purchases, accounts, and system settings."
              : "Your access is limited based on your assigned role and permissions."}
          </p>
          <div className="action-list">
            {visibleActions.length === 0 ? (
              <div className="action-item">
                <span>No quick actions available</span>
                <button className="secondary" disabled>
                  Locked
                </button>
              </div>
            ) : (
              visibleActions.map((item) => (
                <div className="action-item" key={item.label}>
                  <span>{item.label}</span>
                  <button className="secondary" onClick={() => goTo(item.path, true)}>
                    {item.button}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hero-card">
          <h3>System Snapshot</h3>
          <div className="stat-grid">
            {visibleStats.length === 0 ? (
              <div className="stat-card">
                <h4>No stats available</h4>
                <strong>-</strong>
              </div>
            ) : (
              visibleStats.map((card) => (
                <div className="stat-card" key={card.label}>
                  <h4>{card.label}</h4>
                  <strong>{card.value ?? 0}</strong>
                </div>
              ))
            )}
          </div>
          <p className="notice">{notice}</p>
        </div>
      </section>

      <section className="grid-two">
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3>Permissions</h3>
              <p className="muted">
                {filteredCount} of {permissionCount} permissions visible
              </p>
            </div>
            <div className="panel-actions">
              <span className="chip">{permissionCount}</span>
              <button
                className="secondary"
                onClick={handleCopyPermissions}
                disabled={!permissionCount}
              >
                Copy
              </button>
            </div>
          </div>
          <div className="permission-search">
            <input
              type="search"
              placeholder="Filter permissions by name or category"
              value={permissionFilter}
              onChange={(event) => setPermissionFilter(event.target.value)}
            />
          </div>
          {permissionStatus ? <p className="status">{permissionStatus}</p> : null}
          {permissionGroups.length === 0 ? (
            <p className="muted">No permissions assigned.</p>
          ) : (
            permissionGroups.map((group) => (
              <div className="permission-group" key={group.category}>
                <div className="permission-group-header">
                  <h4>{group.category}</h4>
                  <span className="chip">{group.items.length}</span>
                </div>
                <div className="permission-grid">
                  {group.items.map((item) => (
                    <div className="permission-pill" key={item.key} title={item.description}>
                      <strong>{item.label}</strong>
                      <span>{item.raw}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3>Roles</h3>
              <p className="muted">Primary role: {roleLabel}</p>
            </div>
            <div className="panel-actions">
              <span className="chip">{roles.length}</span>
            </div>
          </div>
          <div className="role-summary">
            <div className="summary-item">
              <span>Actions enabled</span>
              <strong>{visibleActions.length}</strong>
            </div>
            <div className="summary-item">
              <span>Modules enabled</span>
              <strong>{moduleCount}</strong>
            </div>
          </div>
          <div className="chips">
            {roles.length === 0 ? (
              <span className="chip">No roles assigned</span>
            ) : (
              roles.map((role) => (
                <span className="chip" key={role}>
                  {role}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="panel-card">
          <h3>Module Access</h3>
          <div className="action-list">
            {visibleModules.length === 0 ? (
              <div className="action-item">
                <span>No module access assigned</span>
                <button disabled>Locked</button>
              </div>
            ) : (
              visibleModules.map((module) => (
                <div className="action-item" key={module.label}>
                  <span>{module.label}</span>
                  <button onClick={() => goTo(module.path, true)}>Open</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel-card">
          <h3>Session</h3>
          <div className="action-list">
            <div className="action-item">
              <span>Session status</span>
              <div className="badge">{sessionStatus}</div>
            </div>
            <div className="action-item">
              <span>Token</span>
              <button className="secondary" onClick={handleCopyToken}>
                Copy
              </button>
            </div>
            <div className="action-item">
              <span>Sign out</span>
              <button className="secondary" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
