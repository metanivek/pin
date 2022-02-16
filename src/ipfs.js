const ipfsHashFromUri = (ipfsUri) => new URL(ipfsUri).host;

module.exports = {
  ipfsHashFromUri,
};
