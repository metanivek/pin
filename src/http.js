const axios = require("axios");

const http = {
  get: async (url, params = {}) => {
    const { data } = await axios.get(
      url + "?" + new URLSearchParams(params).toString()
    );
    return data;
  },
};

module.exports = http;
