import React, { useContext, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import QueryManager from '../js/query-manager'

import { DataFilterContext } from '../stores/data-filter-store'
import { AppStatusContext } from '../stores/app-status-store'

const withQueryManager = (BaseComponent, queryKey, options) => ({ ...props }) => {
  const { state, updateQueryDataFilterCounts } = useContext(DataFilterContext)
  console.log('##### withQueryManager ', queryKey, state, options)
  const { loading, error, data } = useQuery(QueryManager.getQuery(queryKey, state, options), QueryManager.getVariables(queryKey, state, options))
  const { updateLoadingStatus, showErrorMessage } = useContext(AppStatusContext)

  useEffect(() => {
    if (data && data.counts && !loading) {
      updateQueryDataFilterCounts({
        counts: data.counts.aggregate
      })
    }
  }, [data])

  useEffect(() => {
    if (error) {
      console.log(error)
      showErrorMessage('We encountered a connection error retrieving the data. Check your internet connection and refresh your browser to try again.')
    }
  }, [error])

  useEffect(() => {
    updateLoadingStatus({ status: loading, message: 'Loading...' })
    return () => {
      if (loading) {
        updateLoadingStatus({ status: false, message: 'Loading...' })
      }
    }
  }, [loading])

  return (
    <>
      {!loading &&
        <BaseComponent data={(data && data.options) ? data.options : data} {...props} />
      }
    </>
  )
}

export default withQueryManager
