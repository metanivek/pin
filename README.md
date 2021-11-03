# henpin

A simple node script for pinning hic et nunc OBJKTs to Pinata or a local IPFS
node. You can pin your created or collected OBJKTs.

## How to use

1. Download or clone repo
1. `cd` into directory
1. `cp .env.sample .env`
1. Replace values in `.env` with your Pinata keys and your Tezos addresses
1. Run one of the pinning commands: `yarn run pinata-created`, `yarn run pinata-collected`, `yarn run local-created`, or `yarn run local-collected`
