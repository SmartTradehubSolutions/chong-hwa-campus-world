# Trees and building visits

## Superseded approach

The first implementation offered twelve generic rooms furnished by facility category. The user rejected this approach because the rooms did not match the real school panoramas. That implementation and its earlier validation record do not establish fidelity to the school; the generic-room design is superseded by the photograph-based plan below. The branching-tree work is retained.

## Corrected goal

Pressing E at an entrance should offer a walkable model that matches an identified school photograph where tracing is available, alongside the original 360° panorama. Unsupported locations must not receive an invented room.

## Architecture

- `vegetation.ts` continues to build reusable branch and individual-leaf geometry.
- `photo-room-layout.ts` defines traced room surfaces, observed furniture, the source camera and allowed movement.
- `photo-room-math.ts` contains collision and movement constraints.
- `photo-rooms.ts` registers supported image filenames; `room-traces-library.ts` and `room-traces-hall.ts` hold the manual traces.
- `photo-depth-geometry.ts` samples the nearest visible traced surface along each camera ray to form a dense depth mesh, avoiding duplicate projections onto hidden faces.
- `photo-room-scene.ts` applies the actual panorama to that mesh and owns the first-person scene and input.
- `BuildingVisitDialog` presents only supported model/photo choices and keeps campus movement paused while a viewer is open.

Tech stack: React, TypeScript, Three.js and the existing local school photographs.

## Implementation and verification

1. Trace five photographs: `pusatsumber-1.jpg`, `pusatsumber-3.jpg`, `guangqiantang-1.jpg`, `xingzhenglouxiaolitang-1.jpg` and `meishifang-1.jpg`.
2. Use only visible room surfaces and observed furniture. Sample their frontmost visible depth into a mesh and apply the corresponding school image; do not substitute generic room materials or category-based furniture.
3. Align the image at its capture point. Treat depth and dimensions as estimates, and constrain walking to a small area nearby to limit texture distortion and unsupported hidden surfaces.
4. Provide keyboard and touch movement, drag to look, reset to the capture point, original-panorama comparison and a return to campus.
5. Keep other verified images available in original 360° mode. Preserve the arena's ordinary photograph and clear unavailable-media states. Remove the twelve generic rooms.
6. Test registered image eligibility, finite geometry, camera reset, movement bounds and obstacle collisions. Inspect source-view alignment and nearby movement visually for each trace.
7. Verify desktop and mobile entry, model/photo switching, cleanup, existing gameplay, TypeScript and the production build before publishing GitHub/Vercel.

## Accuracy boundary

These are initial depth reconstructions from individual photographs, not complete modelled rooms, scans or measured floor plans. The original image determines appearance at the source camera; depth and visibility after movement remain approximate, with possible stretching and gaps at newly exposed areas. The interface and documentation must explain this limit and must not describe the models as a fully captured, freely walkable school interior.

## Verification result

29 automated tests pass, including source eligibility, photo ray direction, frontmost depth, finite geometry and movement constraints. TypeScript and the static production build pass. Desktop and 390 × 844 mobile browser checks pass for entry, all five models, movement/reset, original-panorama comparison, image switching and untraced-building fallbacks, with no browser errors. Capture-point and moved library views were inspected; limited-motion stretching remains an explicit accuracy limitation.
