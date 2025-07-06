import {
  BaseUrlApiConfiguration,
  OpenAICompatibleApiConfiguration,
  PartialBaseUrlPartsApiConfigurationOptions,
} from "modelfusion";

export class GeminiApiConfiguration
  extends BaseUrlApiConfiguration
  implements OpenAICompatibleApiConfiguration
{
  readonly provider = "openaicompatible-gemini";

  constructor(
    settings: PartialBaseUrlPartsApiConfigurationOptions & { apiKey: string }
  ) {
    super({
      ...settings,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
      },
    });
  }
}

export class OllamaApiConfiguration
  extends BaseUrlApiConfiguration
  implements OpenAICompatibleApiConfiguration
{
  readonly provider = "openaicompatible-ollama";

  constructor(settings: PartialBaseUrlPartsApiConfigurationOptions) {
    super({
      ...settings,
      baseUrl: "http://localhost:11434/v1",
      headers: {
        Authorization: `Bearer ollama`,
      },
    });
  }
}
