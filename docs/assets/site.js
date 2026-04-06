(function () {
  const page = document.body?.dataset?.page || "";

  function markActiveNav() {
    const links = document.querySelectorAll("[data-nav]");
    links.forEach((link) => {
      const target = link.getAttribute("data-nav");
      if (!target) return;
      const isActive = target === page;
      link.classList.toggle("active", isActive);
      link.classList.toggle("current", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function attachCopyButtons() {
    const codeBlocks = document.querySelectorAll("pre > code");
    codeBlocks.forEach((code) => {
      const pre = code.parentElement;
      if (!pre || pre.querySelector(".copy-btn")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-btn";
      button.textContent = "Copy";

      button.addEventListener("click", async () => {
        const text = code.textContent || "";
        if (!text.trim()) return;

        try {
          await navigator.clipboard.writeText(text);
          button.textContent = "Copied";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 1200);
        } catch {
          button.textContent = "Failed";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 1200);
        }
      });

      pre.appendChild(button);
    });
  }

  function setupReveal() {
    const nodes = Array.from(document.querySelectorAll(".reveal"));
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.08,
      },
    );

    nodes.forEach((node) => observer.observe(node));
  }

  function setYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-role="year"]').forEach((node) => {
      node.textContent = year;
    });
  }

  function renderExamplesExportIndex() {
    const containers = document.querySelectorAll("[data-examples-export-index]");
    if (!containers.length) return;

    const manifest = window.OPEN_PLANT_EXAMPLES_EXPORT_INDEX;
    if (!manifest || !Array.isArray(manifest.groups)) return;

    containers.forEach((container) => {
      const lang = container.getAttribute("data-examples-export-index") === "ko" ? "ko" : "en";
      const labels =
        lang === "ko"
          ? { export: "Export", kind: "분류", source: "Source", start: "시작 섹션" }
          : { export: "Export", kind: "Kind", source: "Source", start: "Start Here" };

      container.innerHTML = "";

      manifest.groups.forEach((group) => {
        const title = group?.title?.[lang] || group?.title?.en;
        const rows = Array.isArray(group?.rows) ? group.rows : [];
        if (!title || rows.length === 0) return;

        const heading = document.createElement("h3");
        heading.textContent = title;
        container.appendChild(heading);

        const wrapper = document.createElement("div");
        wrapper.style.overflowX = "auto";

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        [labels.export, labels.kind, labels.source, labels.start].forEach((label) => {
          const th = document.createElement("th");
          th.textContent = label;
          headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        rows.forEach((row) => {
          const tr = document.createElement("tr");

          const exportCell = document.createElement("td");
          const exportCode = document.createElement("code");
          exportCode.textContent = row.name || "";
          exportCell.appendChild(exportCode);
          tr.appendChild(exportCell);

          const kindCell = document.createElement("td");
          const kindCode = document.createElement("code");
          kindCode.textContent = row.kind || "";
          kindCell.appendChild(kindCode);
          tr.appendChild(kindCell);

          const sourceCell = document.createElement("td");
          const sourceCode = document.createElement("code");
          sourceCode.textContent = row.source || "";
          sourceCell.appendChild(sourceCode);
          tr.appendChild(sourceCell);

          const sectionCell = document.createElement("td");
          const href = row?.section?.href || "#composition";
          const label = row?.section?.[lang] || row?.section?.en || href;
          const link = document.createElement("a");
          link.href = href;
          link.textContent = label;
          sectionCell.appendChild(link);
          tr.appendChild(sectionCell);

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        wrapper.appendChild(table);
        container.appendChild(wrapper);
      });
    });
  }

  markActiveNav();
  attachCopyButtons();
  setupReveal();
  setYear();
  renderExamplesExportIndex();
})();
