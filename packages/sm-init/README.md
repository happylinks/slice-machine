This package is designed to setup Slicemachine for any project.
It is launched with an  `Npx command`  
It's main purpose is to install the slice-machine-ui plugin

------

## How to dev
This package makes heavy use of the `slicemachine-core` package, you'll have to build the code to be able to run it properly

-------

## How to test the init script on a project

### Solution 1
- Use `npm link` in this directory
- Make an outside project
- Use `npm link sm-init` in the project
- Run `npx sm-init` in the project

### Solution 2
- Watch the Core & the Init
- run the `index.js` of the build in your project
- enjoy coding

### Solution 3
- from te top level run `yarn`
- then `pushd packages/slicemachine-core && yarn build && popd && pushd packages/sm-init && yarn build && popd`
- the script can then be run with `node packages/sm-init/build/index.js`