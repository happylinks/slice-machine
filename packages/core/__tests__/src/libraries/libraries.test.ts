const TMP = "/tmp";
import fs from "fs";
import { Volume } from "memfs";
import { IUnionFs, ufs } from "unionfs";

import { libraries } from "../../../src/libraries";

import slice from "../../_misc/validSliceModel.json";
const model = JSON.stringify(slice);

jest.spyOn(console, "error").mockImplementationOnce(() => null);

interface IUnionFsWithReset extends Omit<IUnionFs, "use"> {
  fss: unknown;
  reset(): void;
  use(vol: unknown): this;
}

const unionedFs = fs as unknown as IUnionFsWithReset;

jest.mock(`fs`, () => {
  const realFs: typeof fs = jest.requireActual(`fs`);
  const unionfs = ufs as IUnionFsWithReset;
  unionfs.reset = () => {
    unionfs.fss = [realFs];
  };
  return unionfs.use(fs);
});

afterEach(() => {
  unionedFs.reset();
});

const commonExpect = (
  cwd: string,
  configLibs: Array<string>,
  libName: string,
  href?: string
) => {
  const result = libraries(cwd, configLibs);

  expect(result.length).toEqual(1);
  expect(result[0].isLocal).toEqual(true);
  expect(result[0].name).toEqual(libName);
  expect(result[0].components.length).toEqual(1);
  const [component] = result[0].components;

  expect(component.from).toEqual(libName);
  expect(component.href).toEqual(href || libName);
  expect(component.pathToSlice).toEqual(`./${libName}`);

  expect(component.infos.sliceName).toEqual("CallToAction");
  expect(component.infos.isDirectory).toEqual(true);

  expect(component.migrated).toEqual(false);
  return result;
};

const testPrefix = (prefix: string) => {
  const libName = "slices";
  unionedFs.use(
    Volume.fromJSON(
      {
        "slices/CallToAction/model.json": `${model}`,
        "slices/CallToAction/index.svelte": "const a = 1",
      },
      TMP
    )
  );

  const libs = [`${prefix}${libName}`];
  const result = commonExpect(TMP, libs, libName);
  const [component] = result[0].components;
  return component;
};

test("it finds slice in local library", () => {
  const libName = "slices";
  const prefix = "@/";
  unionedFs.use(
    Volume.fromJSON(
      {
        "slices/CallToAction/model.json": model,
      },
      TMP
    )
  );

  const libs = [`${prefix}${libName}`];
  const res = commonExpect(TMP, libs, libName);
  expect(res).toBeDefined();
});

test("it finds slice component in local library", () => {
  const component = testPrefix("@/");
  expect(component.infos.fileName).toEqual("index");
  expect(component.infos.extension).toEqual("svelte");
});

test("it finds slice component in ~ library", () => {
  const component = testPrefix("~/");
  expect(component.infos.fileName).toEqual("index");
  expect(component.infos.extension).toEqual("svelte");
});

test("it finds slice component in / library", () => {
  const component = testPrefix("/");
  expect(component.infos.fileName).toEqual("index");
  expect(component.infos.extension).toEqual("svelte");
});

test("it ignores non slice folders", () => {
  const libName = "~/slices";
  unionedFs.use(
    Volume.fromJSON(
      {
        "slices/NonSlice/ex.json": model,
        "slices/CallToAction1/model.json": model,
        "slices/CallToAction/something.else": "const a = 'a'",
      },
      TMP
    )
  );

  const result = libraries(TMP, [libName]);
  expect(result[0].components.length).toEqual(1);
});

test("it handles nested library info", () => {
  const libName = "slices/src/slices";
  unionedFs.use(
    Volume.fromJSON(
      {
        "slices/src/slices/CallToAction/model.json": model,
      },
      TMP
    )
  );
  const res = commonExpect(
    TMP,
    ["~/slices/src/slices"],
    libName,
    "slices--src--slices"
  );
  expect(res).toBeDefined();
});

test("it finds non local libs", () => {
  const libName = "vue-essential-slices";
  const pathToSlice = `node_modules/${libName}/slices/CallToAction/model.json`;
  unionedFs.use(
    Volume.fromJSON(
      {
        "package.json": "{}",
        [pathToSlice]: model,
      },
      TMP
    )
  );

  const result = libraries(TMP, [libName]);
  expect(result[0].isLocal).toEqual(false);
  expect(result[0].components[0].pathToSlice).toEqual(`${libName}/slices`);
});

test("it rejects invalid JSON models", () => {
  const libName = "vue-essential-slices";
  const pathToSlice = (slice: string) =>
    `node_modules/${libName}/slices/${slice}/model.json`;
  unionedFs.use(
    Volume.fromJSON(
      {
        "sm.json": `{ "apiEndpoint": "http://api.prismic.io/api/v2", "libraries": ["${libName}"] }`,
        "package.json": "{}",
        [pathToSlice("CallToAction")]: "const invalid = true",
        [pathToSlice("CallToAction2")]: model,
      },
      TMP
    )
  );

  const result = libraries(TMP, [libName]);
  expect(result[0].isLocal).toEqual(false);
  expect(result[0].components.length).toEqual(1);
});

test("it filters non existing libs", () => {
  unionedFs.use(
    Volume.fromJSON(
      {
        "package.json": "{}",
      },
      TMP
    )
  );

  const result = libraries(TMP, ["vue-essential-slices"]);
  expect(result).toEqual([]);
});