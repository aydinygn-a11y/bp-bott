import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Events,
  GuildMember,
  ChatInputCommandInteraction,
} from "discord.js";
import { commands } from "./commands/index.js";

const token = process.env.TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token) {
  console.error(
    "❌  TOKEN is not set. Add it as a secret and restart the bot."
  );
  process.exit(1);
}

// ── Register slash commands (optional — skipped if no CLIENT_ID set) ─────────

if (clientId) {
  const rest = new REST().setToken(token);
  const commandsJSON = [...commands.values()].map((cmd) => cmd.data.toJSON());
  try {
    console.log(`🔄  Registering ${commandsJSON.length} slash command(s)…`);
    await rest.put(Routes.applicationCommands(clientId), { body: commandsJSON });
    console.log("✅  Slash commands registered.");
  } catch (err) {
    console.warn("⚠️  Could not register slash commands:", err);
  }
}

// ── Create client ─────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // required for guildMemberAdd
  ],
});

// ── Ready ─────────────────────────────────────────────────────────────────────

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅  Logged in as ${readyClient.user.tag}`);
});

// ── Welcome new members via DM ────────────────────────────────────────────────

client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  try {
    await member.send(
      `:wave: Welcome to BloxyPlus!\n\n━━━━━━━━━━━━━━━━━━━━\n\n:slot_machine: What is BloxyPlus?\n\nBloxyPlus is the ultimate Pet Simulator 99 gambling platform where you can:\n\n:sparkles: Gamble your PS99 items in exciting games :moneybag: Win big and multiply your inventory :arrows_counterclockwise: Secure deposits and withdrawals\n\n━━━━━━━━━━━━━━━━━━━━\n\n:link: Ready to Play?\n\n:globe_with_meridians: Visit: https://bloxyplus.cc/\n:scroll: Rules: Read our guidelines in <#1529129867139092520> :speech_balloon: Support at <#1529151643692695622>\n\n━━━━━━━━━━━━━━━━━━━━\n\n:video_game: Good luck and have fun! :four_leaf_clover:`
    );
    console.log(`✉️  Sent welcome DM to ${member.user.tag}`);
  } catch (err: unknown) {
    // Most common reason: the user has DMs disabled or has blocked the bot
    if (
      err instanceof Error &&
      "code" in (err as { code?: number }) &&
      (err as { code?: number }).code === 50007
    ) {
      console.warn(
        `⚠️  Could not DM ${member.user.tag} — they have DMs disabled.`
      );
    } else {
      console.error(`❌  Failed to send welcome DM to ${member.user.tag}:`, err);
    }
  }
});

// ── Slash command interactions ────────────────────────────────────────────────

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction as ChatInputCommandInteraction);
  } catch (err) {
    console.error(`Error executing /${interaction.commandName}:`, err);
    const reply = { content: "Something went wrong running that command.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────

await client.login(token);
