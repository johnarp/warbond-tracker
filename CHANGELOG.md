# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[1.0.1]: https://github.com/johnarp/warbond-tracker/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/johnarp/warbond-tracker/compare/v0.4.5...v1.0.0
[0.4.5]: https://github.com/johnarp/warbond-tracker/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/johnarp/warbond-tracker/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/johnarp/warbond-tracker/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/johnarp/warbond-tracker/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/johnarp/warbond-tracker/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/johnarp/warbond-tracker/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/johnarp/warbond-tracker/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/johnarp/warbond-tracker/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/johnarp/warbond-tracker/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/johnarp/warbond-tracker/compare/0.1.2...v0.2.0
[0.1.2]: https://github.com/johnarp/warbond-tracker/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/johnarp/warbond-tracker/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/johnarp/warbond-tracker/releases/tag/0.1.0

## [1.0.1] - 2026-02-24

### Fixed

- `/app/warbonds.json` absolute path to `./app/warbonds.json` relative path

## [1.0.0] - 2026-02-24

### Added

- Downloaded font
- `meta.json` to pull stats from

### Changed

- Styling to be closer to Helldivers 2
- Separated HTML, CSS, and JS into separate files
- New README images and app icon

### Removed

- Many themes for now

## [0.4.5] - 2026-02-20

### Fixed

- Settings footer not appearing on mobile

### Removed

- Liberating hazard tape

## [0.4.4] - 2026-02-20

### Added

- Import/export progress with JSON
- JSON file to test import/export

### Changed

- Flipped Show Title checkbox

### Fixed

- X button is now inside the search bar on mobile screens

## [0.4.3] - 2026-02-19

### Changed

- Alias search only matches on full word and exact matching.
- Warbond menu closes on any press outside
- Warbond menu animates on close
- Settings have dividers between them

### Fixed

- Mobile navigation bar color changes depending on theme

## [0.4.2] - 2026-02-19

### Added

- Animation to show/hide Warbond title
- Erata Prime theme

### Changed

- Improved \[REDACTED\] theme

### Fixed

- Duplicate outline when hovering with title enabled

## [0.4.1] - 2026-02-18

### Added

- More aliases

### Changed

- Improved Liberating effect readability
- Better organized the images

## [0.4.0] - 2026-02-18

### Added

#### Search Bar

- Search bar
- Some aliases for Warbonds (eg. "Stealth" for Redacted Regiments)

#### Themes

- Cyberstan, Bile, and \[REDACTED\] themes
- Flag to Super Earth theme

#### Miscellaneous

- Tab title reflects Liberation percentage
- Confirmation before clearing Liberation
- Information footer to settings menu

### Changed

- Improved the look of the LIBERATED banner
- Small name changes to better fit the lore
- Removed more hard-coded color codes
- Improved settings menu

## [0.3.0] - 2026-02-17

### Added

- Settings menu
- Themes

### Changed

- Moved clear buttons to settings menu
- Removed hard-coded color codes

## [0.2.2] - 2026-02-17

### Changed

- Cursor pointer on scrollbar hover
- Improved percentage text

### Fixed

- Mobile navigation bar colour
- LIBERATED brightness filter no longer affects title
- Warbond titles are now consistently sized and centered

## [0.2.1] - 2026-02-17

### Added

- Color for mobile navigation bar
- Sorting by release date
- Website icon

### Changed

- "LIBERATED" text to match the UI
- Better folder structure

### Fixed

- Space between bottom of image and outline

## [0.2.0] - 2026-02-16

### Added

- "Liberating" status (in progress)

### Changed

- Major UI and styling overhaul

## [0.1.2] - 2026-02-16

### Changed

- "LIBERATED" to an easier to see (and more democratic) yellow
- Small colour adjustments
- Updated README screenshot

## [0.1.1] - 2026-02-13

### Added

- Screenshot to README

### Changed

- Styling to improve mobile experience

## [0.1.0] - 2026-02-12

### Added

- Site and styling
- Options like sorting and filtering
- Buttons for clearing liberation and LocalStorage
- "LIBERATED" stamp for completed Warbonds