import React, { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'

// utility functions
import utils from '../../../../js/utils'
import * as d3 from 'd3'

import { DataFilterContext } from '../../../../stores/data-filter-store'
import { DATA_FILTER_CONSTANTS as DFC } from '../../../../constants'

import QueryLink from '../../../../components/QueryLink'

import { makeStyles } from '@material-ui/core/styles'
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  useTheme
} from '@material-ui/core'

import CircleChart from '../../../data-viz/CircleChart/CircleChart.js'

const APOLLO_QUERY = gql`
  query RevenueTopLocations($year: Int!, $locations: [String!], $period: String!,  $commodities: [String!]) {
    revenue_summary(
      where: {location_type: {_in: $locations}, year: { _eq: $year }, location_name: {_neq: ""}, period: {_eq: $period}, commodity: {_in: $commodities}  },
      order_by: {  total: desc }
    ) {
      location_name
      year
      location
      total
    }
  }
`
const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: '100%',
    width: '100%',
    margin: theme.spacing(1),
    '@media (max-width: 768px)': {
      maxWidth: '100%',
      margin: 0,
    }
  },
  progressContainer: {
    maxWidth: '25%',
    display: 'flex',
    '& > *': {
      marginTop: theme.spacing(3),
      marginRight: 'auto',
      marginLeft: 'auto',
    }
  },
  circularProgressRoot: {
    color: theme.palette.primary.dark,
  },
  topLocationsChart: {
    '& .chart-container': {
      display: 'flex',
      '@media (max-width: 426px)': {
        display: 'block',
        margin: 0,
      },
      '& .chart': {
        marginRight: theme.spacing(2),
        width: '70%',
        '@media (max-width: 426px)': {
          marginRight: 0,
          width: '100%',
        },
      },
    },
  }
}))

const RevenueTopLocations = props => {
  const classes = useStyles()
  const theme = useTheme()
  const { title } = props
  const { state: filterState } = useContext(DataFilterContext)
  const year = (filterState[DFC.YEAR]) ? filterState[DFC.YEAR] : 2019
  const location = (filterState[DFC.MAP_LEVEL]) ? filterState[DFC.MAP_LEVEL] : 'State'
  const period = (filterState[DFC.PERIOD]) ? filterState[DFC.PERIOD] : 'Fiscal Year'
  const offshore = (filterState[DFC.OFFSHORE_REGIONS]) ? filterState[DFC.COUNTIES] : 'Hide'
  const commodities = (filterState[DFC.COMMODITY]) ? filterState[DFC.COMMODITY].split(',') : undefined
  const commodityKey = (filterState[DFC.COMMODITY]) ? filterState[DFC.COMMODITY] : 'all'
  const locations = ['State', 'Offshore', 'Native American']
  if (offshore !== 'Hide') {
    locations.push('Offshore')
  }
  if (location === 'State') {
    locations.push('Native American')
  }
  const { loading, error, data } = useQuery(APOLLO_QUERY, { variables: { year, locations, period, commodities } })

  if (loading) {
    return (
      <div className={classes.progressContainer}>
        <CircularProgress classes={{ root: classes.circularProgressRoot }} />
      </div>
    )
  }
  if (error) return `Error! ${ error.message }`

  let chartData = []
  const dataSet = (period === 'Fiscal Year') ? `FY ${ year }` : `CY ${ year }`

  if (data) {
    // chartData = data.revenue_summary
    chartData = d3.nest()
      .key(k => k.location_name)
      .rollup(v => d3.sum(v, i => i.total))
      .entries(data.revenue_summary)
      .map(d => {
        return ({ location_name: d.key, total: d.value })
      }).sort((a, b) => (a.total < b.total) ? 1 : -1)
    console.debug('------------------------------------------------->', chartData)
    return (
      <Container id={utils.formatToSlug(title)}>
        <Grid container>
          <Grid item xs={12}>
            <Box color="secondary.main" mt={5} mb={2} borderBottom={2} display="flex" justifyContent="space-between">
              <Box component="h3" color="secondary.dark" display="inline">{title}</Box>
              <Box display={{ xs: 'none', sm: 'inline' }} align="right" position="relative" top={5}>
                <QueryLink
                  groupBy={DFC.STATE_OFFSHORE_NAME}
                  linkType="FilterTable" {...props}>
                Query nationwide revenue
                </QueryLink>
              </Box>
            </Box>
            <Box display={{ xs: 'block', sm: 'none' }} align="left">
              <QueryLink
                groupBy={DFC.STATE_OFFSHORE_NAME}
                linkType="FilterTable" {...props}>
                Query nationwide revenue
              </QueryLink>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className={classes.root}>
              <Box className={classes.topLocationsChart}>
                <CircleChart
                  key ={`RTL${ dataSet }${ commodityKey }`}
                  data={chartData}
                  maxLegendWidth='800px'
                  xAxis='location_name'
                  yAxis='total'
                  format={ d => utils.formatToDollarInt(d) }
                  circleLabel={
                    d => {
                      // console.debug('circleLABLE: ', d)
                      const r = []
                      r[0] = d.location_name
                      if (r[0] === 'Native American') {
                        r[0] = 'Native American lands'
                      }
                      else if (r[0] === 'Gulf of Mexico, Central Gulf of Mexico') {
                        r[0] = 'Central Gulf'
                      }
                      else if (r[0] === 'Gulf of Mexico, Western Gulf of Mexico') {
                        r[0] = 'Western Gulf'
                      }

                      r[1] = utils.formatToDollarInt(d.total)
                      return r
                    }
                  }
                  legendLabel={
                    d => {
                      if (d === 'Native American') {
                        d = 'Native American lands'
                      }
                      return d
                    }
                  }
                  yLabel={dataSet}
                  maxCircles={6}
                  colorRange={[
                    theme.palette.explore[600],
                    theme.palette.explore[500],
                    theme.palette.explore[400],
                    theme.palette.explore[300],
                    theme.palette.explore[200],
                    theme.palette.explore[100]
                  ]} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    )
  }
  else {
    return null
  }
}

export default RevenueTopLocations

RevenueTopLocations.propTypes = {
  title: PropTypes.string
}
