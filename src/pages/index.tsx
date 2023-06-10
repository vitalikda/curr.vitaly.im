import * as React from 'react'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useLocalStorage } from 'usehooks-ts'

import { currencies } from '../constants/currencies'
import { debounce, formatCurrency, getCurrencySymbol } from '../utils'
import { CheckIcon, ConvertIcon, SearchIcon } from '../icons'
import { Drawer } from '../components'

const inter = Inter({ subsets: ['latin'] })

const meta = {
  title: 'Curr Converter',
  description: 'Track your currency conversion rates with ease.'
}

const CurrSelector = ({ code, onSelect }: { code: string; onSelect: (code: string) => void }) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filteredCurrencies = currencies.filter((currency) => {
    const s = search.toLowerCase()
    return currency.code.toLowerCase().includes(s) || currency.name.toLowerCase().includes(s)
  })

  const handleSelect = (code: string) => {
    onSelect(code)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className='relative flex items-center justify-center w-20 h-20 text-white border-2 border-black aspect-square rounded-2xl bg-slate-900 group-focus-within:bg-pink-500'>
      <button onClick={() => setOpen(true)} className='text-2xl'>
        {getCurrencySymbol(code)}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <div className='flex flex-col gap-1'>
          <div className='relative'>
            <input
              type='text'
              className='w-full px-4 py-2 text-white bg-transparent border-2 border-black rounded-lg focus:border-pink-500 focus:ring-0'
              placeholder='Search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none'>
              <SearchIcon className='w-6 h-6' />
            </div>
          </div>
          {filteredCurrencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency.code)}
              className='flex items-center justify-between w-full px-4 py-2 text-left text-white rounded-lg hover:bg-slate-900 focus:bg-slate-900'
            >
              <span>
                {currency.code} — {currency.name}
              </span>
              {currency.code === code && (
                <span className='flex items-center justify-center w-6 h-6 text-white bg-pink-500 rounded-full'>
                  <CheckIcon className='w-4 h-4' />
                </span>
              )}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  )
}

const CurrInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => {
  return (
    <fieldset className='relative flex items-center h-20 px-4 text-white border-2 border-black rounded-2xl bg-slate-900 group-focus-within:bg-pink-500'>
      <label htmlFor={label} className='absolute z-10 capitalize'>
        {label}
      </label>
      <input
        id={label}
        type='text'
        value={value}
        className='block w-full pl-16 text-2xl text-right bg-transparent border-transparent focus:border-transparent focus:bg-transparent focus:ring-0'
        onChange={(e) => onChange(e.target.value)}
      />
    </fieldset>
  )
}

const initialState = {
  base: 'a',
  a: { code: 'USD', value: '0' },
  b: { code: 'EUR', value: '0' }
}
type State = typeof initialState

const reducer = (state: State, action: { type: string; payload: State['a'] }) => {
  switch (action.type) {
    case 'SET_A':
      return { ...state, base: 'a', a: action.payload }
    case 'UPDATE_A':
      return { ...state, a: action.payload }
    case 'SET_B':
      return { ...state, base: 'b', b: action.payload }
    case 'UPDATE_B':
      return { ...state, b: action.payload }
    default:
      return state
  }
}

const fetcher = debounce((url: string) => fetch(url).then((res) => res.json()), 500)

const convert = async (
  from: string,
  to: string,
  amount: string
): Promise<{ date: string; rate: string; result: string } | undefined> => {
  try {
    const data = await fetcher(`/api/convert?from=${from}&to=${to}&amount=${amount}`)
    if (data.name === 'ZodError') throw new Error('Invalid input')
    if (!data.result) throw new Error('No result')
    return data
  } catch (error) {
    console.log(error)
  }
}

export default function Home() {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [history, setHistory] = useLocalStorage<
    {
      date: string
      rate: string
      from: State['a']
      to: State['a']
    }[]
  >('curr-history', [])

  React.useEffect(() => {
    if (state.base === 'a' && state.a.value !== '0') {
      convert(state.a.code, state.b.code, state.a.value).then((data) => {
        if (data) {
          const { date, rate, result } = data
          const payload = { ...state.b, value: result }
          dispatch({ type: 'UPDATE_B', payload })
          setHistory((prev) => [...prev, { date, rate, from: state.a, to: payload }])
        }
      })
    }
    if (state.base === 'b' && state.b.value !== '0') {
      convert(state.b.code, state.a.code, state.b.value).then((data) => {
        if (data) {
          const { date, rate, result } = data
          const payload = { ...state.a, value: result }
          dispatch({ type: 'UPDATE_A', payload })
          setHistory((prev) => [...prev, { date, rate, from: state.b, to: payload }])
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.a.code, state.a.value, state.b.code, state.b.value])

  return (
    <>
      <Head>
        <link rel='icon' href='/favicon.ico' />
        <title key='title'>{meta.title}</title>
        <meta name='description' content={meta.description} />
      </Head>
      <main className={inter.className}>
        <div className='flex flex-col items-center justify-between min-h-screen md:py-12 md:px-24'>
          <div className='flex flex-col gap-4 max-w-lg min-h-[100svh] md:max-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-6rem)] px-2 pt-2 bg-black md:pt-6 md:px-6 md:rounded-xl md:border border-slate-900 overflow-auto no-scrollbar'>
            <div className='py-4 text-center'>
              <h1 className='text-lg text-white'>Converter</h1>
            </div>
            <div className='relative flex flex-col'>
              <div className='absolute z-20 bg-black border border-black rounded-full top-[3.75rem] left-[3.75rem]'>
                <ConvertIcon className='text-white' />
              </div>
              <div className='flex group'>
                <CurrSelector
                  code={state.a.code}
                  onSelect={(code) => dispatch({ type: 'SET_A', payload: { ...state.a, code } })}
                />
                <CurrInput
                  label={state.base === 'a' ? 'from' : 'to'}
                  value={state.a.value}
                  onChange={(value) => dispatch({ type: 'SET_A', payload: { ...state.a, value } })}
                />
              </div>
              <div className='flex group'>
                <CurrSelector
                  code={state.b.code}
                  onSelect={(code) => dispatch({ type: 'SET_B', payload: { ...state.b, code } })}
                />
                <CurrInput
                  label={state.base === 'b' ? 'from' : 'to'}
                  value={state.b.value}
                  onChange={(value) => dispatch({ type: 'SET_B', payload: { ...state.b, value } })}
                />
              </div>
            </div>
            <div className='flex flex-1'>
              {!!history.length && (
                <div className='w-full py-2 mt-auto bg-slate-900 rounded-t-xl'>
                  <div className='w-20 h-1 mx-auto my-2 bg-black rounded-full' />
                  <div className='flex flex-col-reverse space-y-1'>
                    {history.map((item, i) => (
                      <button
                        key={`${i}-${item.date}`}
                        className='w-full px-4 py-1 text-left hover:bg-black/20'
                        onClick={() => {
                          dispatch({ type: 'SET_A', payload: item.from })
                          dispatch({ type: 'UPDATE_B', payload: item.to })
                        }}
                      >
                        <span className='flex items-center justify-between text-white'>
                          <span className='space-x-1'>
                            <span>{item.from.value}</span>
                            <span className='text-sm lowercase'>
                              {item.from.code} to {item.to.code}
                            </span>
                          </span>
                          <span>{formatCurrency(item.to.value, item.to.code)}</span>
                        </span>
                        <span className='text-xs text-gray-400'>
                          {item.date} • {item.rate}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
