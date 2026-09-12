# Architecture and extension notes

The application is a React interface around a client-side Three.js scene. Vinext and Vite provide development tooling and static export. There is no application backend, database or authentication system. Local font and photo files ship with the build.

## Scene and map modes

`app/page.tsx` owns the selected place, view mode and overlay state. `components/campus-view.tsx` loads the scene and relays events between React and Three.js. `lib/campus/scene.ts` owns rendering, cameras, building picking, labels and transitions.

`lib/campus/data.ts` is the landmark directory. `primitives.ts` builds recognizable but approximate geometry; `signage.ts` creates labels and applies supplied school branding. `batch-meshes.ts` batches compatible static meshes to reduce draw calls.

`world-layout.mjs` distributes the landmarks around the sphere and computes their transition to campus positions. `world-context.ts` supplies surrounding trees, roads and buildings. Geometry and transform tests check finite coordinates, the final campus layout and safe orientation during the transition.

## Walking and activities

`walk-controller.ts` manages the player, camera, input, fictional student and teacher characters, interaction events and basketball state. `walk-math.mjs` contains pure movement, collision, proximity and projectile helpers. `components/walk-hud.tsx` exposes the passport, touch controls, minimap and game controls.

Visits are recorded in page memory. Refreshing resets the passport. Opening a place through quick travel alone does not count as a completed visit. Tests verify reachable entrances, collision behavior, input clearing when paused or unfocused, visits and the five-shot basketball loop.

`components/panorama.tsx` displays available equirectangular school photographs inside a separate viewer. A photo sphere is a fixed photographic viewpoint, not an interior that supports walking through a scanned model.

## Building visits and photographic models

`components/building-visit-dialog.tsx` presents available entry choices and switches between a photo-based walkable model, an original 360° panorama and, for the arena, an ordinary photograph. A walkable model is offered only for a registered, manually traced photograph. Other verified panoramas remain photographic viewers; an unsupported building has no invented interior.

`photo-rooms.ts` maps the five supported image filenames to their traced layouts. `photo-room-layout.ts` defines the layout data; `room-traces-library.ts` and `room-traces-hall.ts` describe visible room boundaries and observed furniture. `photo-room-math.ts` supplies collision and movement constraints. `photo-depth-geometry.ts` samples rays from the source camera against the traced shell and furniture to build a dense depth mesh. Each ray uses only its nearest visible surface, avoiding a duplicate projection onto hidden faces. `photo-room-scene.ts` applies the original equirectangular school image to that mesh and manages first-person rendering and input. The React viewer mounts and disposes that scene.

Projection uses the source camera as its reference: looking around from the capture point aligns the model with the panorama. Moving the camera reveals estimated depth. A single panorama supplies no reliable texture for hidden sides of furniture or geometry behind an obstruction, so movement is restricted to a small area near the capture point. Even nearby movement can stretch surfaces or expose gaps at depth boundaries. Reset returns to the capture point. This is an initial photo-based depth reconstruction, not a complete modelled room or measured floor plan.

When adding a model, trace an identified source photograph, record the visible surfaces and furniture, and set a movement boundary that avoids unsupported areas. Keep the original panorama available for comparison. Check the capture-point alignment, nearby movement, obstacle collisions and the return/reset path. Do not populate unseen areas with guessed furniture or advertise unrestricted room exploration.

While an entry or panorama viewer is open, the campus renderer is suspended and walking input is paused. Closing the viewer resumes the campus; switching viewers disposes the previous scene. Other campus overlays pause walking without suspending camera transitions.

`vegetation.ts` caches seeded branch and individual leaf geometry. Campus trees use 650 leaves; globe background trees use 150 leaves and instancing to limit draw calls.

## Extending the campus

For a new landmark, update the directory, procedural geometry and entrance/collision data together. Check the globe view, flat position and walk-mode approach. Add a source citation for the building description and any images.

For a new activity, keep its input and progress state explicit, release held keys when overlays open, and make an exit/reset path available. Keep mathematical rules independently testable and expose touch controls alongside keyboard input.

## Static deployment

`next.config.ts` enables static export. `vite.config.ts` configures Vinext and Tailwind without owner-specific hosting bindings. `scripts/build-vercel.mjs` runs the build and verifies the exported page and representative local assets. `vercel.json` points Vercel at `dist/client`.

The build assumes the site lives at the domain root. No credentials are required. `.env*`, deployment state, dependencies and build output are ignored by Git.
