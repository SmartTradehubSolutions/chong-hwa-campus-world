# Trees and building visits

## Current scope

Pressing E at an entrance opens an original school panorama directly. Visitors can look around, choose another photographed location with the image picker and return to campus. The sports arena retains its ordinary official photograph; buildings without a verified panorama show information.

The generic furnished rooms and subsequent photo-depth reconstruction experiment were removed at the user's request. The branching-tree work is retained.

## Architecture

- `vegetation.ts` builds reusable branch and individual-leaf geometry.
- `BuildingVisitDialog` displays the panorama, ordinary photograph or unavailable-media information.
- `panorama.tsx` provides fixed-camera 360° viewing and its controls.
- Landmark data supplies the image picker; `photo-sources.ts` supplies source-page links.
- Campus rendering and walking input remain paused while the visit viewer is open.

## Implementation and verification checklist

1. Remove the indoor walking mode, reconstructed-room modules and related controls.
2. Open verified panoramas directly from E and touch interactions, preserving the image picker and return-to-campus action.
3. Keep arena photographs distinct from panoramas and preserve information for unsupported locations.
4. Verify desktop and mobile entry, panorama switching, viewer cleanup, source links and existing outdoor gameplay.
5. Run automated tests, TypeScript checking and the production build before publication.

## Accuracy boundary

The outdoor campus is an illustrative 3D model. Interior visits display actual school photographs from fixed camera positions; they do not offer walkable rooms or surveyed interior geometry. Keep school media attribution and source records intact.
