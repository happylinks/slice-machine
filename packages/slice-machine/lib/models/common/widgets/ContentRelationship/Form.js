import * as yup from "yup";
import Select from "react-select";
import { useContext } from "react";
import { Label, Box } from "theme-ui";

import { CustomTypesContext } from "src/models/customTypes/context";

import { DefaultFields } from "@lib/forms/defaults";

import WidgetFormField from "@lib/builders/common/EditModal/Field";

import { Col, Flex as FlexGrid } from "components/Flex";
import { createFieldNameFromKey } from "@lib/forms";

const FormFields = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  label: DefaultFields.label,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  id: DefaultFields.id,
  customtypes: {
    validate: () => yup.array().of(yup.string()),
  },
};

const WidgetForm = ({
  initialValues,
  values: formValues,
  fields,
  setFieldValue,
}) => {
  const { customTypes } = useContext(CustomTypesContext);

  // const { errors, Model, fieldType } = rest

  const options = customTypes.map((ct) => ({
    value: ct?.id,
    label: ct?.label,
  }));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const selectValues = formValues.config.customtypes.map((id) => {
    const ct = customTypes.find((e) => e && e.id === id);
    return { value: ct?.id, label: ct?.label };
  });

  return (
    <FlexGrid>
      {Object.entries(FormFields)
        .filter((e) => e[0] !== "customtypes")
        .map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={createFieldNameFromKey(key)}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              formField={field}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={fields}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              initialValues={initialValues}
            />
          </Col>
        ))}
      <Col>
        <Box
          sx={{
            mt: 2,
            alignItems: "center",
          }}
        >
          <Label htmlFor="origin" mb="1">
            Custom Types
          </Label>
          <Select
            isMulti
            name="origin"
            options={options}
            onChange={(v) => {
              if (v) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                setFieldValue(
                  "config.customtypes",
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  v.map(({ value }) => value)
                );
              }
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            value={selectValues}
            theme={(theme) => {
              return {
                ...theme,
                colors: {
                  ...theme.colors,
                  text: "text",
                  primary: "background",
                },
              };
            }}
          />
        </Box>
      </Col>
    </FlexGrid>
  );
};

export { FormFields };

export default WidgetForm;
