/* ============================================================
   Shared column sorting — every table in Studio, one behaviour.

   使用者裁示 2026-07-27：「for all tables in the system when we click a
   table column title, the table should have the sort feature.」

   The three-state cycle (exactly as specified):
     1st click → high to low  ·  A to Z
     2nd click → low to high  ·  Z to A
     3rd click → back to the table's default order

   Direction on the FIRST click depends on what the column holds:
   numbers open descending (the biggest number is the interesting one),
   text opens ascending (A first). Both are "most useful first".

   The caret shown is NOT the mathematical direction — it is how the
   column reads downward: ▼ = A→Z and high→low (first click), ▲ = the
   reverse (second click). A text and a numeric column therefore both
   show ▼ on their first click. See sortable.css for the rules.

   ── Markup contract ────────────────────────────────────────────
   Real tables — <table class="ztor-table"> with a <thead>:
     <th data-sort>Reputation</th>            ← auto-detects type
     <th data-sort="text">Country</th>        ← or state it
     <th>#</th>                               ← no data-sort = not sortable
   Rows are `tbody > tr`. A `.ztor-table__detail` expansion row is NOT a
   row of its own — it travels welded to the row above it.

   Grid tables — a `.table-head` whose grid-template-columns matches its
   rows, inside a container marked `data-sort-table`:
     <div data-sort-table>
       <div class="table-head"><span data-sort="num" data-sort-key="rep">Reputation</span>…</div>
       <div class="data-list">
         <div class="data-list__row"><span data-sort-key="rep">874</span>…</div>

   Grid rows match a head cell by `data-sort-key`, never by position —
   grid rows routinely carry more cells than the head has titles.

   ── Value resolution, in order ─────────────────────────────────
   1. `data-sort-value` on the cell        ← authoritative; use it for
      anything whose visible text does not sort correctly (tier names,
      status words, dates rendered as "2h ago")
   2. the cell's text, parsed as a number  ← "$1,420" / "92%" / "1,283"
   3. the cell's text, compared with Intl.Collator (zh-Hant aware)

   Opt out of auto-attachment with `data-no-sort` on the table.
   ============================================================ */
(function () {
  "use strict";

  /* numeric:true so "Fan 2" sorts before "Fan 10"; base sensitivity so
     case and accents don't split otherwise-equal names. */
  var COLLATOR = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

  var CARET_UP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="ztor-icon" data-caret="CARET" aria-hidden="true"><path d="M6 15l6 -6l6 6"/></svg>';
  var CARET_DOWN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="ztor-icon" data-caret="CARET" aria-hidden="true"><path d="M6 9l6 6l6 -6"/></svg>';

  /* ── Value helpers ──────────────────────────────────────────── */

  /* Strip presentation off a number: currency, thousands separators,
     percent signs, the ↗ trend arrow, whitespace. Returns null when
     what's left isn't a number, which is how type detection works. */
  function toNumber(text) {
    if (text == null) return null;
    var cleaned = String(text)
      .replace(/[\s ,]/g, "")
      .replace(/[^\d.+-]/g, "");
    if (cleaned === "" || cleaned === "-" || cleaned === "+" || cleaned === ".") return null;
    var n = parseFloat(cleaned);
    return isFinite(n) ? n : null;
  }

  function cellText(cell) {
    if (!cell) return "";
    if (cell.hasAttribute && cell.hasAttribute("data-sort-value")) {
      return cell.getAttribute("data-sort-value");
    }
    return (cell.textContent || "").trim();
  }

  /* ── Adapters — the only place the two table families differ ── */

  function tableAdapter(table) {
    var body = table.tBodies[0];
    if (!body) return null;
    return {
      root: table,
      heads: Array.prototype.slice.call(table.querySelectorAll("thead th")),
      container: body,
      /* A unit = one logical row. An expandable row owns the detail row
         that follows it, so the pair moves together and a sorted table
         never orphans a detail panel under someone else's row. */
      units: function () {
        var out = [];
        Array.prototype.forEach.call(body.children, function (el) {
          if (el.classList.contains("ztor-table__detail") && out.length) {
            out[out.length - 1].nodes.push(el);
          } else {
            out.push({ lead: el, nodes: [el] });
          }
        });
        return out;
      },
      cellFor: function (unit, head, index) {
        var key = head.getAttribute("data-sort-key");
        if (key) return unit.lead.querySelector('[data-sort-key="' + key + '"]') || unit.lead;
        return unit.lead.children[index] || null;
      }
    };
  }

  function gridAdapter(root) {
    var head = root.querySelector(".table-head");
    var list = root.querySelector("[data-sort-rows]") || root.querySelector(".data-list");
    if (!head || !list) return null;
    return {
      root: root,
      heads: Array.prototype.slice.call(head.children),
      container: list,
      units: function () {
        return Array.prototype.map.call(list.children, function (el) {
          return { lead: el, nodes: [el] };
        });
      },
      cellFor: function (unit, head, index) {
        var key = head.getAttribute("data-sort-key");
        if (key) return unit.lead.querySelector('[data-sort-key="' + key + '"]');
        return unit.lead.children[index] || null;
      }
    };
  }

  /* ── Wiring ─────────────────────────────────────────────────── */

  function init(adapter) {
    if (!adapter || adapter.root.hasAttribute("data-sort-ready")) return;
    adapter.root.setAttribute("data-sort-ready", "");

    /* Freeze the default order once, at mount, before anything can
       reorder the DOM. The third click restores exactly this. */
    adapter.units().forEach(function (unit, i) {
      unit.nodes.forEach(function (n) { n.setAttribute("data-sort-home", i); });
    });

    var buttons = [];

    adapter.heads.forEach(function (head, index) {
      if (!head.hasAttribute("data-sort")) return;

      var declared = (head.getAttribute("data-sort") || "").toLowerCase();
      /* Auto-detect from the first row that actually carries a value —
         an empty leading cell must not retype a numeric column as text. */
      var type = declared === "num" || declared === "text" ? declared : detectType(adapter, head, index);

      var label = head.innerHTML;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sort-th";
      if (head.classList.contains("table-head__end") || head.classList.contains("sort-th--end")) {
        btn.classList.add("sort-th--end");
      }
      btn.setAttribute("data-sort-state", "none");
      /* The direction the first click produces — drives both the ghost
         caret and the cycle below. */
      btn.setAttribute("data-sort-first", type === "num" ? "desc" : "asc");
      /* Two carets, and they do NOT mean ascending/descending — they mean
         "which way does the column read from here down" (使用者裁示
         2026-07-27). Down = A→Z and high→low, i.e. always the first click,
         whatever the column holds. Up = the reverse, the second click.
         CSS picks between them from data-sort-state × data-sort-first. */
      btn.innerHTML = '<span class="sort-th__label">' + label + "</span>" +
        '<span class="sort-th__ind">' +
          CARET_DOWN.replace("CARET", "down") +
          CARET_UP.replace("CARET", "up") +
        "</span>";
      head.innerHTML = "";
      head.appendChild(btn);
      head.setAttribute("aria-sort", "none");

      /* i18n.js re-renders a translated element by writing innerHTML. If the
         key stayed on the header cell, the first language switch would wipe
         the button (carets, handler and all) and silently kill sorting for
         the rest of the session. Move the key down onto the label span so a
         switch repaints only the words. */
      ["data-i18n", "data-i18n-title", "data-i18n-aria-label"].forEach(function (attr) {
        if (!head.hasAttribute(attr)) return;
        var target = attr === "data-i18n" ? btn.querySelector(".sort-th__label") : btn;
        target.setAttribute(attr, head.getAttribute(attr));
        head.removeAttribute(attr);
      });

      btn.addEventListener("click", function () {
        var state = btn.getAttribute("data-sort-state");
        var first = btn.getAttribute("data-sort-first");
        var next;
        if (state === "none") next = first;                                  // 1st
        else if (state === first) next = first === "desc" ? "asc" : "desc";  // 2nd
        else next = "none";                                                  // 3rd — home

        buttons.forEach(function (other) {
          if (other === btn) return;
          other.setAttribute("data-sort-state", "none");
          other.parentElement.setAttribute("aria-sort", "none");
        });
        btn.setAttribute("data-sort-state", next);
        head.setAttribute("aria-sort", next === "none" ? "none" : (next === "asc" ? "ascending" : "descending"));

        apply(adapter, head, index, type, next);
      });

      buttons.push(btn);
    });
  }

  function detectType(adapter, head, index) {
    var units = adapter.units();
    for (var i = 0; i < units.length; i++) {
      var text = cellText(adapter.cellFor(units[i], head, index));
      if (text === "" || text === "—") continue;
      return toNumber(text) === null ? "text" : "num";
    }
    return "text";
  }

  function apply(adapter, head, index, type, state) {
    var units = adapter.units();

    if (state === "none") {
      units.sort(function (a, b) {
        return (+a.lead.getAttribute("data-sort-home")) - (+b.lead.getAttribute("data-sort-home"));
      });
    } else {
      var dir = state === "asc" ? 1 : -1;
      units.sort(function (a, b) {
        var ta = cellText(adapter.cellFor(a, head, index));
        var tb = cellText(adapter.cellFor(b, head, index));
        if (type === "num") {
          var na = toNumber(ta);
          var nb = toNumber(tb);
          /* Blanks and em-dashes always sink, in both directions —
             an empty cell is never "the biggest" or "the smallest". */
          if (na === null && nb === null) return 0;
          if (na === null) return 1;
          if (nb === null) return -1;
          return (na - nb) * dir;
        }
        if (ta === "" && tb === "") return 0;
        if (ta === "") return 1;
        if (tb === "") return -1;
        return COLLATOR.compare(ta, tb) * dir;
      });
    }

    /* One reflow: build the new order in a fragment, then swap it in. */
    var frag = document.createDocumentFragment();
    units.forEach(function (unit) {
      unit.nodes.forEach(function (n) { frag.appendChild(n); });
    });
    adapter.container.appendChild(frag);

    /* Pages that paginate or filter their own rows (fans leaderboard,
       orders, …) re-read DOM order when they see this. */
    adapter.root.dispatchEvent(new CustomEvent("ztor:sorted", {
      bubbles: true,
      detail: { key: head.getAttribute("data-sort-key") || index, state: state }
    }));
  }

  /* ── Auto-attach ────────────────────────────────────────────── */

  function scan(scope) {
    var root = scope || document;
    root.querySelectorAll("table.ztor-table:not([data-no-sort])").forEach(function (t) {
      if (t.querySelector("thead th[data-sort]")) init(tableAdapter(t));
    });
    root.querySelectorAll("[data-sort-table]:not([data-no-sort])").forEach(function (g) {
      init(gridAdapter(g));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { scan(); });
  } else {
    scan();
  }

  /* Tables injected later (modals, tab panels rendered on demand). */
  window.ztorTableSort = { scan: scan };
})();
