// useApi.ts — generic hook for making API calls
// Handles loading state and error state automatically
// Usage:
// const { data, loading, error, execute } = useApi(getBooksApi)

import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  execute: (...args: P) => Promise<T | null>
}

function useApi<T, P extends unknown[]>(
  apiFunction: (...args: P) => Promise<T>
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const result = await apiFunction(...args)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (err: any) {
        // Extract error message from API response
        const message =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          Object.values(err.response?.data || {})[0] ||
          'Something went wrong.'

        setState(prev => ({
          ...prev,
          loading: false,
          error: typeof message === 'string'
            ? message
            : JSON.stringify(message),
        }))
        return null
      }
    },
    [apiFunction]
  )

  return { ...state, execute }
}

export default useApi