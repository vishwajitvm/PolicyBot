# BUG FIX REPORT

## Overview
This document logs the bugs identified and resolved during the systematic audit of the PolicyBot project.

### Frontend Fixes
1. **`RetrievedChunkCard.tsx`**: Fixed missing closing brace `}` inside className logic.
2. **`Badge` Component**: Re-implemented `Badge.tsx` to support variants (`primary`, `secondary`, `destructive`, `success`, `warning`, `info`, `default`), resolving TypeScript `TS2322` errors.
3. **`Spinner` Component**: Added `className` support to allow custom sizing.
4. **`Button` Component**: Updated `Button.tsx` to support `variant` and `size` props matching Shadcn/UI standards, fixing TS errors in multiple pages.
5. **`Progress` Component**: Added `className` prop to `Progress.tsx` to fix styling errors in `IngestionJobStatus.tsx`.
6. **`IngestionDashboard.tsx`**: Fixed case-sensitive import error (`arrowUpRight` -> `ArrowUpRight`).
7. **`chat.ts` Schema**: Added missing `query.types.ts` defining `QueryScores` to resolve module not found errors.
8. **`ChatPage.tsx`**: Fixed invalid prop `disabled` on `ChatInput` (changed to `pending`). Extracted `formatDate` and `formatTime` to `utils/formatters.ts` for reuse. Fixed invalid `onClose` prop types for Modals.
9. **`Timeline.tsx`**: Updated import path for formatters to reference the new `utils/formatters.ts`.
10. **`App.test.tsx`**: Updated frontend unit test to expect the correct empty state text, fixing the failing test suite.

### Backend Fixes
1. **`indexes.py`**: Added explicit MongoDB text index on the `chunks.text` field to support `$text` `$search` queries in `retrieval_service.py`, preventing query failures during keyword retrieval.

---
*All tests currently passing.*
