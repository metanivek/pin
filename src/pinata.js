const pinataSDK = require("@pinata/sdk");
const { delay } = require("./utils");

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
    console.log(result);
  } else {
    console.log(`already pinned ${hash}`);
  }
  return needsPinning;
};

const pinObjkt = async (objkt, pinList) => {
  console.log(`\nPinning #${objkt.id}`);
  const m = await pinHash(objkt.metadata_hash, pinList, `metadata ${objkt.id}`);
  const a = await pinHash(objkt.artifact_hash, pinList, `artifact ${objkt.id}`);
  const t = await pinHash(objkt.display_hash, pinList, `thumbnail ${objkt.id}`);

  return m || a || t;
};

const pinObjkts = async (objkts) => {
  const pinList = await fetchPinList();
  for (const objkt of objkts) {
    const called = await pinObjkt(objkt, pinList);
    if (called) {
      await delay(60000 / 180); // simple rate limiting
    }
  }
};

module.exports = {
  pinObjkts,
};
