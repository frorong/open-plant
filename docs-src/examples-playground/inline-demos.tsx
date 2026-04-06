import { useEffect, useMemo, useRef, useState } from "react";
import type { PlaygroundLanguage } from "./playground-app";
import {
  getStackBlitzProject,
  type StackBlitzProjectDefinition,
} from "./stackblitz-projects";

declare global {
  interface Window {
    StackBlitzSDK?: {
      embedProject: (
        elementOrId: string | HTMLElement,
        project: StackBlitzProjectDefinition,
        options?: {
          clickToLoad?: boolean;
          height?: number;
          hideExplorer?: boolean;
          hideNavigation?: boolean;
          openFile?: string | string[];
          showSidebar?: boolean;
          terminalHeight?: number;
          theme?: "default" | "light" | "dark";
          view?: "default" | "preview" | "editor";
        },
      ) => Promise<unknown>;
      openProject?: (
        project: StackBlitzProjectDefinition,
        options?: {
          newWindow?: boolean;
          openFile?: string | string[];
          showSidebar?: boolean;
          theme?: "default" | "light" | "dark";
          view?: "default" | "preview" | "editor";
        },
      ) => Promise<unknown>;
    };
  }
}

interface InlineText {
  stackblitzPreview: string;
  openInStackBlitz: string;
  loadPreview: string;
  loadingPreview: string;
  previewUnavailable: string;
  stackblitzReady: string;
  sectionComposition: string;
  sectionSource: string;
  sectionPoints: string;
  sectionDraw: string;
  sectionHeatmap: string;
  sectionClip: string;
  sectionHitIndex: string;
  sectionGeometry: string;
  sectionUtils: string;
  sectionLowLevel: string;
}

const INLINE_TEXT: Record<PlaygroundLanguage, InlineText> = {
  en: {
    stackblitzPreview: "StackBlitz Preview",
    openInStackBlitz: "Open in StackBlitz",
    loadPreview: "Load Preview",
    loadingPreview: "Loading StackBlitz preview...",
    previewUnavailable: "StackBlitz preview could not be loaded in this page.",
    stackblitzReady:
      "Each example follows the API tree used by the reference app. Open the full editor to inspect the runnable source.",
    sectionComposition: "WsiViewer composition",
    sectionSource: "Image source utilities",
    sectionPoints: "PointLayer",
    sectionDraw: "DrawingLayer / RegionLayer / PatchLayer / OverlayLayer",
    sectionHeatmap: "HeatmapLayer / OverviewMap / useViewerContext",
    sectionClip: "ROI clip APIs",
    sectionHitIndex: "Point hit index APIs",
    sectionGeometry: "Geometry / WKT / ROI stats",
    sectionUtils: "Core utility helpers",
    sectionLowLevel: "Low-level renderer APIs",
  },
  ko: {
    stackblitzPreview: "StackBlitz Preview",
    openInStackBlitz: "StackBlitz에서 열기",
    loadPreview: "Preview 로드",
    loadingPreview: "StackBlitz preview를 불러오는 중입니다...",
    previewUnavailable: "이 페이지에서 StackBlitz preview를 불러오지 못했습니다.",
    stackblitzReady:
      "각 예제는 reference app의 API 트리를 따라 구성했습니다. 전체 소스는 위 버튼으로 열어 확인하세요.",
    sectionComposition: "WsiViewer 조합 루트",
    sectionSource: "Image source 유틸리티",
    sectionPoints: "PointLayer",
    sectionDraw: "DrawingLayer / RegionLayer / PatchLayer / OverlayLayer",
    sectionHeatmap: "HeatmapLayer / OverviewMap / useViewerContext",
    sectionClip: "ROI clip API",
    sectionHitIndex: "Point hit index API",
    sectionGeometry: "Geometry / WKT / ROI 통계",
    sectionUtils: "Core utility helper",
    sectionLowLevel: "Low-level renderer API",
  },
};

const STACKBLITZ_META: Record<
  string,
  {
    height: number;
    openFile: string;
  }
> = {
  composition: { height: 780, openFile: "src/App.jsx,src/demoData.js" },
  source: { height: 560, openFile: "src/App.jsx,src/demoData.js" },
  points: { height: 720, openFile: "src/App.jsx,src/demoData.js" },
  draw: { height: 780, openFile: "src/App.jsx,src/demoData.js" },
  heatmap: { height: 760, openFile: "src/App.jsx,src/demoData.js" },
  clip: { height: 760, openFile: "src/App.jsx,src/demoData.js" },
  "hit-index": { height: 720, openFile: "src/App.jsx,src/demoData.js" },
  geometry: { height: 520, openFile: "src/App.jsx,src/demoData.js" },
  utils: { height: 520, openFile: "src/App.jsx,src/demoData.js" },
  "low-level": { height: 760, openFile: "src/App.jsx,src/demoData.js" },
};

function StackBlitzSectionDemo({
  demo,
  title,
  messages,
}: {
  demo: keyof typeof STACKBLITZ_META;
  title: string;
  messages: InlineText;
}): React.ReactElement {
  const project = useMemo(() => getStackBlitzProject(demo), [demo]);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState<boolean>(() => {
    if (typeof window === "undefined") return demo === "composition";
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) return hash === demo;
    return demo === "composition";
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    shouldLoad ? "loading" : "idle",
  );
  const meta = STACKBLITZ_META[demo];

  useEffect(() => {
    const syncFromHash = (): void => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === demo) {
        setShouldLoad(true);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [demo]);

  useEffect(() => {
    const host = hostRef.current;
    const sdk = window.StackBlitzSDK;
    console.error("[open-plant/examples] stackblitz effect", {
      demo,
      hasHost: Boolean(host),
      hasProject: Boolean(project),
      hasSdk: Boolean(sdk),
      meta,
    });
    if (!host || !project || !shouldLoad) return;

    if (!sdk?.embedProject) {
      console.error("[open-plant/examples] StackBlitz SDK missing", { demo });
      setStatus("error");
      setError(messages.previewUnavailable);
      return;
    }

    host.replaceChildren();
    setError("");
    setStatus("loading");
    console.error("[open-plant/examples] embedding StackBlitz project", {
      demo,
      title: project.title,
      height: meta.height,
      openFile: meta.openFile,
    });

    const inspectDelay500 = window.setTimeout(() => {
      console.error("[open-plant/examples] stackblitz host snapshot", {
        demo,
        stage: "500ms",
        childCount: host.childElementCount,
        iframeCount: host.querySelectorAll("iframe").length,
        html: host.innerHTML.slice(0, 200),
      });
    }, 500);

    const inspectDelay3000 = window.setTimeout(() => {
      console.error("[open-plant/examples] stackblitz host snapshot", {
        demo,
        stage: "3000ms",
        childCount: host.childElementCount,
        iframeCount: host.querySelectorAll("iframe").length,
        html: host.innerHTML.slice(0, 200),
      });
    }, 3000);

    const timeoutId = window.setTimeout(() => {
      const iframeCount = host.querySelectorAll("iframe").length;
      if (iframeCount > 0) return;
      console.error("[open-plant/examples] StackBlitz iframe timeout", { demo });
      setStatus("error");
      setError(`${messages.previewUnavailable}\nNo iframe was inserted into the host.`);
    }, 8000);

    void sdk
      .embedProject(host, project, {
        clickToLoad: false,
        height: meta.height,
        hideExplorer: true,
        hideNavigation: true,
        openFile: meta.openFile,
        showSidebar: false,
        terminalHeight: 0,
        theme: "light",
        view: "preview",
      })
      .then(() => {
        console.error("[open-plant/examples] StackBlitz embed ready", { demo });
        setStatus("ready");
      })
      .catch((embedError) => {
        console.error("[open-plant/examples] StackBlitz embed failed", {
          demo,
          embedError,
        });
        setStatus("error");
        setError(
          `${messages.previewUnavailable}\n${String(
            embedError instanceof Error ? embedError.message : embedError,
          )}`,
        );
      });

    return () => {
      window.clearTimeout(inspectDelay500);
      window.clearTimeout(inspectDelay3000);
      window.clearTimeout(timeoutId);
    };
  }, [
    demo,
    messages.previewUnavailable,
    meta.height,
    meta.openFile,
    project,
    shouldLoad,
  ]);

  return (
    <div className="examples-inline-demo examples-inline-demo-stackblitz">
      <div className="examples-inline-demo-head">
        <strong>{messages.stackblitzPreview}</strong>
        <h3>{title}</h3>
      </div>
      <div className="examples-inline-demo-actions">
        {!shouldLoad ? (
          <button
            type="button"
            onClick={() => {
              console.error("[open-plant/examples] load preview clicked", { demo });
              setShouldLoad(true);
            }}
          >
            {messages.loadPreview}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            console.error("[open-plant/examples] open in StackBlitz clicked", { demo });
            if (project && window.StackBlitzSDK?.openProject) {
              void window.StackBlitzSDK.openProject(project, {
                newWindow: true,
                openFile: meta.openFile,
                showSidebar: false,
                theme: "light",
              });
              return;
            }
            window.open("https://stackblitz.com/", "_blank", "noopener,noreferrer");
          }}
        >
          {messages.openInStackBlitz}
        </button>
      </div>
      <div
        className="examples-inline-demo-stackblitz-frame"
        style={
          {
            "--examples-stackblitz-height": `${meta.height}px`,
          } as React.CSSProperties
        }
      >
        <div ref={hostRef} className="examples-inline-demo-stackblitz-host" />
        {status === "idle" || status === "loading" ? (
          <div className="examples-inline-demo-stackblitz-overlay">
            {status === "idle" ? messages.loadPreview : messages.loadingPreview}
          </div>
        ) : null}
      </div>
      <div className="examples-inline-demo-output">
        <strong>Output</strong>
        <pre>
          {error
            || (status === "idle"
              ? `${messages.stackblitzReady}\n${messages.loadPreview} to start this section.`
              : status === "loading"
                ? messages.loadingPreview
                : messages.stackblitzReady)}
        </pre>
      </div>
    </div>
  );
}

export function InlineExamplesDemo({
  lang,
  demo,
}: {
  lang: PlaygroundLanguage;
  demo: string;
}): React.ReactElement | null {
  const messages = INLINE_TEXT[lang];
  console.error("[open-plant/examples] render InlineExamplesDemo", { demo, lang });

  switch (demo) {
    case "composition":
      return (
        <StackBlitzSectionDemo
          demo="composition"
          title={messages.sectionComposition}
          messages={messages}
        />
      );
    case "source":
      return (
        <StackBlitzSectionDemo
          demo="source"
          title={messages.sectionSource}
          messages={messages}
        />
      );
    case "points":
      return (
        <StackBlitzSectionDemo
          demo="points"
          title={messages.sectionPoints}
          messages={messages}
        />
      );
    case "draw":
      return (
        <StackBlitzSectionDemo
          demo="draw"
          title={messages.sectionDraw}
          messages={messages}
        />
      );
    case "heatmap":
      return (
        <StackBlitzSectionDemo
          demo="heatmap"
          title={messages.sectionHeatmap}
          messages={messages}
        />
      );
    case "clip":
      return (
        <StackBlitzSectionDemo
          demo="clip"
          title={messages.sectionClip}
          messages={messages}
        />
      );
    case "hit-index":
      return (
        <StackBlitzSectionDemo
          demo="hit-index"
          title={messages.sectionHitIndex}
          messages={messages}
        />
      );
    case "geometry":
      return (
        <StackBlitzSectionDemo
          demo="geometry"
          title={messages.sectionGeometry}
          messages={messages}
        />
      );
    case "utils":
      return (
        <StackBlitzSectionDemo
          demo="utils"
          title={messages.sectionUtils}
          messages={messages}
        />
      );
    case "low-level":
      return (
        <StackBlitzSectionDemo
          demo="low-level"
          title={messages.sectionLowLevel}
          messages={messages}
        />
      );
    default:
      return null;
  }
}
