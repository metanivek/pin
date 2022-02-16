const util = require("util");
const fs = require("fs");
const ProgressBar = require("progress");
const exec = util.promisify(require("child_process").exec);
const timeout =
  process.env.LOCAL_TIMEOUT !== undefined
    ? parseInt(process.env.LOCAL_TIMEOUT)
    : 10000;

const pinCacheFile = "pins-cache.json";
const loadCachedPins = () => {
  if (fs.existsSync(pinCacheFile)) {
    const data = fs.readFileSync("pins-cache.json", "utf-8");
    const pins = JSON.parse(data);
    return pins;
  } else {
    return [];
  }
};

const saveCachedPins = (pins) => {
  fs.writeFileSync(pinCacheFile, JSON.stringify(pins));
};

const hashUrl = (hash) => `https://ipfs.io/ipfs/${hash}`;

const pinHash = async (hash, bar, failures) => {
  try {
    const { stdout, stderr } = await exec(`ipfs pin add ${hash}`, { timeout });
    if (stderr) {
      failures.push(hash);
    }
  } catch (err) {
    failures.push(hash);
  }
  return failures;
};

const pinToken = async (token, bar) => {
  let failures = [];
  await pinHash(token.metadata_hash, bar, failures);
  await pinHash(token.artifact_hash, bar, failures);
  await pinHash(token.display_hash, bar, failures);
  return failures;
};

const pin = async (tokens) => {
  const failed = [];
  const cache = loadCachedPins();
  tokens = tokens.filter((o) => !cache.includes(o.id));
  const bar = new ProgressBar("Pinning [:bar] :percent  ", {
    total: tokens.length + 1,
    complete: "=",
    incomplete: " ",
  });
  for (const token of tokens) {
    bar.tick();
    const failures = await pinToken(token, bar);
    if (failures.length > 0) {
      failed.push(failures);
    } else {
      cache.push(token.id);
    }
  }
  bar.tick();
  if (failed.length > 0) {
    console.log(
      `\n\n${failed.length} of ${tokens.length} tokens failed to pin!`
    );
    console.log(
      "Visiting the following URLs may help when you try to pin again."
    );
    for (const hash of failed.flat()) {
      console.log(hashUrl(hash));
    }
  }
  saveCachedPins(cache);
};

module.exports = {
  pin,
};
