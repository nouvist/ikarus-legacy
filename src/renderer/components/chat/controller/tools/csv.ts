import z from "zod";
import {
  ManagedTool
} from "~/renderer/components/chat/controller/tools/fundamental";
import { CsvController } from "~/renderer/components/csv";

export type CsvTools = ReturnType<typeof registerCsvTools>;
export default function registerCsvTools(csv: CsvController) {
  return {
    "Csv.getMetadata": new GetMetadataTool(csv).toTool(),
    "Csv.getRow": new GetRowTool(csv).toTool(),
  } as const;
}

export class GetMetadataTool extends ManagedTool {
  protected _csv: CsvController;
  description = "Get headers and number of rows from user selected CSV.";
  input = z.object();

  constructor(csv: CsvController) {
    super();
    this._csv = csv;
  }

  async execute(_: z.infer<typeof this.input>) {
    const csv = await this._csv.parse();
    if (!csv) {
      return "User has not selected a CSV file. Ask the user to select one.";
    }
    if (csv.data.length === 0) return "CSV file is empty.";
    const keys = Object.keys(csv.data[0]).map(
      (key) => `- ${JSON.stringify(key)}`
    );
    keys.unshift(
      `CSV file has ${csv.data.length - 1} rows and ${keys.length} headers:`
    );
    return keys.join("\n");
  }
}

export class GetRowTool extends ManagedTool {
  protected _csv: CsvController;
  description = "Get a row from user selected CSV.";
  input = z.object({
    index: z.number().int().min(0),
  });

  constructor(csv: CsvController) {
    super();
    this._csv = csv;
  }

  async execute(params: z.infer<typeof this.input>) {
    const csv = await this._csv.parse();
    if (!csv) {
      return "User has not selected a CSV file. Ask the user to select one.";
    }

    if (csv.data.length === 0) {
      return "CSV file is empty. Tell the user to add some data.";
    }

    if (params.index >= csv.data.length) {
      return `Row index ${params.index} is out of bounds. The CSV file has ${csv.data.length} rows.`;
    }

    return Object.entries(csv.data[params.index])
      .map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
      .join("\n");
  }
}
