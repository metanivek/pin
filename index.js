require("dotenv").config();
const { fetchCreatedObjkts, fetchCollectedObjkts } = require("./src/objkts");
const pinata = require("./src/pinata");
const local = require("./src/local");

const args = process.argv.slice(2);
const mode = args[0];
const type = args.length > 1 && args[1] ? args[1] : "created";

const pinWork = async () => {
  let objkts = [];
  if (type === "created") {
    objkts = objkts.concat(await await fetchCreatedObjkts());
  } else if (type === "collected") {
    objkts = objkts.concat(await await fetchCollectedObjkts());
  }
  console.log(objkts.length, `objkts ${type}`);

  if (mode === "pinata") {
    console.log("Pinning to Pinata");
    await pinata.pinObjkts(objkts);
  } else {
    console.log("Pinning to local node");
    await local.pinObjkts(objkts);
  }
};

pinWork()
  .then(() => {
    console.log("\n\nFinished pinning. Have a nice day. :)\n\n");
  })
  .catch((err) => {
    console.error(err);
  });
