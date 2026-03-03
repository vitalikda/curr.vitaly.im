# curr.vitaly.im

Currency converter with calculations support akin Google/Raycast search

DEMO: https://curr.vitaly.im

## Installation

1. Clone the repository: `git clone https://github.com/vitalikda/curr.vitaly.im.git`
2. Install dependencies: `pnpm install`

## Usage

1. Start the dev server: `pnpm dev`
2. Open http://localhost:5173 in a browser

Build: `pnpm build` · Preview: `pnpm preview`

## Features

- Single search bar: free-form input (e.g. `10 usd eur`, `eur to usd`, `1+2/3*4`)
- Rates from [Frankfurter](https://frankfurter.dev/) (no API key)
- History in localStorage

## Stack

- [Solid.js](https://www.solidjs.com/) + [Vite](https://vitejs.dev/)
- Tailwind CSS
- TypeScript
