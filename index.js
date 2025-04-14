import OpenAi from "openai";
import readlineSync from "readline-sync";

const OPENAI_API_KEY =
  "sk-proj----------------------------------------------------------------------------------IO9cp7oA";

const client = new OpenAi({
  apiKey: OPENAI_API_KEY,
});

//Tools -- assuming there are form api calls
function getWeatherDetails(city) {
  if (city.toLowerCase() === "patiala") return "11°C";
  if (city.toLowerCase() === "mohali") return "14°C";
  if (city.toLowerCase() === "banglore") return "20°C";
  if (city.toLowerCase() === "chandigarh") return "8°C";
  if (city.toLowerCase() === "delhi") return "12°C";
}

const tools = {
  getWeatherDetails: getWeatherDetails,
};
// const user = "Hey, what is the weather in Patiala?";

// client.chat.completions.create({
//     model: 'gpt-4o',
//     message: [{ role : 'user', content: user }],
// }).then((e) => {
//     console.log(e.choices[0].message.content);
// });

//Designing System Prompt
const SYSTEM_PROMPT = `You are an AI Assistant with START, PLAN, ACTION, OBSERVATION and OUTPUT STATE.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, Return the AI response based on START prompt and observations

Strictly follow the JSON output formate as in examples

Available Tools:
- function getWeatherDetails(city: string) - string
getWeatherDetails is a function that accepts city name as string and returns the weather details

Example:
START
{ "type" : "user", "user" : "What is the sum of weather of Patiala and Mohali?" }
{ "type" : "plan", "plan" : "I will call the getWeatherDetails for Patiala"}
{ "type" : "action", "function" : "getWeatherDetails", "input": "Patiala"}
{ "type" : "observation", "observation" : "10°C"}
{ "type" : "plan", "plan" : "I will call the getWeatherDetails for Mohali"}
{ "type" : "action", "function" : "getWeatherDetails", "input": "Mohali"}
{ "type" : "observation", "observation" : "14°C"}
{ "type" : "output", "output" : "The sum of weather of Patiala and Mohali is 24°C"}

`;

// const user = "Hey, what is the weather in Delhi?";

// async function chat() {
//   const result = await client.chat.completions.create({
//     model: "gpt-4",
//     messages: [
//       { role: "system", content: SYSTEM_PROMPT },
//       // {
//       //   role: "developer",
//       //   content:
//       //     '{ "type: "plan", "plan": "I will call the getWeatherDetails for Delhi" }',
//       // },
//       // {
//       //   role: "developer",
//       //   content:
//       //     '{ "type: "action", "function": "getWeatherDetails", "input": "Delhi" }',
//       // },
//       // {
//       //   role: "developer",
//       //   content:
//       //     '{ "type: "observation", "observation": "14°C" }',
//       // },
//       { role: "user", content: user },
//     ],
//   });
//   console.log(response.choices[0].message.content);
// }

// chat();

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

while (true) {
  const query = readlineSync.question(">>");
  const q = {
    type: "user",
    user: query,
  };
  messages.push({ role: "user", content: JSON.stringify(q) });

  while (true) {
    const chat = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
    });

    const result = chat.choices[0].message.content;
    messages.push({ role: "assistant", content: result });

    console.log(`\n\n-----------------START AI------------`);
    console.log(result);
    console.log(`-----------------START AI------------\n\n`);

    const call = JSON.parse(result);

    if (call.type == "output") {
      console.log(`🤖: ${call.output}`);
      break;
    } else if (call.type == "action") {
      const fn = tools[call.function];
      const observation = fn(call.input);
      const obs = { type: "observation", observation: observation };
      messages.push({ role: "developer", content: JSON.stringify(obs) });
    }
  }
}
