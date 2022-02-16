const pinataSDK = require("@pinata/sdk");
const { delay } = require("./utils");
const ProgressBar = require("progress");

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
  const needsPinning = !isPinned(hash, pinList);
  if (needsPinning) {
    const result = await pinata.pinByHash(hash, {
      pinataMetadata: {
        name,
      },
    });
    // console.log(result);
  } else {
    // console.log(`already pinned ${hash}`);
  }
  return needsPinning;
};

const pinToken = async (token, pinList) => {
  // console.log(`\nPinning #${token.id}`);
  const m = await pinHash(
    token.metadata_hash,
    pinList,
    `metadata ${token.contract} ${token.id}`
  );
  const a = await pinHash(
    token.artifact_hash,
    pinList,
    `artifact ${token.contract} ${token.id}`
  );
  const t = await pinHash(
    token.display_hash,
    pinList,
    `thumbnail ${token.contract} ${token.id}`
  );

  return m || a || t;
};

const pin = async (tokens) => {
  const pinList = await fetchPinList();
  const bar = new ProgressBar("Pinning [:bar] :percent :etas   ", {
    total: tokens.length,
    complete: "=",
    incomplete: " ",
  });
  for (const token of tokens) {
    const called = await pinToken(token, pinList);
    bar.tick();
    if (called) {
      await delay(60000 / 180); // simple rate limiting
    }
  }
};

module.exports = {
  pin,
};
