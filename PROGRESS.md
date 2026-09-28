# Guided Encode -> Noise -> Decode Progress

## P0 Audit

Files planned for this feature:
- `src/lesson/hammingLessonEngine.js` (reference engine and lesson data)
- `src/lesson/HammingLessonOverlay.jsx` (gated DOM steps)
- `src/lesson/hammingLesson.css` (scoped overlay styles)
- `src/store/simulationStore.ts` (lesson flow state and actions)
- `src/components2d/ControlPanel.tsx` (auto-open toggle and flow actions)
- `src/SimulationApp.tsx` (overlay mount and camera/interaction lock)
- `src/scenes/LabScene.tsx` (wall display removal if present)
- `src/scenes/StudioRoom3D.tsx` (wall display removal if present)
- `src/scenes/TransmitterStation.tsx` (laptop/tray redesign)
- `src/scenes/ReceiverStation.tsx` (receiver final state)
- `src/scenes/ChannelZone.tsx` (channel status label and proceed flow)
- `tests/hammingLessonEngine.test.js` (engine contract tests)
- `submission.md` (feature status and demo flow)

## Status

- P0 audit complete.
- P1 complete: reference-derived engine and contract tests added.
- Engine matches the mounted app for the standard `(7,4)` and `(15,11)` matrices.
- No matrix mismatch found.
- P2 complete: centered DOM lesson overlay and scoped readable CSS added.
- P3 pending.
