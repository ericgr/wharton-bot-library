import { forwardRef, useImperativeHandle, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    ["bold", "italic", "underline"],
    ["link"],
    [{ "color": [] }],
    [{ "size": ["small", false, "large"] }],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "bold", "italic", "underline", "link", "color", "size"
];

export const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const quillRef = useRef<ReactQuill>(null);

    useImperativeHandle(ref, () => quillRef.current!);

    const handleChange = (content: string) => {
      // Process the content to make all links open in new tabs
      const processedContent = content.replace(
        /<a\s+href=/g, 
        '<a target="_blank" rel="noopener noreferrer" href='
      );
      onChange(processedContent);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Prevent form submission on Enter key in rich text editor
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    return (
      <div className={cn("rich-text-editor", className)} onKeyDown={handleKeyDown}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <style>{`
          .ql-toolbar {
            border-top: 1px solid hsl(var(--border));
            border-left: 1px solid hsl(var(--border));
            border-right: 1px solid hsl(var(--border));
            border-radius: var(--radius) var(--radius) 0 0;
            background: hsl(var(--muted));
          }
          .ql-container {
            border-bottom: 1px solid hsl(var(--border));
            border-left: 1px solid hsl(var(--border));
            border-right: 1px solid hsl(var(--border));
            border-radius: 0 0 var(--radius) var(--radius);
            font-family: inherit;
          }
          .ql-editor {
            min-height: 60px;
            color: hsl(var(--foreground));
          }
          .ql-editor.ql-blank::before {
            color: hsl(var(--muted-foreground));
          }
          .ql-tooltip {
            z-index: 9999;
          }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";