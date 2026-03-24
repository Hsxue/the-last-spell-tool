## Map ID and Fog ID Synchronization

### Implementation
- Modified `setMapId` action in `configStore.ts` to update both `mapId` and `fogId` simultaneously
- Added `state.gameConfig.fogId = id;` alongside `state.gameConfig.mapId = id;`
- Preserves single transaction with immer for atomic updates

### Benefits
- Ensures automatic synchronization between Map ID and Fog ID when changing map
- Maintains data consistency without requiring user to update both fields separately
- Preserves existing functionality like the `hasUnsavedChanges` flag

### Technical Details
- Same function signature preserved: `(id: string) => void`
- Both updates happen atomically in same state transaction
- No changes needed to UI components (Fog ID field already read-only)