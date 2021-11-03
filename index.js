require("dotenv").config();
const { fetchCreatedObjkts } = require("./src/objkts");
const pinata = require("./src/pinata");

const args = process.argv.slice(2);
const mode = args[0];

const pinWork = async () => {
  const objkts = await fetchCreatedObjkts();
  console.log(objkts.length, "objkts minted");

  if (mode === "pinata") {
    console.log("Pinning to Pinata");
    pinata.pinObjkts(objkts);
  } else {
    console.log("Pinning to local node");
  }
};

pinWork()
  .then(() => {
    console.log("Finished pinning");
  })
  .catch((err) => {
    console.error(err);
  });
