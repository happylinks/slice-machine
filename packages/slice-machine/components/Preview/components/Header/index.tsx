import router from "next/router";
import { Box, Text, Flex, Button } from "theme-ui";
import * as Models from "@slicemachine/core/build/src/models";

import VarationsPopover from "lib/builders/SliceBuilder/Header/VariationsPopover";
import * as Links from "lib/builders/SliceBuilder/links";

import SliceState from "lib/models/ui/SliceState";

import ScreenSizes, { Size } from "../ScreenSizes";

type PropTypes = {
  title: string;
  Model: SliceState;
  variation: Models.VariationAsArray | undefined;
  handleScreenSizeChange: (screen: { size: Size }) => void;
  canvasUrl: string;
  size: Size;
};

const redirect = (
  model: SliceState,
  variation: { id: string } | undefined,
  isPreview?: boolean
): void => {
  if (!variation) {
    router.push(`/${model.href}/${model.infos.sliceName}`);
    return;
  }
  const params = Links.variation({
    lib: model.href,
    sliceName: model.infos.sliceName,
    variationId: variation?.id,
    isPreview,
  });
  router.push(params.href, params.as, params.options);
};

const Header: React.FunctionComponent<PropTypes> = ({
  title,
  Model,
  variation,
  handleScreenSizeChange,
  canvasUrl,
  size,
}) => {
  return (
    <Box
      sx={{
        p: 3,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "1fr",
        borderBottom: "1px solid #F1F1F1",
      }}
    >
      <Flex
        sx={{
          alignItems: "center",
        }}
      >
        <Text mr={2}>{title}</Text>
        {Model.variations.length > 1 ? (
          <VarationsPopover
            buttonSx={{ p: 1 }}
            defaultValue={variation}
            variations={Model.variations}
            onChange={(v) => redirect(Model, v, true)}
          />
        ) : null}
      </Flex>
      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <ScreenSizes size={size} onClick={handleScreenSizeChange} />
      </Flex>
      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "end",
        }}
      >
        <p>{canvasUrl}</p>
        <Button ml={2} onClick={() => redirect(Model, variation)}>
          Leave
        </Button>
      </Flex>
    </Box>
  );
};

export default Header;