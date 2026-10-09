"use client";

export default function JoinButton({ children, className = "btn btn-primary", onClick }) {
  function handleClick(e) {
    e.preventDefault();

    // Not registered -> the form exists. Registered -> go to the user card.
    const target =
      document.getElementById("register") ||
      document.getElementById("user-card") ||
      document.getElementById("spin");

    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    onClick?.();
  }

  return (
    <a href="#register" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}