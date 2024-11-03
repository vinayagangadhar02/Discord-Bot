import { REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  {
    name: "weather",
    description: "Shows the weather of the region",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

export const Commands = async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENTID), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
};
