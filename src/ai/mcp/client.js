import { loadPreferencesTool } from "./tools/loadPreferencesTool";
import { saveScriptTool } from "./tools/saveScriptTool";

// FUTURE: connect a real MCP server. Today the client calls local tools.
export const mcpClient = {
  connected: false,
  tools: {
    loadPreferences: loadPreferencesTool,
    saveScript: saveScriptTool,
  },
};
