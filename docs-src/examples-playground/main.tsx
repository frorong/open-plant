import ReactDOM from "react-dom/client";
import type { PlaygroundLanguage } from "./playground-app";

declare global {
  interface Window {
    OPEN_PLANT_DOCS_EXAMPLES?: {
      version: string;
    };
  }
}

console.error("[open-plant/examples] bundle boot");

window.OPEN_PLANT_DOCS_EXAMPLES = {
  version: "1.4.10",
};

const containers = Array.from(
  document.querySelectorAll<HTMLElement>("[data-open-plant-inline-demo]"),
);

console.error("[open-plant/examples] placeholders found", {
  count: containers.length,
  stackblitzSdkLoaded: Boolean((window as Window & { StackBlitzSDK?: unknown }).StackBlitzSDK),
  demos: containers.map((container) => container.dataset.openPlantInlineDemo || ""),
});

void import("./inline-demos")
  .then(({ InlineExamplesDemo }) => {
    console.error("[open-plant/examples] inline-demos module loaded");
    containers.forEach((container) => {
      const demo = container.dataset.openPlantInlineDemo || "";
      const lang = container.dataset.openPlantInlineLang === "ko" ? "ko" : "en";
      console.error("[open-plant/examples] mounting demo", { demo, lang });
      try {
        ReactDOM.createRoot(container).render(
          <InlineExamplesDemo lang={lang as PlaygroundLanguage} demo={demo} />,
        );
      } catch (error) {
        console.error("[open-plant/examples] mount failed", { demo, lang, error });
      }
    });
  })
  .catch((error) => {
    console.error("[open-plant/examples] failed to load inline-demos module", error);
  });
