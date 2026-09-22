# Dual-Mode Editor (Visual Rich-Text + Raw Markdown) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dual-mode document input system allowing users to toggle between Visual (WYSIWYG Rich-Text) and Markdown (Raw Syntax) modes with bi-directional synchronization.

**Architecture:** Use TipTap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-table`, `tiptap-markdown`) for the Visual Mode editor, and existing Monaco/Textarea for Raw Markdown mode, coordinated by Zustand `useStudioStore` state.

**Tech Stack:** Next.js 15, React 19, TipTap, Tailwind CSS, Zustand.

---

### Task 1: Install TipTap & Extensions
**Files:**
- Modify: `package.json`

- [ ] **Step 1:** Run npm install for `@tiptap/react @tiptap/starter-kit @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header tiptap-markdown`
- [ ] **Step 2:** Verify installation and package integrity.

---

### Task 2: Update Zustand Store for Editor Mode
**Files:**
- Modify: `lib/store/useStudioStore.ts`

- [ ] **Step 1:** Add `inputMode: "visual" | "markdown"` and `setInputMode: (mode: "visual" | "markdown") => void` to StudioState.
- [ ] **Step 2:** Default `inputMode` to `"visual"`.

---

### Task 3: Build VisualEditor Component
**Files:**
- Create: `components/studio/VisualEditor.tsx`
- Create: `components/studio/VisualToolbar.tsx`

- [ ] **Step 1:** Implement TipTap editor with starter kit, tables, and markdown serialization extensions.
- [ ] **Step 2:** Build formatted table controls (insert table, add row/col, delete row/col).
- [ ] **Step 3:** Style with Atelier clean light aesthetic (`.ProseMirror` styling matching document preview).

---

### Task 4: Integrate Dual-Mode Switcher in MarkdownEditor & EditorToolbar
**Files:**
- Modify: `components/studio/MarkdownEditor.tsx`
- Modify: `components/studio/EditorToolbar.tsx`

- [ ] **Step 1:** Add Mode Switcher Segmented Control `[ 👁️ Visual | 💻 Markdown ]` to EditorToolbar.
- [ ] **Step 2:** Render `VisualEditor` when `inputMode === "visual"`, and raw Textarea editor when `inputMode === "markdown"`.
- [ ] **Step 3:** Ensure bi-directional synchronization on switch and seamless save handling.

---

### Task 5: Verification & Testing
- [ ] **Step 1:** Run `npm run build` to ensure type safety and error-free Next.js build.
- [ ] **Step 2:** Verify editing in Visual mode, switching to Markdown mode, and checking rendered Live Preview.
