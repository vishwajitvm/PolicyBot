# Fix for DateTime - Float Subtraction Error

## Issue
The ingestion service was failing with the error:
```
unsupported operand type(s) for -: 'datetime.datetime' and 'float'
```
This occurred when trying to calculate elapsed time by subtracting a `time.time()` float from a `datetime.utcnow()` object.

## Root Cause
In two locations in `backend/app/ingestion/ingestion_service.py`, the code was doing:
```python
finished_at = datetime.utcnow()
elapsed_seconds = int((finished_at - start_time).total_seconds())
```
Where `start_time` is a float from `time.time()`. You cannot subtract a float from a datetime object.

## Fix Applied
Changed both instances to calculate elapsed time using time.time() for both values:

**Before:**
```python
finished_at = datetime.utcnow()
elapsed_seconds = int((finished_at - start_time).total_seconds())
```

**After:**
```python
elapsed_seconds = int(time.time() - start_time)
finished_at = datetime.utcnow()
```

## Files Changed
- `backend/app/ingestion/ingestion_service.py` (two fixes in the `run_for_source` method)

## Verification
- The fix eliminates the TypeError by using compatible types (both floats) for subtraction
- Elapsed time calculation remains accurate
- All existing functionality preserved
- Job timing fields (`started_at`, `finished_at`, `elapsed_seconds`) are set correctly

## Impact
- Ingestion jobs will no longer fail with datetime subtraction errors
- Real-time monitoring continues to work as expected
- Backward compatibility maintained