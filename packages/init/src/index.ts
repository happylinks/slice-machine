#!/usr/bin/env node

import { Utils, FileSystem } from "@slicemachine/core";
import {
  installRequiredDependencies,
  validatePkg,
  maybeExistingRepo,
  createRepository,
  loginOrBypass,
  configureProject,
  displayFinalMessage,
  detectFramework,
  installLib,
} from "./steps";
import { findArgument } from "./utils";

async function init() {
  const cwd = findArgument(process.argv, "cwd") || process.cwd();
  const base = findArgument(process.argv, "base") || Utils.CONSTS.DEFAULT_BASE;
  const lib: string | undefined = findArgument(process.argv, "library");
  const branch: string | undefined = findArgument(process.argv, "branch");

  console.log(
    Utils.purple(
      "You're about to configure Slicemachine... Press ctrl + C to cancel"
    )
  );

  // verify package.json file exist
  validatePkg(cwd);

  // login
  await loginOrBypass(base);

  // retrieve tokens for api calls
  const config = FileSystem.PrismicSharedConfigManager.get();

  // detect the framework used by the project
  const frameworkResult = await detectFramework(cwd);

  // select the repository used with the project.
  const { existing, name } = await maybeExistingRepo(
    config.cookies,
    cwd,
    config.base
  );

  if (!existing) {
    await createRepository(name, frameworkResult.value, config);
  }

  // install the required dependencies in the project.
  await installRequiredDependencies(cwd, frameworkResult.value);

  const sliceLibPath = lib ? await installLib(cwd, lib, branch) : undefined;

  // configure the SM.json file and the json package file of the project..
  configureProject(cwd, base, name, frameworkResult, sliceLibPath);

  // ask the user to run slice-machine.
  displayFinalMessage(cwd);
}

try {
  void init();
} catch (error) {
  if (error instanceof Error) Utils.writeError(error.message);
  else console.error(error);
}
