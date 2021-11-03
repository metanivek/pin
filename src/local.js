const util = require("util");
const exec = util.promisify(require("child_process").exec);
const timeout = process.env.LOCAL_TIMEOUT || 10000;

const pinHash = async (hash) => {
  try {
    const { stdout, stderr } = await exec(`ipfs pin add ${hash}`, { timeout });

    if (stderr) {
      console.error(`error pinning ${hash}`, stderr);
    } else {
      console.log(stdout.replace(/[\n\r]/g, ""));
    }
  } catch (err) {
    console.error(`error pinning ${hash}`, err);
  }
};

const pinObjkt = async (objkt) => {
  console.log(`\nPinning #${objkt.id}`);
  let success = true;
  success = (await pinHash(objkt.metadata_hash)) && success;
  success = (await pinHash(objkt.artifact_hash)) && success;
  success = (await pinHash(objkt.display_hash)) && success;
  return success;
};

const pinObjkts = async (objkts) => {
  const failed = [];
  for (const objkt of objkts) {
    const success = await pinObjkt(objkt);
    if (!success) {
      failed.push(objkt.id);
    }
  }
  if (failed.length > 0) console.log("The OBJKTs failed to pin.", failed);
};

module.exports = {
  pinObjkts,
};