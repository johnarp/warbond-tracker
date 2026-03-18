# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[1.3.4]: https://github.com/johnarp/warbond-tracker/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/johnarp/warbond-tracker/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/johnarp/warbond-tracker/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/johnarp/warbond-tracker/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/johnarp/warbond-tracker/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/johnarp/warbond-tracker/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/johnarp/warbond-tracker/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/johnarp/warbond-tracker/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/johnarp/warbond-tracker/compare/v1.0.5...v1.0.0
[1.0.5]: https://github.com/johnarp/warbond-tracker/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/johnarp/warbond-tracker/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/johnarp/warbond-tracker/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/johnarp/warbond-tracker/compare/v1.0.1...v1.0.2
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

## [1.3.4] - 2026-03-18

### Added

- Entrenched Division - Warbond Super Style

### Changed

- Better Entrenched Division image

## [1.3.3] - 2026-03-17

### Added

- Entrenched Division Warbond

## [1.3.2] - 2026-03-12

### Added

- Blue color style

### Fixed

- Background image adjusting when browser address bar resizes viewport on mobile

### Removed

- Test profile

## [1.3.1] - 2026-03-11

### Added

- Backdrop toggle that adds/strengths backgrounds to improve readability
- `app/credits.json` with View Credits pop-up in Settings
- Into the Unjust Super Style
- Green Style

### Changed

- Improved colors of existing Styles
- Updated README preview image
- CRT effect is off by default
- Super Style images are organized into separate folders

### Removed

- Both Redacted Regiment Super Styles
- Credits from NOTICE

### Fixed

- Background image adjusting when browser address bar resizes viewport on mobile

## [1.3.0] - 2026-03-10

### Added

- OLED toggle in Settings

### Changed

- Multi-select filters (eg. view both *Liberating* and *Unliberated*)
- Control bar options are condensed into popups
- Tab title from `#% Liberated // Warbond Tracker` to `#% // Warbond Tracker`
- Clear Liberation and Clear All Data use the custom modal pop-up

### Removed

- Separate OLED themes

### Fixed

- Open Graph image size

## [1.2.2] - 2026-03-09

### Added

- Short titles with toggle in Settings
- Slash to focus search bar
- ODST, Redacted Regiment, and Siege Breakers Super Styles
- Red Style
- Unliberated count in Show Profile

### Changed

- Improved Open Graph tags
- Pop-up modal is shared between announcements and show aliases/profile

### Removed

- Hardcoded color map in `views.js`, uses CSS variable instead

## [1.2.1] - 2026-03-09

### Added

- Machinery of Oppression Super Style

### Changed

- Clearer asset usage in [NOTICE](./NOTICE)
- Separate script-injections for announcement script and view scripts have been factored into a single helper
- `createCard()` removed from `render()` into its own dedicated function
- `applyCardSize` no longer writes to localStorage on page load
- Other `views.js` and `warbonds.js` improvements

### Fixed

- Sort dropdown readability

## [1.2.0] - 2026-03-07

### Added

- Warbond size control
- CRT toggle
- Mobile browser navigation colour changing has returned
- View Aliases and View Profile in settings
- A single alias for Cutting Edge
- Super Earth and Meridian Black Hole Super Styles
- OLED Styles

### Changed

- Import/export JSON also includes title preference, warbond size, crt, and seen announcements
- Titles remain enabled when switching pages
- Improved Styles and Settings organization
- Better looking checkmark

### Fixed

- Warbonds now stay the same width when there aren't enough other Warbonds to fill a row

## [1.1.0] - 2026-03-06

### Added

- Announcement popup functionality
- Image for general announcements not related to new Warbonds
- Social preview image for the repository
- "Automatons" and "Terminids" Styles
- [NOTICE](NOTICE) and [README.md/Legal](README.md#️-legal) to clarify that [MIT LICENSE](LICENSE) covers only code, with copyrighted assets belonging to their respective owners.
- CRT effect on Warbonds
- Separator between title/nav and percentage/controls

### Changed

- Icon design and README images
- Buttons are diagonal
- Warbonds have brackets on their corners
- "Classic Yellow" Style to "Helldivers", with more accurate colours
- Percentage and controls styling improvement
- `warbonds.html` select dropdowns to button toggles. `warbonds.js` also changed to accommodate
- Liberating state design
- Footer sticks to the bottom of the page
- Warbond Title design
- Improved README

### Removed

- Deep Red and Deep Blue Styles
- All Super Styles (temporarily)

## [1.0.5] - 2026-03-03

### Changed

- Open Graph description text

### Fixed

- Search bar auto focus
- Corrected Open Graph og:image and og:url paths

## [1.0.4] - 2026-03-03

### Added

- `<meta name="description">`
- Open Graph meta tags

### Changed

- Navigation styling
- Search bar auto focuses on page load

## [1.0.3] - 2026-02-25

### Added

- Deep Red and Deep Blue Styles
- Meridian Black Hole and \[REDACTED\] Super Styles

### Changed

- Improved styling

## [1.0.2] - 2026-02-24

### Fixed

- `warbonds.json` image path
- chosen theme only loads when visiting styles.html

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