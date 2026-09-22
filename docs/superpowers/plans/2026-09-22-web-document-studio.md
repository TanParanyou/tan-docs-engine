# Web Management Studio & Live Markdown Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive Web Management Studio and Split-View Live Markdown Editor for `tan-docs-engine`, allowing users to create workspaces, edit markdown with real-time Mermaid diagrams, manage files, and upload images directly via the browser.

**Architecture:** Next.js 15 App Router with dedicated server-side file management helpers in `lib/workspaces.ts`, REST route handlers in `app/api/workspaces/...`, and a dedicated studio page at `/[workspace]/edit` featuring a Split-View editor, real-time debounced preview, and drawers for file reordering and settings.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Markdown-it, Highlight.js, Mermaid.js, Puppeteer.

## Global Constraints

- Retain 100% backward compatibility with existing CLI (`npm run generate`) and workspaces (`wallet-project`, `pos-system`).
- Strictly validate all `slug` and `filename` inputs to match `/^[a-zA-Z0-9_-]+(\.md)?$/` to prevent path traversal.
- Images uploaded must reside in `workspaces/[slug]/src/assets/`.
- No broken layouts during PDF rendering or page transitions.

---

### Task 1: Backend Workspace & File Management APIs

**Files:**
- Modify: `lib/workspaces.ts`
- Create: `app/api/workspaces/route.ts`
- Create: `app/api/workspaces/[slug]/config/route.ts`
- Create: `app/api/workspaces/[slug]/files/route.ts`
- Create: `app/api/workspaces/[slug]/files/[filename]/route.ts`
- Create: `app/api/workspaces/[slug]/upload/route.ts`

**Interfaces:**
- Produces:
  - `createWorkspace(data: CreateWorkspaceInput): WorkspaceData`
  - `updateWorkspaceConfig(slug: string, config: Partial<DocsConfig>): DocsConfig`
  - `createWorkspaceFile(slug: string, filename: string, content?: string): void`
  - `deleteWorkspaceFile(slug: string, filename: string): void`
  - `renameWorkspaceFile(slug: string, oldFilename: string, newFilename: string): void`
  - `reorderWorkspaceFiles(slug: string, filenames: string[]): void`
  - `writeWorkspaceFileContent(slug: string, filename: string, content: string): void`
  - `readWorkspaceFileContent(slug: string, filename: string): string`

- [ ] **Step 1: Extend `lib/workspaces.ts` with file management functions**
  Implement safe workspace creation, file CRUD, reordering, and content read/write with path traversal validation.

- [ ] **Step 2: Create `app/api/workspaces/route.ts`**
  Implement `GET` (list all workspaces) and `POST` (create new workspace with scaffolding).

- [ ] **Step 3: Create `app/api/workspaces/[slug]/config/route.ts`**
  Implement `GET` (get config) and `PUT` (update `docs.config.json`).

- [ ] **Step 4: Create `app/api/workspaces/[slug]/files/route.ts` and `[filename]/route.ts`**
  Implement file list, create, rename, delete, reorder, and content read/write.

- [ ] **Step 5: Create `app/api/workspaces/[slug]/upload/route.ts`**
  Implement multipart file upload saving to `workspaces/[slug]/src/assets/`.

- [ ] **Step 6: Verify API routes via curl / tsx test script**
  Test creating a temporary workspace, writing a file, uploading a test file, and cleaning up.

- [ ] **Step 7: Commit Task 1**
  ```bash
  git add lib/workspaces.ts app/api/workspaces
  git commit -m "feat(api): add workspace and file management rest endpoints"
  ```

---

### Task 2: Live Preview & Client-side Markdown Editor Components

**Files:**
- Create: `components/studio/EditorToolbar.tsx`
- Create: `components/studio/LivePreview.tsx`
- Create: `components/studio/MarkdownEditor.tsx`

**Interfaces:**
- `EditorToolbar`: Props for formatting action triggers (H1-H3, Bold, Table, Mermaid, Pagebreak, Image).
- `LivePreview`: Props `{ content: string, theme?: ThemeConfig }`. Debounced Mermaid renderer with error boundary.
- `MarkdownEditor`: Props `{ content: string, onChange: (val: string) => void, onSave: () => void, slug: string }`. Handles tab indents, image paste, and drop.

- [ ] **Step 1: Create `components/studio/EditorToolbar.tsx`**
  Action buttons with Lucide icons for Markdown syntax insertion.

- [ ] **Step 2: Create `components/studio/LivePreview.tsx`**
  Renders markdown using `markdown-it`, syntax highlighting, and runs client-side `mermaid.run()` debounced by 300ms with error boundary.

- [ ] **Step 3: Create `components/studio/MarkdownEditor.tsx`**
  Textarea supporting `Cmd+S`, `Tab` indent, and paste/drop image upload listener calling `/api/workspaces/[slug]/upload`.

- [ ] **Step 4: Commit Task 2**
  ```bash
  git add components/studio
  git commit -m "feat(studio): add editor toolbar, markdown editor, and live preview components"
  ```

---

### Task 3: Studio App Shell, Drawers, and Route (`/[workspace]/edit`)

**Files:**
- Create: `components/studio/FileManagementDrawer.tsx`
- Create: `components/studio/WorkspaceSettingsDrawer.tsx`
- Create: `components/studio/StudioLayout.tsx`
- Create: `app/[workspace]/edit/page.tsx`

**Interfaces:**
- `StudioLayout`: Main stateful orchestrator for file switching, dirty state, auto-save prompt, and view modes.

- [ ] **Step 1: Create `components/studio/FileManagementDrawer.tsx`**
  Renders file list with Add File button, Rename modal, Delete confirmation, and Move Up/Down buttons.

- [ ] **Step 2: Create `components/studio/WorkspaceSettingsDrawer.tsx`**
  Form to edit title, subtitle, documentNumber, version, status, author, client, organization, and theme colors.

- [ ] **Step 3: Create `components/studio/StudioLayout.tsx`**
  Top bar (save, view mode toggle, status badge), main split view, and collapsible side panels.

- [ ] **Step 4: Create `app/[workspace]/edit/page.tsx`**
  Server component validating slug and passing initial workspace data to `StudioLayout`.

- [ ] **Step 5: Commit Task 3**
  ```bash
  git add app/[workspace]/edit components/studio
  git commit -m "feat(studio): implement studio route and management drawers"
  ```

---

### Task 4: Home Page Creation Modal & Navigation Links

**Files:**
- Create: `components/NewWorkspaceModal.tsx`
- Modify: `app/page.tsx`
- Modify: `app/[workspace]/page.tsx`

**Interfaces:**
- `NewWorkspaceModal`: Modal dialog to input workspace parameters and trigger `POST /api/workspaces`.

- [ ] **Step 1: Create `components/NewWorkspaceModal.tsx`**
  Form for slug, title, name, doc number, author, client, and theme colors with validation.

- [ ] **Step 2: Update `app/page.tsx`**
  Add "+ New Workspace" button opening the modal, and add "Edit Studio" button on each workspace card.

- [ ] **Step 3: Update `app/[workspace]/page.tsx`**
  Add "Edit in Studio" button to the reader header.

- [ ] **Step 4: Commit Task 4**
  ```bash
  git add components/NewWorkspaceModal.tsx app/page.tsx app/[workspace]/page.tsx
  git commit -m "feat(ui): add new workspace modal and studio navigation links"
  ```

---

### Task 5: End-to-End Verification & PDF Compilation Test

**Files:**
- Test all created routes and features

- [ ] **Step 1: Run type checking and build test**
  Run: `npm run build`
  Expected: Compiled successfully with 0 TypeScript / ESLint errors.

- [ ] **Step 2: Functional verification of Workspace creation & Studio**
  1. Create a new test workspace `test-doc` via modal.
  2. Open `/test-doc/edit`, edit markdown, insert table and Mermaid diagram.
  3. Verify Mermaid renders dynamically in live preview.
  4. Save changes (`Cmd+S`) and verify updated content on disk.
  5. Test adding a file `02-api.md` and reordering.
  6. Test PDF export (`/api/pdf?workspace=test-doc` and `npm run generate -- --workspace test-doc`).

- [ ] **Step 3: Clean up test artifacts and final commit**
  ```bash
  git commit -m "chore: complete web management studio & live markdown editor"
  ```
