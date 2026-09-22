# Design Specification: Web Management Studio & Live Markdown Editor for tan-docs-engine

**Date:** 2026-09-22  
**Status:** Approved  
**Target:** `tan-docs-engine`

---

## 1. Executive Summary & Goals

`tan-docs-engine` is a multi-tenant documentation engine powered by Next.js, Markdown-it, and Puppeteer, producing high-fidelity PDF specifications and technical documentation. Currently, workspace creation, configuration, and markdown writing require manual filesystem interactions.

This design introduces a **Web Management Studio & Live Markdown Editor** directly in the web application:
1. **Interactive Workspace Creation:** "+ New Workspace" UI modal to scaffold new documentation projects with templates.
2. **Dedicated Document Studio (`/[workspace]/edit`):** A full-featured workspace authoring environment with a Split-View Markdown editor, quick formatting toolbar, live preview, and live Mermaid diagram rendering.
3. **Workspace & File Management:** Ability to add new markdown sections, rename, delete, and reorder files in the document pipeline, as well as update `docs.config.json` via a graphical settings panel.
4. **Instant Image Upload:** Clipboard paste (`Cmd+V` / `Ctrl+V`) and drag-and-drop image upload directly into the editor, auto-persisting assets to `workspaces/[slug]/src/assets/`.
5. **Robust File-backed REST APIs:** Next.js Route Handlers with path traversal safeguards ensuring 100% backward compatibility with existing CLI build workflows.

---

## 2. User Experience & Application Architecture

### 2.1 Route Map & Page Flow
* `/` (Home Page):
  - Retains workspace cards with existing actions: **View Docs**, **Print A4**, **Export PDF**.
  - Adds **"Edit Studio"** button directly on each card.
  - Adds **"+ New Workspace"** primary action in the header to open the creation modal.
* `/[workspace]` (Reader View):
  - Adds an **"Edit in Studio"** button in the top navbar for instant authoring navigation.
* `/[workspace]/edit` (Dedicated Document Studio):
  - **Top Bar:** Back button, Workspace title, live save status (`Saved` / `Unsaved Changes`), shortcut hints (`Cmd+S`), `Save`, `Preview Print`, `Export PDF`.
  - **Left Sidebar:**
    - **Tab 1: Files:** List of `.md` files included in the workspace. Provides Add File, Rename, Delete, and up/down or drag reordering.
    - **Tab 2: Settings:** Form to edit `title`, `subtitle`, `documentNumber`, `version`, `author`, `client`, `organization`, `status` (Draft/Approved), and theme colors (`primaryColor`, `accentColor`).
  - **Center-Left (Markdown Editor):**
    - Toolbar with fast insertion: Heading levels (H1, H2, H3), Bold, Italic, Table template, Mermaid diagram block, Page Break (`<!-- pagebreak -->`), Image upload picker.
    - Markdown textarea supporting `Tab` indentation and clipboard paste/drop of images.
  - **Center-Right (Live Document Preview):**
    - Instant HTML rendering matching document styles (`prose`, custom table formatting, task lists).
    - Client-side Mermaid rendering with a 300ms debounce.
    - Mermaid error boundary indicating syntax issues non-destructively.
    - View mode toggles: Split-View, Full Editor, Full Preview.

---

## 3. Backend REST API Architecture

All endpoints reside under `app/api/workspaces/...` and operate directly on the local repository filesystem within `/workspaces`.

### 3.1 Path Traversal & Security Validation
- All `slug` and `filename` parameters must strictly match `/^[a-zA-Z0-9_-]+(\.md)?$/`. Any input containing `..`, `/`, or `\` is immediately rejected with HTTP 400.

### 3.2 Endpoints Specification

#### `POST /api/workspaces`
- **Request Body:**
  ```json
  {
    "slug": "wallet-v2",
    "name": "Wallet Platform V2",
    "title": "System Architecture & Integration Manual",
    "subtitle": "Technical specification document",
    "documentNumber": "DOC-WLT-002",
    "version": "1.0.0",
    "author": "Architecture Team",
    "client": "Financial Corp",
    "organization": "TAN TECHNOLOGY SOLUTIONS",
    "theme": { "primaryColor": "#0f172a", "accentColor": "#2563eb" }
  }
  ```
- **Actions:**
  - Validates slug uniqueness.
  - Creates directory `workspaces/<slug>/src/assets`.
  - Generates `docs.config.json` with initial configuration and `files: ["01-system-overview.md"]`.
  - Generates starter `src/01-system-overview.md` with template sections, a table, and a sample Mermaid flowchart.
- **Response:** `201 Created` with `{ slug, success: true }`.

#### `PUT /api/workspaces/[slug]/config`
- **Request Body:** Partial or complete `DocsConfig` object.
- **Actions:** Merges and rewrites `workspaces/<slug>/docs.config.json` safely.
- **Response:** `200 OK` with updated config.

#### `GET /api/workspaces/[slug]/files`
- **Response:**
  ```json
  {
    "files": [
      { "filename": "01-system-overview.md", "title": "System Overview" },
      { "filename": "02-technical-architecture.md", "title": "Technical Architecture" }
    ],
    "orderedFiles": ["01-system-overview.md", "02-technical-architecture.md"]
  }
  ```

#### `POST /api/workspaces/[slug]/files`
- **Request Body Options:**
  - `{ "action": "create", "filename": "03-api-specs.md", "initialContent": "# API Specifications\n..." }`
  - `{ "action": "reorder", "files": ["01-system-overview.md", "02-technical-architecture.md", "03-api-specs.md"] }`
  - `{ "action": "rename", "oldFilename": "03-api-specs.md", "newFilename": "03-interfaces.md" }`
  - `{ "action": "delete", "filename": "03-interfaces.md" }`
- **Actions:** Performs file system operation and synchronizes `docs.config.json` `files` array.
- **Response:** `200 OK` with updated file list.

#### `GET /api/workspaces/[slug]/files/[filename]`
- **Response:** Plain text or `{ "content": "..." }` containing raw Markdown text.

#### `PUT /api/workspaces/[slug]/files/[filename]`
- **Request Body:** `{ "content": "# Markdown Content..." }`
- **Actions:** Writes UTF-8 text to `workspaces/<slug>/src/<filename>`.
- **Response:** `200 OK`.

#### `POST /api/workspaces/[slug]/upload`
- **Request:** `multipart/form-data` with `file: File`.
- **Validation:** Mime types `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`, `image/gif`. Max size 10MB.
- **Actions:**
  - Ensures `workspaces/<slug>/src/assets/` exists.
  - Generates safe filename: `${Date.now()}-${sanitizedOriginalName}`.
  - Writes binary file to disk.
- **Response:**
  ```json
  {
    "url": "./assets/1727019600000-arch-diagram.png",
    "filename": "1727019600000-arch-diagram.png"
  }
  ```

---

## 4. Frontend Studio Implementation Details

### 4.1 Component Breakdown
1. `app/[workspace]/edit/page.tsx`: Server Component verifying workspace existence and loading initial config and files list.
2. `components/studio/StudioLayout.tsx`: Client App Shell managing active tab (Files / Settings), selected file, dirty state, and view mode (Split / Editor / Preview).
3. `components/studio/MarkdownEditor.tsx`:
   - Textarea with monospace typography and line wrapping.
   - Shortcut handlers (`Cmd+S`, `Tab`).
   - Image drag-and-drop & paste event listeners invoking the upload API.
4. `components/studio/EditorToolbar.tsx`: Formatting helper buttons.
5. `components/studio/LivePreview.tsx`:
   - Renders markdown with syntax highlighting.
   - Debounced (300ms) client-side Mermaid rendering with error boundary.
6. `components/studio/FileManagementDrawer.tsx`: Reorderable list, Add, Rename, Delete modal.
7. `components/studio/WorkspaceSettingsDrawer.tsx`: Form for `docs.config.json` metadata and theme colors.
8. `components/NewWorkspaceModal.tsx`: Homepage modal for quick workspace onboarding.

---

## 5. Verification & Testing Strategy

1. **Static Typing & Build:**
   - Execute `npm run build` to ensure Next.js App Router, Route Handlers, and Client Components compile with 0 TypeScript/lint errors.
2. **Functional End-to-End Verification:**
   - Create a new workspace (e.g. `inventory-platform`) via the Home page modal.
   - Verify directory creation (`workspaces/inventory-platform/docs.config.json` & `src/01-system-overview.md`).
   - Open `/inventory-platform/edit`, modify markdown text, add headers, insert Mermaid block, verify real-time preview rendering.
   - Test image upload via paste/file picker, verify image written to `src/assets/`.
   - Add a second markdown file `02-architecture.md`, reorder files, verify order updates in `docs.config.json`.
   - Save changes with `Cmd+S`, reload page, ensure state persists.
   - Trigger PDF generation (`/api/pdf?workspace=inventory-platform` and `npm run generate -- --workspace inventory-platform`) to verify Puppeteer successfully compiles the new workspace.
