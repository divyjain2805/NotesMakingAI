import "dotenv/config";
import { getToolDecision } from "./services/llm.js";

const result = await getToolDecision(
    "Schedule a meeting with rajveer on class project"
);

console.log(JSON.stringify(result, null, 2));