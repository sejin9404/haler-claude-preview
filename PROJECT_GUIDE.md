# 📖 Haler Project Master Guide

This document defines the core rules, workflow, and identity of the Haler project. All developers and AI agents must strictly adhere to these guidelines.

---

## 1. Brand Identity & Terminology
- **Service Name**: Haler
- **Official Domain**: `haler.co` (Production) / `haler.vercel.app` (Staging)
- **Core Terminology**:
  - NEVER use "Quiz" or "Score".
  - ALWAYS use **"Status Check"** for the diagnostic assessment.
  - ALWAYS use **"Risk Level Report"** for the results.
- **Mission**: Providing a personalized respiratory care experience through a high-fidelity "Status Check" onboarding leading to "The Pass" subscription.

## 2. Project Structure
- **`/app`, `/components`, `/lib`, `/public`**: Production "Running" code.
- **`/workbench`**: Development and experimental area (Isolated from Build/Git).
  - `/workbench/drafts`: For brand new features.
  - `/workbench/refactoring`: For experimenting with existing files.
  - `/workbench/lab`: For one-off scripts or data analysis.
- **`/assets`**: Centralized raw source files (Images/Videos/SVGs).
- **`/integrations`**: Third-party integration code and backups (e.g., Shopify).
- **`/backups`**:
  - `/backups/Running`: Periodic snapshots of production code.
  - `/backups/Archive`: Legacy files and dated backups.
- **`/kickstarter`**: Permanent records of the Kickstarter campaign.

## 3. Workflow & Deployment Rules
1. **New Feature Development**:
   - Work in `workbench/drafts/`.
   - Move to production folders ONLY after explicit deployment approval from the user.
2. **Refactoring Existing Features**:
   - Copy production files to `workbench/refactoring/`.
   - After successful testing and approval, replace the production file.
   - **MANDATORY**: Move the old version to `backups/Archive/` and append the date to the filename (e.g., `Home_2026-05-02.tsx`).
3. **Basic Edits**:
   - Minor text or UI tweaks can be made directly in production folders.
4. **Deployment Safety**:
   - `workbench/` tasks never auto-deploy.
   - Data-heavy pages (Admin, Status) must use `export const dynamic = 'force-dynamic'`.
   - `lib/supabase.ts` must maintain build-time safety with placeholders.

---
*Last Updated: 2026-05-02*
