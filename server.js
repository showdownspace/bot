const { Client, Intents } = require('discord.js');
const path = require("path");
const util = require("util");
const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB
const mongo = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
mongo.connect();
const db = mongo.db()

// Discord
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ["CHANNEL"]
});
client.once('ready', () => {
	console.log('Ready!');
});
client.login(process.env.DISCORD_TOKEN);

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

  console.log(interaction)
	if (commandName === 'showdown') {
    const string = String(interaction.options.getString('command')).trim();
    console.log(`[${new Date().toJSON()}] ${interaction.user.tag} Slash=> ${string}`)
    
    let m
    if (m = string.match(/^set\s+email\s+(\S+)$/)) {
      await db.collection('profiles').updateOne(
        { _id: `discord${interaction.user.id}` },
        { $set: { discordUserId: interaction.user.id, discordTag: interaction.user.tag, proposedEmail: m[1] } },
        { upsert: true }
      )
		  await interaction.reply('saved your email, thanks!');
    } else {
		  await interaction.reply('unrecognized command!');
    }
	}
});
client.on('messageCreate', async message => {
  if (message.partial) {
    console.log('Received a partial message!')
    message = await message.fetch()
  }
  let isAdmin = message.author.id === '104986860236877824'
  if (!message.guild && !message.author.bot) {
    message.reply(`Use the \`/showdown\` command to send stuff to me`)
    return
  }
  if (message.mentions.has(client.user) && !message.author.bot && message.guild.id === '964056204148097084') {
    console.log(`[${new Date().toJSON()}] ${message.author.tag} Message=>`, message)
    let m = message.content.match(/^\s*<@965531868625776671>\s*```js\s*([^]*)\s*```\s*$/)
    const guild = message.guild
    if (isAdmin && m) {
      const fn = new Function('ctx', 'code', 'with(ctx){return eval(code)}');
      let replyText = ''
      try {
        const result = await fn({ message, client, guild, db }, m[1]);
        replyText = '```\n' + util.inspect(result) + '\n```'
      } catch (error) {
        replyText = '```\n' + String(error) + '\n```'
        console.error(error)
      }
      message.reply(replyText)
      return;
    }
    message.reply(`heyo`)
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
