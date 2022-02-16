require("dotenv").config();
const { fetchCreated, fetchCollected } = require("./src/tzkt");
const pinata = require("./src/pinata");
const local = require("./src/local");
const addresses = process.env.TEZ_ADDRESSES.split(",");

// node index.js <local|pinata> <created|collected>
const args = process.argv.slice(2);
const mode = args[0];
const type = args.length > 1 && args[1] ? args[1] : "created";

const pinWork = async () => {
  let tokens = [];
  if (mode === "pinata") {
    console.log("Pinning to Pinata");
  } else {
    console.log("Pinning to Local Node");
  }

  if (type === "created") {
    tokens = tokens.concat(await fetchCreated(addresses));
  } else if (type === "collected") {
    tokens = tokens.concat(await fetchCollected(addresses));
  }
  console.log(`${tokens.length} tokens ready for pinning`);

  if (mode === "pinata") {
    await pinata.pin(tokens);
  } else {
    await local.pin(tokens);
  }
};

pinWork()
  .then(() => {
    console.log("\n\nFinished pinning. Have a nice day. :)\n\n");
  })
  .catch((err) => {
    console.error(err);
  });
