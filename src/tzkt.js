const http = require("./http");
const { ipfsHashFromUri } = require("./ipfs");
const ProgressBar = require("progress");

const limit = 1000;

const bigMapPtrs = {};

// tzkt's api doesn't include metadata info in their tokens api
// so we have to find the token_metadata big map to find token metadata.
const fetchBigMapId = async (ktAddr) => {
  if (bigMapPtrs[ktAddr]) {
    return bigMapPtrs[ktAddr];
  }

  const baseUrl = "https://api.tzkt.io/v1/bigmaps";
  const params = {
    contract: ktAddr,
    "path.as": "*token_metadata",
    "select.fields": "ptr",
  };
  const data = await http.get(baseUrl, params);

  const ptr = data[0];
  bigMapPtrs[ktAddr] = ptr;
  return ptr;
};

const fetchMetadataHash = async (ktAddr, tokenId) => {
  const bigMapId = await fetchBigMapId(ktAddr);
  const baseUrl = `https://api.tzkt.io/v1/bigmaps/${bigMapId}/keys`;
  const params = {
    "key.eq": `${tokenId}`,
    select: "value",
  };
  const data = await http.get(baseUrl, params);

  const bytes = data[0].token_info[""];
  let ipfsUri = "";
  for (let i = 0; i < bytes.length; i += 2) {
    ipfsUri =
      ipfsUri + String.fromCharCode(parseInt(bytes.substring(i, i + 2), 16));
  }
  if (ipfsUri.startsWith("ipfs") === false) {
    // TODO: should handle this better, probably
    console.log(`Non-IPFS metadata ${ipfsUri}`);
    return null;
  }
  return ipfsUri;
};

const fetchBalances = async (params = {}, offset = 0, balances = []) => {
  const baseUrl = "https://api.tzkt.io/v1/tokens/balances";
  params = { ...params, offset: offset, limit };
  const data = await http.get(baseUrl, params);

  balances = balances.concat(data);
  if (data.length > 0 && data.length <= limit) {
    const newOffset = offset + data.length;
    return fetchBalances(params, newOffset, balances);
  } else {
    return balances;
  }
};

const fetchTokens = async (params) => {
  params = {
    ...params,
    "token.standard": "fa2",
    select: "token",
  };
  const balances = await fetchBalances(params);
  // console.log(`${balances.length} balance records`);
  const tokens = {};
  const bar = new ProgressBar("Gathering hashes [:bar] :percent :etas  ", {
    total: balances.length,
    complete: "=",
    incomplete: " ",
  });

  for (const b of balances) {
    const id = b.tokenId;
    const token = b;
    bar.tick();
    if (tokens[id]) {
      // balances will dupe so skip already seen tokens
      continue;
    }

    const { metadata } = token;
    if (metadata.artifactUri || metadata.artifact_uri) {
      try {
        const contract = token.contract.address;
        const metadataUri = await fetchMetadataHash(contract, id);
        const artifactUri = metadata.artifactUri || metadata.artifact_uri;
        // early H=N didn't have displayUri so fall back to artifact
        const displayUri =
          metadata.displayUri || metadata.display_uri || artifactUri;
        tokens[id] = {
          id,
          contract,
          metadata_hash: ipfsHashFromUri(metadataUri),
          artifact_hash: ipfsHashFromUri(artifactUri),
          display_hash: ipfsHashFromUri(displayUri),
        };
      } catch (ex) {
        console.log("Couldn't load metadata hash. Skipping.", b);
      }
    } else if (Object.keys(token.metadata).length == 0) {
      console.log("Empty metadata! Let Baking Bad know in their Discord.", b);
    } else {
      // will be things (usually) like hDAO, etc
      // uncomment if you want to see :)
      // console.log("Doesn't look pinnable.", b);
    }
  }

  return Object.values(tokens);
};

// currently relies on the creators key (from TZIP-12) to be present
// in the metadata _and_ an array of tezos addresses. not all tokens
// do this, notably fx(hash), rarible, tezzardz, and probably more.
const fetchCreated = async (addresses) => {
  let tokens = [];
  for (const addr of addresses) {
    console.log(`Address ${addr}`);
    const t = await fetchTokens({
      "token.metadata.creators.eq": `["${addr}"]`,
    });
    console.log(`${t.length} tokens`);
    tokens = tokens.concat(t);
  }
  return tokens;
};

// i _think_ this will work for any contract since it does not
// rely on any particular metadata layout
const fetchCollected = async (addresses) => {
  let tokens = [];
  for (const addr of addresses) {
    console.log(`Address ${addr}`);
    const t = await fetchTokens({
      "account.eq": addr,
      "balance.gt": 0,
    });
    console.log(`${t.length} tokens`);
    tokens = tokens.concat(t);
  }
  return tokens;
};

module.exports = {
  fetchCreated,
  fetchCollected,
};
