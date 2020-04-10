import React, { useState, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import { makeStyles, useTheme } from '@material-ui/core/styles'
import {
  Container,
  Grid,
  Box,
  useMediaQuery
} from '@material-ui/core'

import Map from '../../../data-viz/Map'

import { StoreContext } from '../../../../store'

import mapCounties from '../counties.json'
import mapStates from '../states.json'
import mapCountiesOffshore from '../counties-offshore.json'
import mapStatesOffshore from '../states-offshore.json'

import CONSTANTS from '../../../../js/constants'


const REVENUE_QUERY = gql`
  query FiscalRevenue($year: Int!, $period: String!) {
    fiscal_revenue_summary(where: {state_or_area: {_nin: ["Nationwide Federal", ""]}, fiscal_year: { _eq: $year }}) {
      fiscal_year
      state_or_area
      sum
    }

    # period query
    period(where: {period: {_ilike: $period }}) {
      fiscal_year
    }
  }
`

export default props => {
  const { state, dispatch } = useContext(StoreContext)

  const [mapX, setMapX] = useState()
  const [mapY, setMapY] = useState()
  const [mapK, setMapK] = useState(0.25)

  let x = mapX
  let y = mapY
  let k = mapK

  /*
  const {
    cardMenuItems,
    closeCard,
    onLink,
    onYear,
    setZoom
  } = props.exploreDataProps
*/
  const cards = state.cards
  const countyLevel = state.countyLevel === 'County'
  const offshore = state.offshoreData === 'On'
  const year = state.year
  const dataType = state.dataType



  const theme = useTheme()
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'))
  const matchesMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const { loading, error, data } = useQuery(REVENUE_QUERY, {
    variables: { year, period: CONSTANTS.FISCAL_YEAR }
  })

  const cardCountClass = () => {
    switch (cards.length) {
    case 2:
      return 'cards-2'
    case 3:
      return 'cards-3'
    case 4:
      return 'cards-4'
    default:
      return 'cards-1'
    }
  }

  const handleChange = (type, name) => event => {
    setZoom(x, y, k)
    return dispatch({ type: type, payload: { [name]: event.target.checked } })
  }

  const handleClick = val => {
    if (val === 'add' && k >= 0.25) {
      k = k + 0.25
      x = x - 100
    }
    if (val === 'remove' && k >= 0.25) {
      k = k - 0.25
      x = x + 100
    }
    if (val === 'refresh') {
      k = 0.25
      x = 0
      y = 0
    }
    setZoom(x, y, k)
  }

  let mapJsonObject = mapStates
  let mapFeatures = 'states-geo'

  if (countyLevel) {
    if (offshore) {
      mapJsonObject = mapCountiesOffshore
      mapFeatures = 'counties-offshore-geo'
    }
    else {
      mapJsonObject = mapCounties
      mapFeatures = 'counties-geo'
    }
  }
  else {
    if (offshore) {
      mapJsonObject = mapStatesOffshore
      mapFeatures = 'states-offshore-geo'
    }
    else {
      mapJsonObject = mapStates
      mapFeatures = 'states-geo'
    }
  }
    // onLink
  const onLink = (state, x, y, k) => {
    setMapK(k)
    setMapY(y)
    setMapX(x)

    let fips = state.properties ? state.properties.FIPS : state.fips
    const name = state.properties ? state.properties.name : state.name
    if (fips === undefined) {
      fips = state.id
    }
    let stateAbbr
    let abbr

    if (fips && fips.length > 2) {
      abbr = fips
      stateAbbr = state.properties.state ? state.properties.state : state.properties.region
    }
    else {
      abbr = state.properties ? state.properties.abbr : state.abbr
      stateAbbr = state.properties ? state.properties.abbr : state.abbr
    }

    const stateObj = {
      fips: fips,
      abbr: abbr,
      name: name,
      state: stateAbbr
    }

    if (
      cards.filter(item => item.fips === fips).length === 0
    ) {
      if (cards.length <= MAX_CARDS) {
        if (stateObj.abbr && stateObj.abbr.match(/Nationwide Federal/)) {
          cards.unshift(stateObj)
        }
        else {
          cards.push(stateObj)
        }
      }
      else {
        handleSnackbar({ vertical: 'bottom', horizontal: 'center' })
        setSnackbarState({ ...snackbarState, open: false })
      }
    }
    return dispatch({ type: 'CARDS', payload: { cards: cards } })
  }

  const closeCard = (fips, x, y, k) => {
    setMapK(k)
    setMapY(y)
    setMapX(x)
    dispatch({ type: 'CARDS', payload: { cards: cards.filter(item => item.fips !== fips) } })
  }

  // onYear
  const onYear = (selected, x, y, k) => {
    setMapK(k)
    setMapY(y)
    setMapX(x)
    dispatch({ type: 'YEAR', payload: { year: selected } })
  }

  // setZoom
  const setZoom = (x, y, k) => {
    setMapY(y)
    setMapX(x)
    setMapK(k)
  }

  // card Menu Item for adding/removing Nationwide Federal or Native American cards
  const nationalCard = cards && cards.some(item => item.abbr === 'Nationwide Federal')
  const nativeAmericanCard = cards && cards.some(item => item.abbr === 'Native American')
  let cardMenuItems = []

  if (!nationalCard) {
    cardMenuItems = [{ fips: 99, abbr: 'Nationwide Federal', name: 'Nationwide Federal', label: 'Add Nationwide Federal card' }]
  }

  if (!nativeAmericanCard) {
    cardMenuItems = [{ fips: undefined, abbr: 'Native American', name: 'Native American', label: 'Add Native American card' }]
  }

  if (!nationalCard && !nativeAmericanCard) {
    cardMenuItems = [{ fips: 99, abbr: 'Nationwide Federal', name: 'Nationwide Federal', label: 'Add Nationwide Federal card' }, { fips: undefined, abbr: 'Native American', name: 'Native American', label: 'Add Native American card' }]
  }


  let mapData = [[]]

  if (loading) {}
  if (error) return `Error! ${ error.message }`
  if (data) {
    mapData = data.fiscal_revenue_summary.map((item, i) => [
      item.state_or_area,
      item.sum
    ])


  }

  console.debug("Map props", props) 
  return (
    <>
      {mapData &&
        <> <Map
               mapFeatures={props.mapFeatures}
               mapJsonObject={props.mapJsonObject}
               mapData={mapData}
               minColor={props.minColor}
               maxColor={props.maxColor}
               mapZoom={props.mapK}
               mapX={props.mapX}
               mapY={props.mapY}
               onZoomEnd={props.onZoomEnd}
               onClick={props.onClick}
               />
          </>
        }
    </>
  )
}