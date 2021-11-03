const util = require("util");
const exec = util.promisify(require("child_process").exec);

const pinHash = async (hash) => {
  const { stdout, stderr } = await exec(`ipfs pin add ${hash}`);

  if (stderr) {
    console.error(`error: ${stderr}`);
  } else {
    console.log(stdout.replace(/[\n\r]/g, ""));
  }
};

const pinObjkt = async (objkt) => {
  console.log(`\nPinning #${objkt.id}`);
  await pinHash(objkt.metadata_hash);
  await pinHash(objkt.artifact_hash);
  await pinHash(objkt.display_hash);
};

const pinObjkts = async (objkts) => {
  for (const objkt of objkts) {
    await pinObjkt(objkt);
  }
};

module.exports = {
  pinObjkts,
};
