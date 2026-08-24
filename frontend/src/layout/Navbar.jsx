import { Link } from "react-router";
import WorkspaceSwitcher from "./WorkspaceSwitcher.jsx";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link to="/workspaces" className={styles.logo}>
          Optim
        </Link>
        <WorkspaceSwitcher />
      </div>
      <Link to="/profile" className={styles.profileLink}>
        Profile
      </Link>
    </nav>
  );
}
