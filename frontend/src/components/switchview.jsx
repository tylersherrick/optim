export function SwitchView(view) {
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  ["home", "kanban", "timeline", "collab"].forEach((v) => {
    document.getElementById("view-" + v).style.display =
      v === view ? "block" : "none";
  });
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => switchView(item.dataset.view));
});
