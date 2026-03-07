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

    // Build overlay
    const overlay = document.createElement("div");
    overlay.id = "announcement-overlay";

    const modal = document.createElement("div");
    modal.id = "announcement-modal";

    // Top tag
    const tag = document.createElement("div");
    tag.id = "announcement-tag";
    tag.textContent = ann.tag || "Dispatch";
    modal.appendChild(tag);

    // Optional image
    if (ann.image) {
        const img = document.createElement("img");
        img.id = "announcement-img";
        img.src = ann.image;
        img.alt = ann.title || "";
        modal.appendChild(img);
    }

    // Body
    const bodyWrap = document.createElement("div");
    bodyWrap.id = "announcement-body-wrap";

    if (ann.title) {
        const title = document.createElement("h2");
        title.id = "announcement-title";
        title.textContent = ann.title;
        bodyWrap.appendChild(title);
    }

    if (ann.body) {
        const wrap = document.createElement("div");
        wrap.id = "announcement-text";
        // body can be a string or an array of strings (one item per line/bullet)
        const lines = Array.isArray(ann.body) ? ann.body : [ann.body];
        lines.forEach(line => {
            const p = document.createElement("p");
            p.textContent = line;
            wrap.appendChild(p);
        });
        bodyWrap.appendChild(wrap);
    }

    const closeBtn = document.createElement("button");
    closeBtn.id = "announcement-close";
    closeBtn.textContent = "Acknowledged";
    bodyWrap.appendChild(closeBtn);

    modal.appendChild(bodyWrap);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function dismiss() {
        localStorage.setItem(seenKey, ann.id);
        overlay.remove();
    }

    closeBtn.addEventListener("click", dismiss);
    // Clicking the backdrop also dismisses
    overlay.addEventListener("click", e => {
        if (e.target === overlay) dismiss();
    });
})();