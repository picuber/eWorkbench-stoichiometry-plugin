# eWorkbench-stoichiometry-plugin
This is an stoichiometry plugin for [eWorkbench](https://github.com/eWorkbench/eWorkbench) Lab Books.


## Installation
To install this plugin you need have
`Node.js` (>= 16.0.0) and `npm` (>= 7.10.0) installed.<br>
Then you can run
```bash
npm ci
```
This will do a clean install for a reproducible build.


## Deployment to the eWorkbench
### Compilation
First you have to compile the plugin with
```bash
npm run build
```
The compiled site will be in the `dist` directory.

### Deployment
To deploy this plugin to the eWorkbench link or move the `dist` directory into the
frontend at `wb-frontend/apps/eworkbench/src/assets/plugins`.
Then in the backend admin panel, in the plugin settings set `Path where the app-root resides:`
to `/plugins/[directory name]/index.html`


## Development
The source code resides in the `src` directory.
To run the webpack-dev-server run
```bash
npm start
```
It will open a browser tab with the compiled site and reload it when
changes to the source are made.


### More Information
For more information on the interactions of the plugin with the eWorkbench
check out the [Custom Plugin README](https://github.com/eWorkbench/eWorkbench/blob/master/README_CustomPlugins.md) in their repo.

There was also a presentation on 2022-03-14 about the plugin at the TUM
Department of Chemistry. The handout slides for the presentation with the
user manual and technical background can be found [here](./documents/presentation-2022-03-14-handout.pdf)
