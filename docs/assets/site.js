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

  markActiveNav();
  attachCopyButtons();
  setupReveal();
  setYear();
})();
