export default {
  server: {
    proxy: {
      "/v1": {
        target: "https://rpc-jackal.keplr.app",
        changeOrigin: true,
        secure: true,
      },
      "/lcd": {
        target: "https://lcd-jackal.keplr.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
};
