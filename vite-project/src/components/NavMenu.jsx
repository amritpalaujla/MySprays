import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Hamburger button in the top nav with a small dropdown of account links.
// Logged out: Home, Log In, Sign Up. Logged in: Home, Dashboard, Log Out.
function NavMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking outside the menu or pressing Escape
  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="nav-menu" ref={menuRef}>
      <button
        type="button"
        className="nav-menu-button"
        aria-label="Menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
        <span className="nav-menu-label">Menu</span>
      </button>

      {open && (
        <div className="nav-menu-dropdown" role="menu">
          <Link to="/" role="menuitem" onClick={close}>
            Home
          </Link>
          {user ? (
            <>
              <Link to="/tracking" role="menuitem" onClick={close}>
                Dashboard
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onLogout();
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/tracking"
                state={{ authMode: "login" }}
                role="menuitem"
                onClick={close}
              >
                Log In
              </Link>
              <Link
                to="/tracking"
                state={{ authMode: "signup" }}
                role="menuitem"
                onClick={close}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NavMenu;
