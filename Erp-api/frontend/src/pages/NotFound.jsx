import { useEffect } from "react";
import { Link } from "react-router-dom";

function NotFound() {
  useEffect(() => {
    document.body.classList.add("login-body");
    return () => document.body.classList.remove("login-body");
  }, []);

  return (
    <main className="shell">
      <section className="panel">
        <div className="card">
          <h2>Page not found</h2>
          <p className="muted">The page you are looking for does not exist.</p>
          <Link className="link-button" to="/">
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
