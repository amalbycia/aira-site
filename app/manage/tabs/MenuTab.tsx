"use client";

import { useState } from "react";
import type { MenuCategoryRow, MenuDishRow } from "@/lib/cms/admin";

/**
 * Events catering-menu editor. Owner manages the tabbed menu shown on the Events
 * page: categories (Vegetarian, Live Counters…) each holding an ordered list of
 * dishes. Add / rename / delete / reorder both levels. Written for a
 * non-technical owner — plain labels, confirm on destructive actions.
 */
export default function MenuTab({
  initial,
  onToast,
}: {
  initial: MenuCategoryRow[];
  onToast: (msg: string) => void;
}) {
  const [menu, setMenu] = useState<MenuCategoryRow[]>(initial);
  const [newCategory, setNewCategory] = useState("");
  const [busy, setBusy] = useState(false);

  // ── Categories ──────────────────────────────────────────────────────────────
  async function addCategory() {
    const label = newCategory.trim();
    if (!label) return;
    setBusy(true);
    const res = await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label }),
    });
    setBusy(false);
    if (!res.ok) return onToast("Could not add category");
    const { category } = await res.json();
    setMenu((m) => [...m, { ...category, dishes: [] }]);
    setNewCategory("");
    onToast("Category added");
  }

  async function renameCategory(id: number, label: string) {
    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label }),
    });
    if (!res.ok) return onToast("Could not rename category");
    setMenu((m) => m.map((c) => (c.id === id ? { ...c, label } : c)));
  }

  async function deleteCategory(id: number) {
    if (
      !confirm(
        "Delete this whole category and all its dishes? This can't be undone.",
      )
    )
      return;
    const res = await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    if (!res.ok) return onToast("Could not delete category");
    setMenu((m) => m.filter((c) => c.id !== id));
    onToast("Category deleted");
  }

  async function moveCategory(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= menu.length) return;
    const next = [...menu];
    [next[index], next[target]] = [next[target], next[index]];
    setMenu(next);
    await fetch("/api/admin/menu", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: next.map((c) => c.id) }),
    });
  }

  // ── Dishes ──────────────────────────────────────────────────────────────────
  async function addDish(categoryId: number, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await fetch("/api/admin/menu/dishes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ categoryId, name: trimmed }),
    });
    if (!res.ok) return onToast("Could not add dish");
    const { dish } = (await res.json()) as { dish: MenuDishRow };
    setMenu((m) =>
      m.map((c) =>
        c.id === categoryId ? { ...c, dishes: [...c.dishes, dish] } : c,
      ),
    );
  }

  async function renameDish(categoryId: number, id: number, name: string) {
    const res = await fetch(`/api/admin/menu/dishes/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return onToast("Could not rename dish");
    setMenu((m) =>
      m.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              dishes: c.dishes.map((d) => (d.id === id ? { ...d, name } : d)),
            }
          : c,
      ),
    );
  }

  async function deleteDish(categoryId: number, id: number) {
    const res = await fetch(`/api/admin/menu/dishes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) return onToast("Could not delete dish");
    setMenu((m) =>
      m.map((c) =>
        c.id === categoryId
          ? { ...c, dishes: c.dishes.filter((d) => d.id !== id) }
          : c,
      ),
    );
  }

  async function moveDish(categoryId: number, index: number, dir: -1 | 1) {
    const cat = menu.find((c) => c.id === categoryId);
    if (!cat) return;
    const target = index + dir;
    if (target < 0 || target >= cat.dishes.length) return;
    const dishes = [...cat.dishes];
    [dishes[index], dishes[target]] = [dishes[target], dishes[index]];
    setMenu((m) => m.map((c) => (c.id === categoryId ? { ...c, dishes } : c)));
    await fetch("/api/admin/menu/dishes", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: dishes.map((d) => d.id) }),
    });
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Events Catering Menu</h2>
          <p>
            The tabbed menu shown on the Events page. Add categories (e.g.
            Vegetarian, Live Counters) and the dishes inside each.
          </p>
        </div>
      </div>

      <div className="card" style={{ display: "flex", gap: "0.6em", alignItems: "flex-end" }}>
        <label className="field" style={{ flex: 1, marginBottom: 0 }}>
          <span className="field__label">New category</span>
          <input
            className="input"
            placeholder="e.g. Beverages"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
        </label>
        <button
          className="btn btn--primary"
          onClick={addCategory}
          disabled={busy || !newCategory.trim()}
        >
          + Add category
        </button>
      </div>

      {menu.length === 0 ? (
        <div className="empty">
          No menu categories yet. Add one above to get started.
        </div>
      ) : (
        menu.map((cat, ci) => (
          <MenuCategoryCard
            key={cat.id}
            category={cat}
            isFirst={ci === 0}
            isLast={ci === menu.length - 1}
            onRename={(label) => renameCategory(cat.id, label)}
            onDelete={() => deleteCategory(cat.id)}
            onMove={(dir) => moveCategory(ci, dir)}
            onAddDish={(name) => addDish(cat.id, name)}
            onRenameDish={(id, name) => renameDish(cat.id, id, name)}
            onDeleteDish={(id) => deleteDish(cat.id, id)}
            onMoveDish={(index, dir) => moveDish(cat.id, index, dir)}
          />
        ))
      )}
    </section>
  );
}

// ── One category card (label editor + dish list) ──────────────────────────────
function MenuCategoryCard({
  category,
  isFirst,
  isLast,
  onRename,
  onDelete,
  onMove,
  onAddDish,
  onRenameDish,
  onDeleteDish,
  onMoveDish,
}: {
  category: MenuCategoryRow;
  isFirst: boolean;
  isLast: boolean;
  onRename: (label: string) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onAddDish: (name: string) => void;
  onRenameDish: (id: number, name: string) => void;
  onDeleteDish: (id: number) => void;
  onMoveDish: (index: number, dir: -1 | 1) => void;
}) {
  const [label, setLabel] = useState(category.label);
  const [newDish, setNewDish] = useState("");

  function commitLabel() {
    const trimmed = label.trim();
    if (trimmed && trimmed !== category.label) onRename(trimmed);
    else setLabel(category.label);
  }

  function submitDish() {
    if (!newDish.trim()) return;
    onAddDish(newDish);
    setNewDish("");
  }

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          gap: "0.5em",
          alignItems: "center",
          marginBottom: "0.9em",
        }}
      >
        <input
          className="input"
          value={label}
          aria-label="Category name"
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          style={{ fontWeight: 600, flex: 1 }}
        />
        <div style={{ display: "flex", gap: "0.25em" }}>
          <button
            className="btn btn--ghost btn--sm"
            title="Move category up"
            onClick={() => onMove(-1)}
            disabled={isFirst}
          >
            ↑
          </button>
          <button
            className="btn btn--ghost btn--sm"
            title="Move category down"
            onClick={() => onMove(1)}
            disabled={isLast}
          >
            ↓
          </button>
          <button
            className="btn btn--danger btn--sm"
            title="Delete category"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>

      {category.dishes.length === 0 ? (
        <p className="empty" style={{ margin: "0 0 0.8em" }}>
          No dishes yet.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.8em" }}>
          {category.dishes.map((dish, di) => (
            <DishRow
              key={dish.id}
              dish={dish}
              isFirst={di === 0}
              isLast={di === category.dishes.length - 1}
              onRename={(name) => onRenameDish(dish.id, name)}
              onDelete={() => onDeleteDish(dish.id)}
              onMove={(dir) => onMoveDish(di, dir)}
            />
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: "0.5em", alignItems: "flex-end" }}>
        <label className="field" style={{ flex: 1, marginBottom: 0 }}>
          <span className="field__label">Add a dish</span>
          <input
            className="input"
            placeholder="e.g. Malabar Chicken Biryani"
            value={newDish}
            onChange={(e) => setNewDish(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitDish()}
          />
        </label>
        <button
          className="btn btn--ghost"
          onClick={submitDish}
          disabled={!newDish.trim()}
        >
          + Add dish
        </button>
      </div>
    </div>
  );
}

// ── One dish row (inline rename + reorder + delete) ───────────────────────────
function DishRow({
  dish,
  isFirst,
  isLast,
  onRename,
  onDelete,
  onMove,
}: {
  dish: MenuDishRow;
  isFirst: boolean;
  isLast: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [name, setName] = useState(dish.name);

  function commit() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== dish.name) onRename(trimmed);
    else setName(dish.name);
  }

  return (
    <li
      style={{
        display: "flex",
        gap: "0.4em",
        alignItems: "center",
        padding: "0.3em 0",
      }}
    >
      <input
        className="input"
        value={name}
        aria-label="Dish name"
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        style={{ flex: 1 }}
      />
      <button
        className="btn btn--ghost btn--sm"
        title="Move dish up"
        onClick={() => onMove(-1)}
        disabled={isFirst}
      >
        ↑
      </button>
      <button
        className="btn btn--ghost btn--sm"
        title="Move dish down"
        onClick={() => onMove(1)}
        disabled={isLast}
      >
        ↓
      </button>
      <button
        className="btn btn--danger btn--sm"
        title="Delete dish"
        onClick={onDelete}
      >
        ✕
      </button>
    </li>
  );
}
