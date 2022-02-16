# pin

A simple node script for pinning hic et nunc OBJKTs to Pinata or a local IPFS
node. You can pin your created or collected OBJKTs.

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
