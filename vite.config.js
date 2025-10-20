export default {
  server: {
    proxy: {
      "/v1": "https://rpc-jackal.keplr.app",
      "/lcd": "https://lcd-jackal.keplr.app",
    },
  },
};
