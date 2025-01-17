.PHONY: install
install: check_deps install_dep

.PHONY: clean
clean: clean_workspace check_deps install_dep

.PHONY: install_dep
install_dep:
	@# Install dep
	@npm i
	@npx lerna bootstrap
	@cd packages/core && npm run build

.PHONY: clean_workspace
clean_workspace:
	@# Clean the workspace
	@rm -rf node_modules
	@npx lerna clean --yes

.PHONY: check_deps
check_deps:
	@# Checks that Node is installed
	@node -v > /dev/null 2>&1 || (echo -e 'node is not installed\n' && exit 42)


build_core: 
	pushd packages/core && npm run build && popd

build: build_core
	pushd packages/slice-machine && npm run build && npm run export-build

  