#!/usr/bin/env node

import { Utils, FileSystem } from "slicemachine-core";
import {
  installSm,
  validatePkg,
  maybeExistingRepo,
  createRepository,
  loginOrBypass,
} from "./steps";
import { findArgument } from "./utils";

async function init() {
  const cwd = findArgument(process.argv, "cwd") || process.cwd();
  const base = findArgument(process.argv, "base") || Utils.CONSTS.DEFAULT_BASE;

  console.log(
    Utils.purple(
      "You're about to configure Slicemachine... Press ctrl + C to cancel"
    )
  );

  await loginOrBypass(base);
  validatePkg(cwd);
  const config = FileSystem.getOrCreateAuthConfig();
  const { existing, name } = await maybeExistingRepo(
    config.cookies,
    cwd,
    config.base
  );
  if (existing === false) {
    await createRepository(name, Utils.Framework.none, config);
  }
  await installSm(cwd);
}

try {
  void init();
} catch (error) {
  if (error instanceof Error) Utils.writeError(error.message);
  else console.error(error);
}