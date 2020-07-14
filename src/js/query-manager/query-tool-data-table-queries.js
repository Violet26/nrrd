
import {
  REVENUE,
  PRODUCTION,
  DISBURSEMENT,
  LOCATION_NAME,
  LAND_TYPE,
  REGION_TYPE,
  DISTRICT_TYPE,
  OFFSHORE_REGION,
  US_STATE,
  COUNTY,
  COMMODITY,
  PRODUCT,
  REVENUE_TYPE,
  PERIOD,
  RECIPIENT,
  SOURCE,
  SINGLE,
  MULTI,
  ALL_REVENUE_YEARS,
  DATA_TYPE,
  STATE_OFFSHORE_NAME
} from '../../constants'
import gql from 'graphql-tag'

// Helper functions for using a variable config to create the vairable list and values
import { getDataFilterVariableValues, getDataFilterVariableList } from './index'

/**
 * This file defines the queries used for the data table for the query tool.
 */

// STEP 1: Define all the queries needed
const REVENUE_QUERY = () => `
  results:query_tool_revenue_data(
    where: {
      state: {_in: $${ US_STATE }},
      county: {_in: $${ COUNTY }},
      land_type: {_in: $${ LAND_TYPE }},
      offshore_region: {_in: $${ OFFSHORE_REGION }},
      commodity: {_in: $${ COMMODITY }},
      revenue_type: {_in: $${ REVENUE_TYPE }},
      period: {_eq: $${ PERIOD }},
      state_offshore_name: {_in: $${ STATE_OFFSHORE_NAME }},
    }) {
    ${ LOCATION_NAME }: location_name  
    ${ LAND_TYPE }: land_type
    ${ REGION_TYPE }: region_type
    ${ DISTRICT_TYPE }: district_type
    ${ OFFSHORE_REGION }: offshore_region,
    ${ US_STATE }: state_name
    ${ COUNTY }: county_name
    ${ REVENUE_TYPE }: revenue_type
    ${ COMMODITY }: commodity
    ${ ALL_REVENUE_YEARS }
  }`

const PRODUCTION_QUERY = () => `
  results:query_tool_production_data(
    where: {
      state: {_in: $${ US_STATE }},
      county: {_in: $${ COUNTY }},
      land_type: {_in: $${ LAND_TYPE }},
      offshore_region: {_in: $${ OFFSHORE_REGION }},
      commodity: {_in: $${ COMMODITY }},
      product: {_in: $${ PRODUCT }},
      period: {_eq: $${ PERIOD }},
      state_offshore_name: {_in: $${ STATE_OFFSHORE_NAME }},
    }) {
    ${ LOCATION_NAME }: location_name  
    ${ LAND_TYPE }: land_type
    ${ REGION_TYPE }: region_type
    ${ DISTRICT_TYPE }: district_type
    ${ OFFSHORE_REGION }: offshore_region
    ${ US_STATE }: state_name
    ${ COUNTY }: county_name
    ${ PRODUCT }: product
    ${ ALL_REVENUE_YEARS }
  }`

const DISBURSEMENT_QUERY = () => `
  results:query_tool_disbursement_data(
    where: {
      recipient: {_in: $${ RECIPIENT }},
      source: {_in: $${ SOURCE }},
      state: {_in: $${ US_STATE }},
      county: {_in: $${ COUNTY }},
      period: {_eq: $${ PERIOD }},
      state_offshore_name: {_in: $${ STATE_OFFSHORE_NAME }},
    }) {
    ${ RECIPIENT }: recipient
    ${ SOURCE }: source
    ${ US_STATE }: state_name
    ${ COUNTY }: county_name
    ${ ALL_REVENUE_YEARS }
  }`

// STEP 2: Define the function to get the variables for the query. A variable config plus helper functions can be used

// This is a simple data filter variable config that specifies whihc variables are used by the query and the type
const VARIABLE_CONFIGS = {
  [REVENUE]: [
    { [LAND_TYPE]: MULTI },
    { [OFFSHORE_REGION]: MULTI },
    { [US_STATE]: MULTI },
    { [COUNTY]: MULTI },
    { [COMMODITY]: MULTI },
    { [REVENUE_TYPE]: MULTI },
    { [STATE_OFFSHORE_NAME]: MULTI },
    { [PERIOD]: SINGLE },
  ],
  [PRODUCTION]: [
    { [LAND_TYPE]: MULTI },
    { [OFFSHORE_REGION]: MULTI },
    { [US_STATE]: MULTI },
    { [COUNTY]: MULTI },
    { [COMMODITY]: MULTI },
    { [PRODUCT]: MULTI },
    { [STATE_OFFSHORE_NAME]: MULTI },
    { [PERIOD]: SINGLE },
  ],
  [DISBURSEMENT]: [
    { [RECIPIENT]: MULTI },
    { [SOURCE]: MULTI },
    { [US_STATE]: MULTI },
    { [COUNTY]: MULTI },
    { [STATE_OFFSHORE_NAME]: MULTI },
    { [PERIOD]: SINGLE },
  ],
}
export const getVariables = (state, options) => getDataFilterVariableValues(state, VARIABLE_CONFIGS[state[DATA_TYPE]])

// STEP 3: Define the functions to return the proper query based of the state
/**
 * Get the queries based on data type and the data filter option
 */
export const getQuery = (state, options) => QUERIES[state[DATA_TYPE]](state, options)
const QUERIES = {
  [REVENUE]: (state, options) =>
    gql`query GetDataTableRevenue(${ getDataFilterVariableList(state, VARIABLE_CONFIGS[state[DATA_TYPE]]) }){${ REVENUE_QUERY() }}`,
  [PRODUCTION]: (state, options) =>
    gql`query GetDataTableProduction(${ getDataFilterVariableList(state, VARIABLE_CONFIGS[state[DATA_TYPE]]) }){${ PRODUCTION_QUERY() }}`,
  [DISBURSEMENT]: (state, options) =>
    gql`query GetDataTableProduction(${ getDataFilterVariableList(state, VARIABLE_CONFIGS[state[DATA_TYPE]]) }){${ DISBURSEMENT_QUERY() }}`,
}