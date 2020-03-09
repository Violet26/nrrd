import React, { useState } from 'react'

import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import Grid from '@material-ui/core/Grid'

import StackedBarChart from '../../data-viz/StackedBarChart/StackedBarChart'
import SectionHeader from '../../sections/SectionHeader'
import SectionControls from '../../sections/SectionControls'

import utils from '../../../js/utils'
import CONSTANTS from '../../../js/constants'

const TOGGLE_VALUES = {
  Year: 'year',
  Month: 'month'
}

const MONTHLY_DROPDOWN_VALUES = {
  Recent: 'recent',
  Fiscal: 'fiscal',
  Calendar: 'calendar'
}

const YEARLY_DROPDOWN_VALUES = {
  Fiscal: 'fiscal_year'
}

const TOTAL_DISBURSEMENTS_QUERY = gql`
  query TotalYearlyDisbursements {
    total_yearly_fiscal_disbursement2 {
      year,
      source,
      sum
    }   

    total_monthly_fiscal_disbursement2 {
      source
      sum
      month_long
      period_date
      month
     year
    }
    total_monthly_calendar_disbursement2 {
      source
      sum
      month_long
      period_date
      month
     year

  } 
     last_twelve_disbursement2 {
      source
      sum
      month_long
      period_date
      month
     year

  } 
  }
`

// TotalDisbursements
const TotalDisbursements = props => {
  // const classes = useStyles()
  const [period, setPeriod] = useState(YEARLY_DROPDOWN_VALUES.Fiscal)
  const [toggle, setToggle] = useState(TOGGLE_VALUES.Year)
  const toggleChange = value => {
    // console.debug('ON TOGGLE CHANGE: ', value)
    setToggle(value)
  }
  const menuChange = value => {
    // console.debug('ON Menu CHANGE: ', value)
    setPeriod(value)
  }

  const chartTitle = props.chartTitle || `${ CONSTANTS.DISBURSEMENTS } (dollars)`

  const { loading, error, data } = useQuery(TOTAL_DISBURSEMENTS_QUERY)
  if (loading) {
    return 'Loading...'
  }
  let chartData
  let xAxis = 'year'
  const yAxis = 'sum'
  const yGroupBy = 'source'
  const units = 'dollars'
  let xLabels

  if (error) return `Error! ${ error.message }`
  if (data) {
    console.debug(data)
    if (toggle === 'month') {
      if (period === 'fiscal') {
        chartData = data.total_monthly_fiscal_disbursement2
      }
      else if (period === 'calendar') {
        chartData = data.total_monthly_calendar_disbursement2
      }
      else {
        chartData = data.last_twelve_disbursement2
      }
      xAxis = 'month_long'
      xLabels = (x, i) => {
        // console.debug(x)
        return x.map(v => v.substr(0, 3))
      }
    }
    else {
      chartData = data.total_yearly_fiscal_disbursement2
      xLabels = (x, i) => {
        return x.map(v => '\'' + v.toString().substr(2))
      }
    }
  }

  return (
    <>
      <SectionHeader
        title="Disbursements"
        showExploreLink
      />
      <Grid container spacing={4}>
        <SectionControls
          onToggleChange={toggleChange}
          onMenuChange={menuChange}
          maxFiscalYear={2019}
          maxCalendarYear={2020}
          monthlyDropdownValues={MONTHLY_DROPDOWN_VALUES}
          toggleValues={TOGGLE_VALUES}
          yearlyDropdownValues={YEARLY_DROPDOWN_VALUES} />
        <Grid item xs>
          <StackedBarChart
            title={chartTitle}
            units={units}
            data={chartData}
            xAxis={xAxis}
            yAxis={yAxis}
            yGroupBy={yGroupBy}
            xLabels={xLabels}
            legendFormat={v => {
              return utils.formatToDollarInt(v)
            }}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default TotalDisbursements
