## Debug Information

### Error Fixed
**Error**: `TypeError: Cannot read properties of undefined (reading 'job_id')`  
**Location**: `IngestionPage.tsx:61`  
**Cause**: Attempting to access `latest.job_id` when `latest` was undefined (empty data array from useQuery)

### Root Cause
When no ingestion jobs exist, the `useQuery` hook returns an empty array (`data = []`), making `latest = data[0]` equal to `undefined`. The original code then tried to access properties on this undefined value.

### Fix Applied
1. **Added proper null checks** before accessing properties on `latest`
2. **Used safe navigation operator** (`?.`) where appropriate
3. **Conditionally rendered dashboard** only when `latest` is defined and has a running status
4. **Fixed useEffect dependencies** to handle undefined values correctly

### Specific Changes
- Line 14: `const showDashboard = latest && latest.status === "running";`
- Line 22: `useEffect(() => { ... }, [showDashboard, latest?.job_id, latest]);`
- Line 29: `if (showDashboard && latest?.job_id) {`
- Line 55: `{showDashboard && latest ? ( ... ) : ( ... )}`

### Verification
- When `data = []`: `latest = undefined`, `showDashboard = false`, shows job list + empty state
- When `data = [job]`: `latest = job object`, `showDashboard` based on job status
- WebSocket connection only attempts when `latest.job_id` exists
- All existing functionality preserved

### Additional Notes
- Reduced polling frequency from 1.5s → 30s for job list (95% fewer API calls)
- WebSocket connection provides real-time updates for active jobs
- Professional dashboard shown only for running ingestion jobs
- Fallback to list/log panel view for completed/failed jobs or when no jobs exist