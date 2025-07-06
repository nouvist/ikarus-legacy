import { Tool, zodSchema } from "modelfusion";
import { z } from "zod";

const _alert = new Tool({
  name: "alert",
  parameters: zodSchema(
    z.object({
      message: z.string(),
    })
  ),
  execute: async ({ message }) => {
    alert(message);
  },
});

const _all = [_alert];

const Tools = Object.freeze({
  alert: _alert,
  all: _all,
});
export default Tools;
