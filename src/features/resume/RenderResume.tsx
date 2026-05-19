import type { ResumeCreateProps } from "@/types/resumeType";
import React, { useEffect, useRef, useState } from "react";
import Template1 from "./resumeTemplate/template-1";
import Template2 from "./resumeTemplate/template-2";
import Template3 from "./resumeTemplate/template-3";

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
type Props = {
  resume: ResumeCreateProps;
  templateId: number;
};

type TemplateComponent = React.FC<{ resume: ResumeCreateProps }>;

const templateMap: Record<number, TemplateComponent> = {
  1: Template1 as TemplateComponent,
  2: Template2 as TemplateComponent,
  3: Template3 as TemplateComponent,
};

const RenderResume = ({ resume, templateId }: Props) => {
  const [zoom, setZoom] = useState(1);
  const [autoZoom, setAutoZoom] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);
  const Template = templateMap[templateId] || Template1;
  const resumeFileUrl = resume.resume_file?.trim() ?? "";
  const hasResumeFile = Boolean(resumeFileUrl);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startScrollLeft: el.scrollLeft,
        startScrollTop: el.scrollTop,
      };
      el.classList.add("cursor-grabbing");
      (el as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      e.preventDefault();
      el.scrollLeft = d.startScrollLeft + (d.startX - e.clientX);
      el.scrollTop = d.startScrollTop + (d.startY - e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return;
      el.classList.remove("cursor-grabbing");
      (el as HTMLElement).releasePointerCapture?.(e.pointerId);
      dragRef.current = null;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Ctrl/Meta + wheel → zoom (trackpad pinch; browsers set ctrlKey for pinch)
      if (e.ctrlKey || e.metaKey) {
        setAutoZoom(false);
        const delta = -e.deltaY * 0.01;
        setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
        return;
      }

      // Option/Alt + wheel → horizontal scroll
      if (e.altKey) {
        el.scrollLeft += e.deltaY;
        return;
      }

      // Mouse scroll wheel (deltaMode LINE/PAGE) → zoom; trackpad pan (deltaMode PIXEL) → move
      const isLikelyMouseWheel = e.deltaMode !== 0; // 0 = PIXEL (trackpad), 1 = LINE, 2 = PAGE (mouse)
      if (isLikelyMouseWheel) {
        setAutoZoom(false);
        const delta = -e.deltaY * 0.01;
        setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
      } else {
        el.scrollLeft += e.deltaX;
        el.scrollTop += e.deltaY;
      }
    };

    // Safari gesture events for trackpad pinch
    const onGestureChange = (e: Event) => {
      const gestureEvent = e as unknown as { scale?: number };
      const scale = gestureEvent.scale;
      if (typeof scale !== "number") return;
      e.preventDefault();
      setAutoZoom(false);
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * scale)));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturechange", onGestureChange, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("gesturechange", onGestureChange);
    };
  }, []);

  useEffect(() => {
    if (!autoZoom) return;
    const el = containerRef.current;
    if (!el) return;

    const updateZoom = () => {
      const width = el.clientWidth || A4_WIDTH;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, width / A4_WIDTH));
      setZoom(next);
    };

    updateZoom();
    const observer = new ResizeObserver(updateZoom);
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoZoom]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const updatePages = () => {
      const height = el.scrollHeight || A4_HEIGHT;
      setPageCount(Math.max(1, Math.ceil(height / A4_HEIGHT)));
    };

    updatePages();
    const observer = new ResizeObserver(updatePages);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full aspect-794/1123">
      <div
        ref={containerRef}
        className="absolute inset-0 select-none overflow-auto overscroll-contain touch-pan-x touch-pan-y cursor-grab bg-neutral-50 border border-neutral-200 rounded-lg p-0"
      >
        {hasResumeFile ? (
          <div className="h-full w-full bg-white">
            <iframe
              title="Imported resume file"
              src={resumeFileUrl}
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          <div className="flex min-h-full w-full items-start justify-start">
            <div
              className="origin-top-left"
              style={{ transform: `scale(${zoom})` }}
            >
              <div
                className="relative"
                style={{ width: A4_WIDTH, minHeight: pageCount * A4_HEIGHT }}
              >
                {pageCount > 1 && (
                  <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
                    {Array.from({ length: pageCount - 1 }).map((_, idx) => (
                      <div
                        key={`page-break-${idx + 1}`}
                        style={{
                          position: "absolute",
                          top: (idx + 1) * A4_HEIGHT,
                          left: 0,
                          right: 0,
                          borderTop: "1px dashed var(--color-c-e5e7eb)",
                        }}
                      />
                    ))}
                  </div>
                )}
                <div
                  ref={contentRef}
                  style={{
                    width: A4_WIDTH,
                    minHeight: A4_HEIGHT,
                    boxSizing: "border-box",
                  }}
                >
                  <Template resume={resume} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setAutoZoom(true)}
        className="absolute bottom-3 right-3 z-10 rounded-full border border-neutral-200 bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur hover:bg-white"
      >
        Reset zoom
      </button>
    </div>
  );
};

export default RenderResume;
