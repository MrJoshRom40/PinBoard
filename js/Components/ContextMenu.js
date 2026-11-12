let menuEl = null;

function ensureMenu() {
  if (menuEl) return menuEl;
  menuEl = document.createElement("ul");
  menuEl.className = "context-menu";
  menuEl.setAttribute("role", "menu");
  menuEl.hidden = true;
  document.body.appendChild(menuEl);
  return menuEl;
}

/* ---------- cierre ---------- */

function onPointerDown(e) {
  if (!menuEl.contains(e.target)) closeContextMenu();
}

function onKeyDown(e) {
  if (e.key === "Escape") {
    closeContextMenu();
    return;
  }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const items = [
      ...menuEl.querySelectorAll(".context-menu__item:not(:disabled)"),
    ];
    if (!items.length) return;
    const i = items.indexOf(document.activeElement);
    const next =
      e.key === "ArrowDown"
        ? items[(i + 1) % items.length]
        : items[(i - 1 + items.length) % items.length];
    next.focus();
  }
}

function addGlobalListeners() {
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("scroll", closeContextMenu, true);
  window.addEventListener("resize", closeContextMenu);
  window.addEventListener("blur", closeContextMenu);
}

function removeGlobalListeners() {
  document.removeEventListener("pointerdown", onPointerDown, true);
  document.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("scroll", closeContextMenu, true);
  window.removeEventListener("resize", closeContextMenu);
  window.removeEventListener("blur", closeContextMenu);
}

export function closeContextMenu() {
  if (!menuEl || menuEl.hidden) return;
  menuEl.hidden = true;
  menuEl.replaceChildren();
  removeGlobalListeners();
}

/* ---------- construcción ---------- */

function buildItem(option, target, event) {
  const li = document.createElement("li");

  if (option.separator) {
    li.className = "context-menu__separator";
    li.setAttribute("role", "separator");
    return li;
  }

  li.setAttribute("role", "none");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "context-menu__item";
  btn.setAttribute("role", "menuitem");
  btn.disabled = Boolean(option.disabled);
  if (option.danger) btn.classList.add("context-menu__item--danger");

  if (option.icon) {
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = option.icon;
    btn.appendChild(icon);
  }

  const label = document.createElement("span");
  label.textContent = option.label;
  btn.appendChild(label);

  // En buildItem, deja el listener así:
  btn.addEventListener("click", () => {
    closeContextMenu();
    option.action?.(target, event);
  });

  li.appendChild(btn);
  return li;
}

/* ---------- API pública ---------- */

// Abre el menú en la posición del mouse
export function openContextMenu(event, options, target = event.target) {
  const menu = ensureMenu();
  closeContextMenu();

  options.forEach((opt) => menu.appendChild(buildItem(opt, target, event)));

  menu.hidden = false;
  menu.style.left = "0px";
  menu.style.top = "0px";

  // Evita que se salga de la pantalla
  const { width, height } = menu.getBoundingClientRect();
  const margin = 8;
  const x = Math.min(event.clientX + 2, window.innerWidth - width - margin);
  const y = Math.min(event.clientY + 2, window.innerHeight - height - margin);
  menu.style.left = `${Math.max(margin, x)}px`;
  menu.style.top = `${Math.max(margin, y)}px`;

  addGlobalListeners();
}

// Conecta el menú a un elemento (clic derecho)
// options: arreglo, o función (target, event) => arreglo
// selector: opcional, para delegar a hijos (útil con elementos creados dinámicamente)
export function attachContextMenu(container, options, selector = null) {
  container.addEventListener("contextmenu", (event) => {
    const target = selector ? event.target.closest(selector) : container;
    if (!target || !container.contains(target)) return;

    const list =
      typeof options === "function" ? options(target, event) : options;
    if (!list?.length) return;

    event.preventDefault();
    openContextMenu(event, list, target);
  });
}
