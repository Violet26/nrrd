import React, { useContext } from 'react'

import { DataFilterContext } from '../../../stores/data-filter-store'
import { DATA_FILTER_CONSTANTS as DFC } from '../../../constants'

import {
  Box
} from '@material-ui/core'

const Product = () => {
  const { state: filterState } = useContext(DataFilterContext)
  const product = filterState.commodity
  return (
    <Box component="span">
      {product}
    </Box>
  )
}

export default Product