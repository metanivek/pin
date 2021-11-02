require("dotenv").config();
const {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql,
} = require("@apollo/client/core");
const fetch = require("cross-fetch");
const pinataSDK = require("@pinata/sdk");

const addresses = [
  "tz1N3xSSHguSVLYMCeNG7e3oiDfPnc6FnQip",
  "tz1aiCXusXLywm3ewXb4Y8X8bsDqWQYmzvLa",
  "tz1XDQJPCP53mSgwDZiNphTVKGmDJRsTwWUe",
];
const fetchQuery = {
  query: gql`
    query FetchMyObjkts($addresses: [String!], $include_tags: [String!]) {
      hic_et_nunc_token(
        where: {
          creator_id: { _in: $addresses }
          token_holders: {
            quantity: { _gt: 0 }
            holder_id: { _neq: "tz1burnburnburnburnburnburnburjAYjjX" }
          }
        }
        order_by: { id: desc }
      ) {
        id
        artifact_uri
        display_uri
        metadata
      }
    }
  `,
  variables: {
    addresses,
  },
};

const fetchObjkts = async () => {
  const client = new ApolloClient({
    link: new HttpLink({
      uri: "https://api.hicdex.com/v1/graphql",
      fetch,
    }),
    cache: new InMemoryCache(),
  });
  const { data } = await client.query(fetchQuery);
  return data["hic_et_nunc_token"];
};

const delay = async (millis) =>
  new Promise((resolve) => setTimeout(resolve, millis));

const ipfsHashFromUri = (ipfsUri) => ipfsUri.replace("ipfs://", "");

const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

const fetchPinList = async (pins = [], pageOffset = 0) => {
  try {
    const pageLimit = 100;
    const newPins = await pinata.pinList({
      pageLimit,
      pageOffset,
    });
    pins = pins.concat(newPins.rows);
    if (pins.length < newPins.count) {
      return fetchPinList(pins, pins.length);
    } else {
      return pins;
    }
  } catch (ex) {
    console.error("error", ex);
  }
};

const isPinned = (hash, pinList) => {
  return pinList.find((p) => p.ipfs_pin_hash === hash) !== undefined;
};

const pinHash = async (hash, pinList, name) => {
  if (!isPinned(hash, pinList)) {
    const result = await pinata.pinByHash(metadataHash, {
      pinataMetadata: {
        name,
      },
    });
    console.log("pinByHash result", result);
  }
};

const pinObjkt = async (objkt, pinList) => {
  console.log("\n=== pinning", objkt.id);
  await pinHash(
    ipfsHashFromUri(objkt.metadata),
    pinList,
    `metadata ${objkt.id}`
  );
  console.log("metadata [DONE]");
  await pinHash(
    ipfsHashFromUri(objkt.artifact_uri),
    pinList,
    `artifact ${objkt.id}`
  );
  console.log("artifact [DONE]");
  await pinHash(
    ipfsHashFromUri(objkt.display_uri),
    pinList,
    `thumbnail ${objkt.id}`
  );
  console.log("thumbnail [DONE]");
};

const pinWork = async () => {
  const objkts = await fetchObjkts();
  console.log(objkts.length, "objkts minted\n");
  const pinList = await fetchPinList();
  for (const objkt of objkts) {
    await pinObjkt(objkt, pinList);
    await delay(60000 / 180); // simple rate limiting
  }
};

pinWork()
  .then(() => {
    console.log("\nFinished pinning.");
  })
  .catch((err) => {
    console.error(err);
  });
