import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import dotenv from "dotenv";
import { Commands } from "./commands.js";
import axios from "axios";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

Commands();

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;
    if (commandName === "weather") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("city")
          .setLabel("City")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("latitude_longitude")
          .setLabel("Latitude/Longitude")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({
        content: "Choose how you want to get the weather information:",
        components: [row],
      });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "latitude_longitude") {
      const modal = new ModalBuilder()
        .setCustomId("lat_long_modal")
        .setTitle("Enter Latitude and Longitude");

      const latitudeInput = new TextInputBuilder()
        .setCustomId("latitude")
        .setLabel("Latitude")
        .setPlaceholder("Latitude")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const longitudeInput = new TextInputBuilder()
        .setCustomId("longitude")
        .setLabel("Longitude")
        .setPlaceholder("Longitude")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(latitudeInput),
        new ActionRowBuilder().addComponents(longitudeInput)
      );

      await interaction.showModal(modal);
    } else if (interaction.customId === "city") {
      const modal = new ModalBuilder()
        .setCustomId("city_modal")
        .setTitle("Enter the city name");

      const cityInput = new TextInputBuilder()
        .setCustomId("cityy")
        .setLabel("City")
        .setPlaceholder("City")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(cityInput));

      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit) {
    if (interaction.customId === "lat_long_modal") {
      const lat = interaction.fields.getTextInputValue("latitude");
      const long = interaction.fields.getTextInputValue("longitude");
      await getWeatherDataByLatAndLong(lat, long, interaction);
    }
    if (interaction.customId === "city_modal") {
      const city = interaction.fields.getTextInputValue("cityy");
      await getWeatherDataByCity(city, interaction);
    }
  }
});

async function getWeatherDataByCity(city, interaction) {
  const apiKey = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const { main, weather } = response.data;
    const temp = main.temp;
    const description = weather[0].description;

    await interaction.reply({
      content: `The weather in ${city} is ${temp}°C with ${description}.`,
    });
  } catch (error) {
    console.log("Error in fetching weather data:", error.message);
    await interaction.reply({
      content: "Sorry, there was an error fetching the weather data.",
    });
  }
}

async function getWeatherDataByLatAndLong(latitude, longitude, interaction) {
  const apiKey = process.env.API_KEY;
  const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    const { name } = response.data[0];
    getWeatherDataByCityIndirectly(name, interaction, latitude, longitude);
  } catch (error) {
    console.log("Error in fetching weather data: ");
    await interaction.reply({
      content: "Sorry, there was an error fetching the weather data.",
    });
  }
}

async function getWeatherDataByCityIndirectly(
  city,
  interaction,
  latitude,
  longitude
) {
  const apiKey = process.env.API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const { main, weather } = response.data;
    const temp = main.temp;
    const description = weather[0].description;

    await interaction.reply({
      content: `The weather at Latitude: ${latitude}°, Longitude: ${longitude}° is ${temp}°C with ${description}.`,
    });
  } catch (error) {
    console.log("Error in fetching weather data:", error.message);
    await interaction.reply({
      content: "Sorry, there was an error fetching the weather data.",
    });
  }
}

client.login(process.env.TOKEN);
