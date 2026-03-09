// announcement.js — loaded globally from views.js
// Reads meta.json for an optional announcement object.
// If the announcement id hasn't been seen, shows a modal.
// Once closed, stores the id in localStorage so it never shows again.

(async () => {
    let meta;
    try {
        const r = await fetch("./app/meta.json");
        meta = await r.json();
    } catch {
        return;
    }

    const ann = meta.announcement;
    if (!ann || !ann.id) return;

    const seenKey = "announcement_seen";
    if (localStorage.getItem(seenKey) === ann.id) return;

    // Build the body content — one <p> per line
    const textWrap = document.createElement("div");
    textWrap.className = "modal-text";
    const lines = Array.isArray(ann.body) ? ann.body : [ann.body];
    lines.forEach(line => {
        const p = document.createElement("p");
        p.textContent = line;
        textWrap.appendChild(p);
    });

    window.showModal({
        tag:        ann.tag   || "Dispatch",
        title:      ann.title || undefined,
        image:      ann.image || undefined,
        content:    textWrap,
        closeLabel: "Acknowledged",
        onClose:    () => localStorage.setItem(seenKey, ann.id),
    });
})();