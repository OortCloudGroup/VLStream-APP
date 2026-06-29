English | [简体中文](./README.zh-CN.md)

## Table of Contents

1. [Multi-Project Frontend Collection](#multi-project-frontend-collection)
1. [Directory Structure](#directory-structure)
1. [Quick Start](#quick-start)
1. [Development](#development)
1. [Build](#build)
1. [Create a New Project](#create-a-new-project)
1. [Commit Convention](#commit-convention)
1. [ESLint Rules](#eslint-rules)
1. [Image Asset Naming Convention](#image-asset-naming-convention)
1. [Miscellaneous](#miscellaneous)

# Multi-Project Frontend Collection

The codebase is a collection of single-page Vue projects. The `.env` file selects which project to launch, and the `package.json` scripts compile a specific project.

## Directory Structure

```js
├── dist                                 # Output folder generated after build
├── public                               # Template folder for the mobile H5 project
├── src
│   ├── api                              # Per-project network request APIs
│   ├── assets                           # Asset folder
│   │   ├── @font-face                   # Fonts
│   │   ├── img                          # Per-project image folders (organized by project); also includes shared images
│   │   ├── css                          # Shared CSS
│   │   ├── styles                       # Shared styles, mainly defines common CSS variables
│   │   ├── theme                        # Shared theme folder, not yet used
│   ├── components                       # Shared components; holds encapsulated common components (be careful when modifying during development to avoid breaking other projects)
│   ├── config                           # Per-project configuration
│   │   ├── AppConfig.js                 # Config for the mobile H5 project: appid, secrets, etc.
│   │   ├── index.js                     # Environment and network IP configuration
│   │   ├── UIConfig.js                  # UI display and logo configuration
│   ├── mock                             # Mock network request folder, not yet used
│   ├── pages                            # Per-project code folders (e.g. a PC admin platform and a mobile H5 homepage; others are similar)
Example mobile project directory
│   │   ├── aomomo_home                  # Example PC-side project folder
│   │   │   ├── index
│   │   │   │   ├── components           # Project-level shared component folder
│   │   │   │   ├── page                 # Route page folder
│   │   │   │   ├── router               # Project routing configuration folder
│   │   │   │   ├── index.js             # Project entry
│   │   │   │   ├── index.vue            # Component entry
│   │   │   ├── store                    # pinia
│   │   │   │   ├── modules              # pinia module files
│   │   │   │   ├── index.js             # pinia configuration entry
│   │   │   │   ├── getters.js           # pinia getters file
│   │   │   ├── App.css                  # Project-level shared CSS (place CSS here when it conflicts with global styles)

│   ├── route                            # Shared route files, e.g. the about page of the H5 app
│   ├── util                             # Project utility files, e.g. http.js, bus.js
├── tempLib                              # Temporary folder
├── .env                                 # Dev env config file; switch projects here. Note: a recompile is required after each switch
├── .env.production                      # Per-project configuration under build mode

├── .eslintignore                        # ESLint ignore configuration
├── .eslintrc.js                         # ESLint configuration
├── .gitignore.js                        # Git ignore configuration
├── babel.config.js                      # Babel configuration
├── commitlint.config.js                 # Git commit convention configuration
├── package.json
├── vite.config.js                        # Vue 3.0 configuration

```

## Quick Start

Run the following commands to start the project quickly:

1. yarn install
2. yarn start
3. Open http://localhost:8080

## Development

1. In the `.env` file, find the project you want to develop and uncomment it. Note: only one project may be uncommented at a time; if multiple are uncommented, the last one takes effect.
2. yarn start
3. Open http://localhost:8080
4. Find the corresponding project under `src/pages` and start developing.

## Build

#### Compile a single project

- `pnpm run build:<project-folder-name>`, or run the WebStorm configuration
- Output is generated in the `dist` folder

## Create a New Project

    Note: keep the project name consistent across all places.

1. Create a folder named after the project under `src/` (recommended: copy an existing project and then remove what you don't need — this avoids many common issues).
2. Create a file named after the project under `src/config/pageConfig` (recommended: copy an existing one and trim it down — this avoids many common issues).
3. Configure the project's launch entry in `.env`.
4. Add a build configuration for the project in `package.json`.

## Commit Convention

The project uses commitlint to enforce the commit message format.
The following type identifiers are allowed. The type is required (cannot be empty), and the commit description cannot be empty either.

- upd: update a feature (neither feat nor fix)
- feat: a new feature
- fix: a bug fix
- docs: documentation
- style: formatting (changes that do not affect runtime behavior)
- refactor: refactoring (neither a new feature nor a bug fix)
- revert: revert a commit
- test: add tests
- chore: build process or auxiliary tooling changes

Note: a colon followed by a space is required after the type. Example: `fix: resolve login bug`

## ESLint Rules

- For WebStorm, installing the ESLint plugin is recommended. After editing a file, run ESLint --fix, or cultivate good coding habits.
  For the full rules, check the configuration file or read the [Airbnb JavaScript Style Guide](http://192.168.88.110:32433/oortfrontgroup/oort_h5/blob/master/REFRENCE.md).

Common rules that are also the baseline for this project:

- `v-for` must have a `:key`

```vue
<service-items v-for="(item, index) in tableData" :key="index" :data="item" />
```

- When the value type is known, prefer strict equality `===`

- Unused declarations — including imports, variables, and components — should be commented out or removed

- Declare arrays with `[]` and objects with `{}`

- Remove trailing commas

## Image Asset Naming Convention

1. No Chinese characters in names
2. No spaces in names

## Miscellaneous

### What if something goes wrong?

1. Read the error message, analyze it, and consult DeepSeek for help.

## Mobile app index.vue

Multiple mixins are used to provide reusable code:
devLogin — PC debug login screen
routeAnimate — route transition animations
backButton — mobile back-button listener
getTokenAndGateway — fetch token and gateway

## NavHeaderBanner — unified mobile banner component

[NavHeaderBanner](./src/components/navHeaderBanner/)

## oort-popup Component

[oort-popup](/src/components/popup/)

## oort-field Component

[oort-field](/src/components/field/)

## oort-image-preview Component

[oort-image-preview](/src/components/imagePreview/)
Note: the image component comes in both a functional form and a component form.

## oort-uploader Component

[oort-uploader](/src/components/uploader/)

## Contacts Component — usually used together with oort-popup

[Contact](/src/components/contactTree/)
