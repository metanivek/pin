const delay = async (millis) =>
  new Promise((resolve) => setTimeout(resolve, millis));

module.exports = {
  delay,
};
