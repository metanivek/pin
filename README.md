# pin

A simple node script for pinning FA2 tokens to Pinata or a local IPFS
node. You can pin your created or collected tokens.

## Supported tokens

Some tokens only support pinning your **collected** tokens. This is due to how
some tokens store their metadata (see comments in [./src/tzkt.js](src/tzkt.js)
for more info). I hope to improve this in the future, but for now, all tokens
that you have collected should work.

I know that the following tokens support pinning for both created and collected:

1. Teia / Hic et Nunc
1. Objkt.com
1. Versum

## Prerequisites

1. Install IPFS: https://ipfs.io/#install (only for local pinning)
1. Install Node.js: https://nodejs.com

## How to use

1. Download or clone repo
1. `cd` into directory from the terminal
1. `cp .env.sample .env`
1. Replace values in `.env` with your Pinata keys and your Tezos addresses
1. `npm i` to install dependencies
1. Run one of the pinning commands: `npm run pinata created`, `npm run pinata collected`, `npm run local created`, or `npm run local collected`

Note: pinning locally can take a long time and is prone to failure due to failed
discovery in the IPFS network. If you try enough times, it will usually succeed.
:)
