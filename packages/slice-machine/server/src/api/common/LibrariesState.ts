import Environment from "@lib/models/common/Environment";
import type { Models } from "@slicemachine/core";
import Files from "@slicemachine/core/build/src/utils/files";
import { FileSystem, Libraries } from "@slicemachine/core";
import probe from "probe-image-size";

const DEFAULT_IMAGE_DIMENSIONS = {
  width: undefined,
  height: undefined,
};

export function generateState(env: Environment): void {
  const libraries = (env.userConfig.libraries || [])
    .map((lib) => Libraries.handleLibraryPath(env.cwd, lib))
    .filter(Boolean) as ReadonlyArray<Models.Library.Library>;

  const state = formatLibraries(libraries);
  Files.write(FileSystem.LibrariesStatePath(env.cwd), state);
}

export function formatLibraries(
  libraries: ReadonlyArray<Models.Library.Library>
): Models.LibrariesState.Libraries {
  const t = libraries.reduce((acc, library) => {
    return { ...acc, [library.name]: formatLibrary(library) };
  }, {});
  return t;
}

export function formatLibrary(
  library: Models.Library.Library
): Models.LibrariesState.Library {
  return library.components.reduce(
    (acc, component) => ({
      ...acc,
      [component.model.id]: formatComponent(component),
    }),
    {}
  );
}

function getImageDimensions(imagePath: string | undefined) {
  if (!imagePath || !Files.exists(imagePath)) return DEFAULT_IMAGE_DIMENSIONS;

  const imageBuffer = Files.readBuffer(imagePath);
  const result = probe.sync(imageBuffer);

  if (!result) return DEFAULT_IMAGE_DIMENSIONS;

  return { width: result.width, height: result.height };
}

export function formatComponent(
  slice: Models.Library.Component
): Models.LibrariesState.Component {
  return {
    library: slice.from,
    id: slice.model.id,
    name: slice.infos.meta.name,
    description: slice.infos.meta.description,
    model: slice.model,
    mocks: (
      slice.infos.mock || []
    ).reduce<Models.LibrariesState.ComponentMocks>(
      (acc, variationMock) => ({
        ...acc,
        [variationMock.variation]: variationMock,
      }),
      {}
    ),
    meta: {
      fileName: slice.infos.fileName,
      isDirectory: slice.infos.isDirectory,
      extension: slice.infos.extension,
    },
    previewUrls: !slice.infos.previewUrls
      ? {}
      : Object.entries(
          slice.infos.previewUrls
        ).reduce<Models.LibrariesState.ComponentPreviews>(
          (acc, [variationId, preview]) => {
            return {
              ...acc,
              [variationId]: {
                hasPreview: preview.hasPreview,
                path: preview.path,
                ...getImageDimensions(preview.path),
              },
            };
          },
          {}
        ),
  };
}