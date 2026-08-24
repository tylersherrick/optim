export default function Logo({ badge = false, size = 22 }) {
  return (
    <span className={`logo-mark${badge ? " logo-mark-badge" : ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="logo-icon"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="6"
          width="13"
          height="13"
          rx="4"
          transform="rotate(-10 9.5 12.5)"
          fill="#819aa3"
        />
        <rect
          x="8"
          y="5"
          width="13"
          height="13"
          rx="4"
          transform="rotate(8 14.5 11.5)"
          fill="#93c591"
        />
      </svg>
      <span className="logo-text">Optim</span>
    </span>
  );
}
