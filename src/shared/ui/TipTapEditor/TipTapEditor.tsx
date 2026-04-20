"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  // AlignCenter, 
  // AlignRight,
  // Heading1,
  // Heading2,
  Undo,
  Redo,
  // Quote,
  Link as LinkIcon,
  // Unlink,
  Code,
  Minus,
  Maximize2,
  Type,
  Eraser,
  Palette,
  Highlighter,
  ChevronDown,
  FileCode2,
  Columns
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minimal?: boolean;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  className,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  className?: string;
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-1.5 min-w-[32px] h-8 rounded-sm transition-all hover:bg-slate-100 flex items-center justify-center shrink-0 border border-transparent",
      isActive ? "bg-white text-primary border-slate-200 shadow-sm" : "text-slate-500",
      disabled && "opacity-30 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-slate-200 mx-1" />;

export const TipTapEditor = ({ value, onChange, placeholder = "Start typing description...", minimal = false }: TipTapEditorProps) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isNofollow, setIsNofollow] = useState(true);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer font-semibold",
          rel: "nofollow"
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 md:px-6 py-4 md:py-5 text-[13px] font-medium text-slate-600 leading-relaxed",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ 
      href: linkUrl, 
      rel: isNofollow ? "nofollow" : "dofollow" 
    }).run();

    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl, isNofollow]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5">
      {/* High-Fidelity Grouped Toolbar (Matching User Screenshot) */}
      <div className="flex flex-wrap items-center gap-0.5 p-1 bg-white border-b border-slate-50 overflow-x-auto no-scrollbar">
        {/* Basic Styling Group */}
        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
             <Bold className="w-3.5 h-3.5" />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
             <Italic className="w-3.5 h-3.5" />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
             <UnderlineIcon className="w-3.5 h-3.5" />
           </MenuButton>
        </div>

        <div className="hidden md:flex h-6 flex items-center"><ToolbarDivider /></div>

        {/* Dynamic & Formatting Group */}
        <div className={cn("items-center gap-0.5", minimal ? "hidden md:flex" : "flex")}>
           <MenuButton onClick={() => {}} title="Text Color (Static)">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
           </MenuButton>
           <MenuButton onClick={() => {}} title="Background Color (Static)">
              <Highlighter className="w-3.5 h-3.5 text-slate-400" />
           </MenuButton>
           
           <div className="flex items-center gap-1 px-1.5 py-1 mx-0.5 rounded-sm bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-[10px] font-bold text-slate-500 leading-none">11</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
           </div>

           <div className="flex items-center gap-2 px-1.5 py-1 rounded-sm bg-slate-50 border border-slate-100 cursor-pointer min-w-[40px]">
              <span className="text-[10px] font-bold text-slate-500 leading-none">H1</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-300 ml-auto" />
           </div>
        </div>

        <div className="hidden lg:flex h-6 items-center"><ToolbarDivider /></div>

        {/* Lists Group */}
        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Unordered List">
             <List className="w-3.5 h-3.5" />
             <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-slate-300" />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered List">
             <ListOrdered className="w-3.5 h-3.5" />
             <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-slate-300" />
           </MenuButton>
        </div>

        <ToolbarDivider />

        {/* Links & Separation Group */}
        <div className="flex items-center gap-0.5">
           <MenuButton 
             onClick={() => {
               const previousUrl = editor.getAttributes("link").href;
               setLinkUrl(previousUrl || "");
               setShowLinkInput(!showLinkInput);
             }} 
             isActive={editor.isActive("link")}
             title="Link"
           >
             <LinkIcon className="w-3.5 h-3.5" />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Code">
             <Code className="w-3.5 h-3.5" />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Format">
             <Eraser className="w-3.5 h-3.5" />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Line">
             <Minus className="w-3.5 h-3.5" />
           </MenuButton>
        </div>

        <div className="hidden md:flex h-6 flex items-center"><ToolbarDivider /></div>

        {/* Alignment Group */}
        <div className={cn("items-center gap-0.5", minimal ? "hidden md:flex" : "flex")}>
           <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Align Left">
             <AlignLeft className="w-3.5 h-3.5" />
             <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-slate-300" />
           </MenuButton>
        </div>

        <div className="hidden lg:flex h-6 items-center"><ToolbarDivider /></div>

        {/* View & Aux Group */}
        <div className={cn("items-center gap-0.5", minimal ? "hidden lg:flex" : "flex")}>
           <MenuButton onClick={() => {}} title="Grid/Layout" className="hidden xl:flex">
             <Columns className="w-3.5 h-3.5" />
             <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-slate-300" />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
             <Undo className="w-3.5 h-3.5" />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
             <Redo className="w-3.5 h-3.5" />
           </MenuButton>
           <MenuButton onClick={() => {}} title="Toggle Fullscreen" className="hidden md:flex">
             <Maximize2 className="w-3.5 h-3.5" />
           </MenuButton>
        </div>

        <div className="flex-1" />

        {/* Far Right Action Group */}
        <div className="hidden md:flex items-center gap-1 pl-2 border-l border-slate-100">
           <MenuButton onClick={() => {}} title="View Source HTML" className="bg-slate-50 hover:bg-slate-100">
             <FileCode2 className="w-4 h-4 text-primary" />
             <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
           </MenuButton>
        </div>
      </div>

      {/* Link Overlay (Compact) */}
      {showLinkInput && (
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3 animate-in slide-in-from-top-1 duration-200 shadow-inner">
           <div className="flex-1 relative w-full sm:w-auto">
             <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
             <input 
               autoFocus
               value={linkUrl}
               onChange={(e) => setLinkUrl(e.target.value)}
               placeholder="https://example.com"
               className="h-9 w-full pl-9 px-3 rounded-md border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
               onKeyDown={(e) => {
                 if (e.key === 'Enter') setLink();
                 if (e.key === 'Escape') setShowLinkInput(false);
               }}
             />
           </div>
           <div className="flex items-center gap-4 shrink-0 bg-white px-3 py-1.5 rounded-md border border-slate-100 shadow-sm">
             <label className="flex items-center gap-2 cursor-pointer group">
               <input 
                 type="checkbox" 
                 checked={isNofollow} 
                 onChange={(e) => setIsNofollow(e.target.checked)}
                 className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-all active:scale-90"
               />
               <span className="text-[11px] font-bold text-slate-500 group-hover:text-primary transition-colors">rel="nofollow"</span>
             </label>
             <div className="w-px h-4 bg-slate-100" />
             <div className="flex items-center gap-1">
                <button onClick={setLink} className="h-7 px-4 rounded-md text-[10px] font-bold bg-primary text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95">Link it</button>
                <button onClick={() => setShowLinkInput(false)} className="h-7 px-2 rounded-md text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
             </div>
           </div>
        </div>
      )}
      
      <div className="bg-white min-h-[300px] relative">
         <EditorContent editor={editor} />
      </div>
      
      {/* Precision Footer */}
      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 ">Ready for submission</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1.5">
               <span className="text-[10px] font-bold text-primary">Auto-save: ON</span>
            </div>
         </div>
         <div className="text-[10px] font-bold text-slate-400 flex items-center gap-4">
            <span className="bg-slate-200/50 px-2 py-0.5 rounded-full">{editor.storage.characterCount?.characters() || 0} Chars</span>
            <div className="flex items-center gap-1 text-slate-300">
               <Type className="w-3 h-3" />
               <span>Standard Layout</span>
            </div>
         </div>
      </div>
      
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
          font-weight: 500;
        }
        .prose a {
          color: #10B981;
          text-decoration: underline;
          font-weight: 700;
        }
        .prose h1 {
           font-size: 1.5rem;
           font-weight: 800;
           color: #0f172a;
           margin-top: 1.5rem;
           margin-bottom: 0.75rem;
        }
        .prose h2 {
           font-size: 1.25rem;
           font-weight: 700;
           color: #1e293b;
           margin-top: 1.25rem;
           margin-bottom: 0.5rem;
        }
        .prose ul, .prose ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .prose blockquote {
          border-left: 4px solid #10B981;
          background-color: #f8fafc;
          padding: 1.25rem 1.5rem;
          border-radius: 0.5rem;
          font-style: italic;
          color: #475569;
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
};
