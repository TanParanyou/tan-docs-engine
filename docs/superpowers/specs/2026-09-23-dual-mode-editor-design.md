# Design Document: Dual-Mode Editor (Visual Rich-Text + Raw Markdown)

## 1. Executive Summary
Provide users with two editing modes for documentation in `tan-docs-engine`:
1. **Visual Mode (Rich-Text / WYSIWYG):** Notion/Word-like editing with real typography (H1/H2/H3, bold, lists, tables) without seeing raw Markdown syntax (`#`, `**`, `|---|`).
2. **Markdown Mode (Raw Syntax):** Standard monospace Markdown editor with keyboard shortcuts, line metrics, regex search/replace, and direct access to raw syntax (Mermaid diagrams, HTML page breaks).

Both modes bi-directionally sync with each other and save to the workspace `.md` files without data loss.

---

## 2. Architecture & Library Choices
* **Core WYSIWYG Engine:** `@tiptap/react` and `@tiptap/starter-kit` with `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-header`, `@tiptap/extension-table-cell`, and `tiptap-markdown`.
* **State Management:** Zustand (`useStudioStore`) managing:
  * `inputMode`: `"visual" | "markdown"`
  * Bi-directional synchronization: when toggling between modes, the current content is converted to/from Markdown smoothly.
* **Component Structure:**
  * `MarkdownEditor.tsx` acts as the root editor container.
  * In `"markdown"` mode: renders the existing high-performance Textarea editor.
  * In `"visual"` mode: renders `VisualEditor.tsx` (TipTap instance with formatted tables, headings, and clean toolbar).
  * `EditorToolbar.tsx`: includes the mode toggle segmented button `[ 👁️ Visual | 💻 Markdown ]`.

---

## 3. Visual Mode Specification
* **Headings:** H1, H2, H3 rendered as large, bold headers without `#` symbols.
* **Inline Marks:** Bold, italic, strike, inline code rendered naturally.
* **Tables:** Real interactive table grid with controls to add row/column, delete row/column, and header toggling.
* **Lists & Task Lists:** Bullet lists, ordered lists, and interactive checkboxes.
* **Special Blocks (Mermaid & PageBreak):** Rendered as visually demarcated blocks/badges that maintain validity in Markdown.

---

## 4. Markdown Mode Specification
* Existing clean monospace editor with real-time cursor position (`Ln X, Col Y`), word/char counts, and search/replace overlay.

---

## 5. Verification Plan
* Install TipTap dependencies and verify React 19 compatibility.
* Build with `npm run build`.
* Verify switching back and forth does not corrupt headings, tables, or Thai text.
