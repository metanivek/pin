const {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql,
} = require("@apollo/client/core");
const fetch = require("cross-fetch");

const addresses = process.env.TEZ_ADDRESSES.split(",");

const fetchCreatedQuery = {
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

const ipfsHashFromUri = (ipfsUri) => ipfsUri.replace("ipfs://", "");

const normalizeObjkt = (objkt) => {
  return {
    id: objkt.id,
    metadata_hash: ipfsHashFromUri(objkt.metadata),
    artifact_hash: ipfsHashFromUri(objkt.artifact_uri),
    display_hash: ipfsHashFromUri(objkt.display_uri),
  };
};

const fetchCreatedObjkts = async () => {
  const client = new ApolloClient({
    link: new HttpLink({
      uri: "https://api.hicdex.com/v1/graphql",
      fetch,
    }),
    cache: new InMemoryCache(),
  });
  const { data } = await client.query(fetchCreatedQuery);
  return data["hic_et_nunc_token"].map((o) => normalizeObjkt(o));
};

module.exports = {
  fetchCreatedObjkts,
};
