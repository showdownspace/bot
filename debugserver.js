const fastify = require("fastify")({
  logger: true,
  bodyLimit: 10 * 1048576,
});
fastify.listen(process.env.PORT, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`DEBUG server on ${address}`);
  fastify.log.info(`DEBUG server listening on ${address}`);
});
