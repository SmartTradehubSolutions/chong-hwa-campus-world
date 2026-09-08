# Contributing

Thanks for helping improve the campus world. Small, focused pull requests are easiest to review.

## Development

1. Fork the repository and create a branch in your fork.
2. Use Node.js 22.13 or newer, then run `npm ci` and `npm run dev`.
3. Make your change and describe the behavior it improves.
4. Run `npm test`, `npm run typecheck` and `npm run build`.
5. Open a pull request with your validation results. For a visible change, include a screenshot or short recording when possible.

Add meaningful behavior tests for changes to movement, collisions, layout transforms or basketball rules. Documentation-only changes do not need new tests. Keep the package lockfile in sync if you change dependencies.

## Campus accuracy

- Link a reliable school reference when correcting a building, uniform or facility name. Distinguish observations from estimates.
- Keep the campus navigable. Building entrances must remain reachable, and movement must not tunnel through obstacles.
- Add image provenance to `docs/media-manifest.json` or `docs/SOURCES.md` as appropriate.
- Do not present an approximate model or a panorama as a measured, fully scanned interior.

## Rights and privacy

By submitting original code or documentation, you agree to contribute it under this project's MIT license. You must have the right to contribute it. Existing third-party notices remain in force.

School branding and media follow [ASSET_RIGHTS.md](ASSET_RIGHTS.md), not the code license. Do not add assets you cannot appropriately share, private school documents, student records, credentials or identifiable student photographs without the necessary rights and permission. Keep student and teacher avatars fictional.

## Bugs and ideas

Include steps to reproduce a bug, expected and actual results, device/browser details and any relevant error message. Remove personal information from logs. Before starting a large feature, open an issue describing it so its scope can be discussed.

Treat contributors respectfully. Focus feedback on the work, and welcome contributions from people with different backgrounds and levels of experience.
