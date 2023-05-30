import type { NextRequest } from 'next/server'
import * as z from 'zod'
import { currencies } from '../../constants/currencies'

interface ConvertResponse {
  success: boolean
  date: string
  historical: boolean
  query: { from: string; to: string; amount: number }
  info: { rate: number }
  result: number
}

export const config = {
  runtime: 'edge'
}

const API_URL = process.env.CURRENCY_API_URL as string

const codes = currencies.map((currency) => currency.code)

const currencyCodeSchema = z.string().refine((code) => {
  return codes.includes(code.toUpperCase())
}, 'Invalid currency code')

const formDataSchema = z
  .object({
    from: currencyCodeSchema,
    to: currencyCodeSchema,
    amount: z
      .string()
      .min(1)
      .refine((value) => {
        return !isNaN(Number(value))
      }, 'Value should be a valid number')
  })
  .refine((data) => {
    return data.from !== data.to
  }, 'Query currency must be different from base currency')

export default async function handler(req: NextRequest) {
  const parsed = formDataSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    })
  }

  const url = new URL(`${API_URL}/convert`)
  const params = new URLSearchParams(parsed.data)
  url.search = params.toString()

  const response = await fetch(url.toString())
  const data = (await response.json()) as ConvertResponse

  if (!data.success) {
    return new Response(JSON.stringify(data), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    })
  }

  return new Response(
    JSON.stringify({
      date: data.date,
      rate: data.info.rate,
      result: data.result
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' }
    }
  )
}
