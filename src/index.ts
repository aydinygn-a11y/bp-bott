import {
  Client,
  GatewayIntentBits,
  Events,
  GuildMember,
} from "discord.js";
const token = process.env.TOKEN;
if (!token) {
  console.error("❌  TOKEN is not set.");
  process.exit(1);
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅  Logged in as ${readyClient.user.tag}`);
});
client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  try {
    await member.send(
      `:wave: Welcome to BloxyPlus!\n\n━━━━━━━━━━━━━━━━━━━━\n\n:slot_machine: What is BloxyPlus?\n\nBloxyPlus is the ultimate Pet Simulator 99 gambling platform where you can:\n\n:sparkles: Gamble your PS99 items in exciting games :moneybag: Win big and multiply your inventory :arrows_counterclockwise: Secure deposits and withdrawals\n\n━━━━━━━━━━━━━━━━━━━━\n\n:link: Ready to Play?\n\n:globe_with_meridians: Visit: https://bloxyplus.cc/\n:scroll: Rules: Read our guidelines in <#1529129867139092520> :speech_balloon: Support at <#1529151643692695622>\n\n━━━━━━━━━━━━━━━━━━━━\n\n:video_game: Good luck and have fun! :four_leaf_clover:`
    );
    console.log(`✉️  Sent welcome DM to ${member.user.tag}`);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      "code" in (err as { code?: number }) &&
      (err as { code?: number }).code === 50007
    ) {
      console.warn(`⚠️  Could not DM ${member.user.tag} — DMs disabled.`);
    } else {
      console.error(`❌  Failed to DM ${member.user.tag}:`, err);
    }
  }
});
await client.login(token);
