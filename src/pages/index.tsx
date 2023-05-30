import * as React from 'react'
import Image from 'next/image'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { currencies } from '@/constants/currencies'

const inter = Inter({ subsets: ['latin'] })

const meta = {
  title: 'Curr Converter',
  description: 'Track your currency conversion rates with ease.'
}

const ConvertIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' {...props}>
    <path
      fill='currentColor'
      d='M5.378 4.514a9.962 9.962 0 0 1 6.627-2.511c5.523 0 10 4.477 10 10a9.954 9.954 0 0 1-1.793 5.715l-2.707-5.715h2.5A8 8 0 0 0 6.279 6.416l-.9-1.902Zm13.253 14.978a9.962 9.962 0 0 1-6.626 2.51c-5.523 0-10-4.476-10-10c0-2.124.663-4.094 1.793-5.714l2.707 5.715h-2.5A8 8 0 0 0 17.73 17.59l.901 1.902Zm-5.212-4.66l-2.828-2.83l-2.829 2.83l-1.414-1.415l4.243-4.242l2.828 2.828l2.828-2.829l1.415 1.415l-4.243 4.242Z'
    />
  </svg>
)

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='32'
    height='32'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={1.5}
    {...props}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 12.75l6 6 9-13.5' />
  </svg>
)

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='32'
    height='32'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={1.5}
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
    />
  </svg>
)

const getCurrSymbol = (code: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
    .format(0)
    .replace(/\d/g, '')
}

const Drawer = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
  return (
    <div className={`${open ? '' : 'sr-only'}`}>
      <div
        className={`fixed inset-0 z-30 transition-opacity bg-black bg-opacity-50 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 w-full max-w-lg p-4 mx-auto overflow-y-auto transition-transform max-h-[65vh] bg-slate-800 transform-none ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {children}
      </div>
    </div>
  )
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
        {getCurrSymbol(code)}
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

const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const CurrInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => {
  const handleChange = debounce((value: string) => {
    onChange(value)
  }, 500)

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
        onChange={(e) => handleChange(e.target.value)}
      />
    </fieldset>
  )
}

export default function Home() {
  const [from, setFrom] = React.useState({
    code: 'USD',
    value: '0'
  })
  const [to, setTo] = React.useState({
    code: 'EUR',
    value: '0'
  })

  // fetch exchange rates when value change
  React.useEffect(() => {
    if (from.value === '0') return
    fetch(`/api/convert?from=${from.code}&to=${to.code}&amount=${from.value}`)
      .then((res) => res.json())
      .then((data) => {
        setTo((s) => ({ ...s, value: data.result }))
      })
  }, [from.value])

  return (
    <>
      <Head>
        <link rel='icon' href='/favicon.ico' />
        <title key='title'>{meta.title}</title>
        <meta name='description' content={meta.description} />
      </Head>
      <main className={`flex min-h-screen flex-col items-center justify-between md:py-12 md:px-24 ${inter.className}`}>
        <div className='max-w-lg min-h-[600px] bg-black p-2 md:p-6 rounded-xl md:border border-slate-900'>
          <div className='py-4 mb-4 text-center'>
            <h1 className='text-lg text-white'>Converter</h1>
          </div>
          <div className='relative flex flex-col'>
            <div className='absolute z-20 bg-black border border-black rounded-full top-[3.75rem] left-[3.75rem]'>
              <ConvertIcon className='text-white' />
            </div>
            <div className='flex group'>
              <CurrSelector code={from.code} onSelect={(code) => setFrom((s) => ({ ...s, code }))} />
              <CurrInput label={'from'} value={from.value} onChange={(value) => setFrom((s) => ({ ...s, value }))} />
            </div>
            <div className='flex group'>
              <CurrSelector code={to.code} onSelect={(code) => setTo((s) => ({ ...s, code }))} />
              <CurrInput label={'to'} value={to.value} onChange={(value) => setTo((s) => ({ ...s, value }))} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
