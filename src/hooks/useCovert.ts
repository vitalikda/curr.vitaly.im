import { useQuery } from '@tanstack/react-query'

export const useConvert = (params: { from: string; to: string; amount: string }, enabled = true) => {
  return useQuery<{ date: string; rate: string; result: string }>(
    ['convert', params],
    () => fetch(`/api/convert?${new URLSearchParams(params).toString()}`).then((res) => res.json()),
    {
      enabled: enabled && params.amount !== '0',
      refetchOnWindowFocus: false
    }
  )
}
