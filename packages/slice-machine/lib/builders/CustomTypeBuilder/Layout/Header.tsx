import { CustomTypeState } from '../../../models/ui/CustomTypeState'

import { Box, Button, Heading, Flex } from 'theme-ui'

import CustomTypeStore from '../../../../src/models/customType/store'


import FlexWrapper from './FlexWrapper'

const Header = ({ Model, store }: { Model: CustomTypeState, store: CustomTypeStore }) => {
  const buttonProps = (() => {
    if (Model.isTouched) {
      return { onClick: () => store.save(Model), children: 'Save Custom Type' }
    }
    return { onClick: () => store.save(Model), children: 'Push to Prismic' }
  })()

  return (
    <Box sx={{ bg: 'backgroundClear' }}>
      <FlexWrapper
        sx={{
          py: 4,
        }}
      >

        <Box
          as="section"
          sx={{
            flexGrow: 99999,
            flexBasis: 0,
            minWidth: 320,
          }}
        >
          <Heading>Templates <Box
            as="span"
            sx={{
              fontWeight: '400'
            }}
          >/ {Model.label}</Box></Heading>
        </Box>
        <Button {...buttonProps} />
      </FlexWrapper>
    </Box>
  )
}

export default Header
