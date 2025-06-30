import { tool } from "@langchain/core/tools";
import { z } from "zod";

export function createAlertTool() {
  const schema = z.object({
    message: z.string(),
  });

  function handle(input: z.infer<typeof schema>) {
    alert(input.message);
    return "alert successfully shown";
  }

  return tool(handle, {
    name: "alert",
    description: "Pop up an alert message",
    schema: schema,
  });
}
