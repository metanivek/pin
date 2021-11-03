const util = require("util");
const exec = util.promisify(require("child_process").exec);
const timeout =
  process.env.LOCAL_TIMEOUT !== undefined
    ? parseInt(process.env.LOCAL_TIMEOUT)
    : 10000;

const pinHash = async (hash) => {
  let success = true;
  try {
    const { stdout, stderr } = await exec(`ipfs pin add ${hash}`, { timeout });

    if (stderr) {
      success = false;
      console.error(`error pinning ${hash}`, stderr);
    } else {
      console.log(stdout.replace(/[\n\r]/g, ""));
    }
  } catch (err) {
    success = false;
    console.error(`error pinning ${hash}`, err);
  }
  return success;
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
  if (failed.length > 0) {
    console.log(
      `\n\n${failed.length} of ${objkts.length} OBJKTs failed to pin!`
    );
    for (const i of failed) {
      console.log(`https://hicetnunc.xyz/objkt/${i}`);
    }
  }
};

module.exports = {
  pinObjkts,
};
