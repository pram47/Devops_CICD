"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import type { RtfQuillProps } from "@/types/ui";
import "quill/dist/quill.snow.css";

export default function RtfQuill({
  value,
  onChange,
  className,
}: RtfQuillProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link"],
          ["clean"],
        ],
      },
    });

    quillRef.current = quill;

    quill.on("text-change", () => {
      onChange?.(quill.root.innerHTML);
    });
  }, [onChange]);

  useEffect(() => {
    if (!quillRef.current || value === undefined) return;
    const current = quillRef.current.root.innerHTML;
    if (value !== current) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  return <div ref={editorRef} className={className} />;
}
