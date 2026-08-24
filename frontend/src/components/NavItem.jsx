export default function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}
