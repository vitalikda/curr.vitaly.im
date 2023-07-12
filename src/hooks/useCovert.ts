import { useQuery } from '@tanstack/react-query'

export const useConvert = (
  params: { from: string; to: string; amount: string },
  enabled = true,
) => {
  return useQuery<{ date: string; rate: string; result: string }>(
    ['convert', params],
    async () => {
      const searchParams = new URLSearchParams(params).toString()
      return fetch(`/api/convert?${searchParams}`).then((res) => res.json())
    },
    {
      enabled: enabled && params.amount !== '0',
      refetchOnWindowFocus: false,
    },
  )
}
