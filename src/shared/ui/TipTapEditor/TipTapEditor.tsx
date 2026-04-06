"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  className
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-1.5 rounded-md transition-all hover:bg-gray-100 flex items-center justify-center",
      isActive ? "bg-gray-100 text-primary" : "text-gray-500",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

export const TipTapEditor = ({ value, onChange, placeholder = "Start typing description..." }: TipTapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] px-4 py-3 text-sm font-medium text-gray-700",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-xl bg-white overflow-hidden focus-within:border-primary transition-all duration-200">
      <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-50/50 border-b">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive("bold")}
        >
          <Bold className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive("italic")}
        >
          <Italic className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive("underline")}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </MenuButton>
        
        <div className="w-px h-4 bg-gray-200 mx-1" />
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </MenuButton>
        
        <div className="w-px h-4 bg-gray-200 mx-1" />
        
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive("bulletList")}
        >
          <List className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          isActive={editor.isActive("blockquote")}
        >
          <Quote className="w-3.5 h-3.5" />
        </MenuButton>
        
        <div className="w-px h-4 bg-gray-200 mx-1" />
        
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign("left").run()} 
          isActive={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign("center").run()} 
          isActive={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().setTextAlign("right").run()} 
          isActive={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </MenuButton>
        
        <div className="flex-1" />
        
        <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-3.5 h-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-3.5 h-3.5" />
        </MenuButton>
      </div>
      
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .prose ul, .prose ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .prose li {
          margin-bottom: 0.25rem;
        }
        .prose blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};
