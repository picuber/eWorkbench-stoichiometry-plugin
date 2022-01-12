# eWorkbench-Ansatztool

## Requirements
You need have Node.js (>= 17.3.1) and `npm` (>= 8.3.0) installed.
It might work with lower versions, but there is no guarantee for it.

## Installation
To install this package run

```bash
npm install
```


## Deployment to production
To compile the plugin run

```bash
npm run build
```

The compiled site will be in the `dist` directory.
To Deploy this plugin to the Workbench link or move the `dist` directory into the
frontend at `wb-frontend/apps/eworkbench/src/assets/plugins`.
Then in the backend admin panel, in the plugin settings set `Path where the app-root resides:`
to `/plugins/[directory name]/index.html`


## Development
The source code resides in the `src` directory
To run the webpack-dev-server run

```bash
npm start
```

It will open a browser tab with the compiled site and reload it when
changes to the source are made
