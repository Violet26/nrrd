import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import Grid from '@material-ui/core/Grid'

import StackedBarChart from '../../data-viz/StackedBarChart/StackedBarChart'
import SectionHeader from '../../sections/SectionHeader'
import SectionControls from '../../sections/SectionControls'

import utils from '../../../js/utils'

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
  Fiscal: 'fiscal_year',
  Calendar: 'calendar_year'
}

const TOTAL_PRODUCTION_QUERY = gql`
  query TotalYearlyProduction {
    total_yearly_fiscal_production2 {
      product,
      year,
      source,
      sum
    }   

    total_yearly_calendar_production2 {
      product,
      year,
      source,
      sum
    }   

    total_monthly_fiscal_production2 {
      source
     product
      sum
      month_long
      period_date
      month
     year
    }
    total_monthly_calendar_production2 {
      source
     product
      sum
      month_long
      period_date
      month
     year

  } 
     last_twelve_production2 {
      source
      product
      sum
      month_long
      period_date
      month
     year

  } 
  }
`

// TotalProduction
const TotalProduction = props => {

  const [period, setPeriod] = useState(YEARLY_DROPDOWN_VALUES.Fiscal)
  const [toggle, setToggle] = useState(TOGGLE_VALUES.Year)
  const [selected, setSelected] = useState(9)

  const toggleChange = value => {
    // console.debug('ON TOGGLE CHANGE: ', value)
    setToggle(value)
  }
  const menuChange = value => {
    // console.debug('ON Menu CHANGE: ', value)
    setPeriod(value)
  }

  const handleSelect = value => {
    // console.debug('handle select CHANGE: ', value)
    setSelected(value.selectedIndex)
  }

  const { loading, error, data } = useQuery(TOTAL_PRODUCTION_QUERY)
  if (loading) {
    return 'Loading...'
  }
  let chartData
  let xAxis = 'year'
  const yAxis = 'sum'
  const yGroupBy = 'source'
  let xLabels

  if (loading) {
    return 'Loading...'
  }

  if (error) return `Error! ${ error.message }`
  if (data) {
    // console.debug(data)
    if (toggle === 'month') {
      if (period === 'fiscal') {
        chartData = data.total_monthly_fiscal_production2
      }
      else if (period === 'calendar') {
        chartData = data.total_monthly_calendar_production2
      }
      else {
        chartData = data.last_twelve_production2
      }
      xAxis = 'month_long'
      xLabels = (x, i) => {
        // console.debug(x)
        return x.map(v => v.substr(0, 3))
      }
    }
    else {
      console.debug('fffffffffffffffffffffffffffffffffffffffffffffffffffiscal', period)
      if (period === 'fiscal_year') {
        chartData = data.total_yearly_fiscal_production2
      }
      else {
        chartData = data.total_yearly_calendar_production2
      }
      console.debug(chartData)
      xLabels = (x, i) => {
        return x.map(v => '\'' + v.toString().substr(2))
      }
    }
  }

  return (
    <>
      <SectionHeader
        title="Production"
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
        <Grid item xs={12} md={4}>
          <StackedBarChart
            title={'Oil (bbl)'}
            data={chartData.filter(row => row.product === 'Oil (bbl)')}
            xAxis={xAxis}
            yAxis={yAxis}
            yGroupBy={yGroupBy}
            xLabels={xLabels}
            legendFormat={v => {
              return utils.formatToCommaInt(v)
            }}
            onSelect={ d => {
              console.log('handle select', d)
              return handleSelect(d)
            }
            }
            selectedIndex={selected}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StackedBarChart
            title={'Gas (mcf)'}
            data={chartData.filter(row => row.product === 'Gas (mcf)')}
            xAxis={xAxis}
            yAxis={yAxis}
            yGroupBy={yGroupBy}
            xLabels={xLabels}
            legendFormat={v => {
              return utils.formatToCommaInt(v)
            }}
            onSelect={ d => {
              console.log('handle select', d)
              return handleSelect(d)
            }
            }
            selectedIndex={selected}

          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StackedBarChart
            title={'Coal (tons)'}
            data={chartData.filter(row => row.product === 'Coal (tons)')}
            xAxis={xAxis}
            yAxis={yAxis}
            yGroupBy={yGroupBy}
            xLabels={xLabels}
            legendFormat={v => {
              return utils.formatToCommaInt(v)
            }}
            onSelect={ d => {
              console.log('handle select', d)
              return handleSelect(d)
            }
            }
            selectedIndex={selected}

          />

        </Grid>
      </Grid>
    </>
  )
}

export default TotalProduction
