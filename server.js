const { Client, Intents } = require('discord.js');
const path = require("path");
const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB
const mongo = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
mongo.connect();

// Discord
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.once('ready', () => {
	console.log('Ready!');
});
client.login(process.env.DISCORD_TOKEN);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

  console.log(interaction)
	if (commandName === 'showdown') {
		await interaction.reply('Pong!');
	}
});

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // set this to true for detailed logging:
  logger: false
});

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

// Our main GET home page route, pulls from src/pages/index.hbs
fastify.get("/", function(request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = {
    greeting: "Hello Node!"
  };
  // request.query.paramName <-- a querystring example
  reply.view("/src/pages/index.hbs", params);
});

// A POST route to handle form submissions
fastify.post("/", function(request, reply) {
  let params = {
    greeting: "Hello Form!"
  };
  // request.body.paramName <-- a form post example
  reply.view("/src/pages/index.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, '0.0.0.0', function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
