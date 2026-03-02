module.exports = {
  resolve: {
    fallback: {
      worker_threads: false,
      crypto: false,
      fs: false,
      path: false,
      libxmljs2: false,
      '@nestjs/*': false,
    },
  },
};
