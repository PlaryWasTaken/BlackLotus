import Command from "../../classes/structs/Command";
import { InteractionReplyOptions } from "discord.js";

const discord = require("discord.js");
const { inspect } = require("util");
export default new Command({
  guilds: ["896047806454837278"],
  command: new discord.SlashCommandBuilder()
    .setName("eval")
    .setDescription("Executa um código")
    .setDefaultMemberPermissions(discord.PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("Código a ser executado")
        .setRequired(true)
        .setMinLength(1),
    ),
  async run({ client, interaction }) {
    if (interaction.user.id !== "177840117057191937") return interaction.reply("Sem permissão");
    let code = interaction.options.getString("code");
    code = "(async () => {" + code + "})()";
    try {
      const waitFn = (ev) => {
        return new Promise(async (resolve) => {
          const a = new Function("resolve", "client", "interaction", ev);
          a(resolve, client, interaction);
        });
      };
      console.log(code);
      const result = await waitFn(code);
      let output = result;
      if (typeof result !== "string") {
        output = inspect(result);
      }
      output = "```js\n" + output + "\n```";
      await interaction.reply({ content: output } as InteractionReplyOptions);
    } catch (error) {
      console.log(error);
      interaction.channel.send({ content: ":x: Aconteceu algum erro" }); // returns message if error
    }
  },
});
