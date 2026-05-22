import { z } from "zod";

const LlmProviderSchema = z.enum(["google"]);

const aiEnvironmentSchema = z.object({
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  LLM_PROVIDER: LlmProviderSchema.default("google"),
  LLM_MODEL: z.string().min(1).default("gemini-2.5-flash"),
});

const parsedEnvironment = aiEnvironmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  throw new Error(
    `Invalid AI environment configuration: ${parsedEnvironment.error.message}`,
  );
}

export type LlmProvider = z.infer<typeof LlmProviderSchema>;

export const aiEnv = {
  googleGenerativeAiApiKey: parsedEnvironment.data.GOOGLE_GENERATIVE_AI_API_KEY,
  provider: parsedEnvironment.data.LLM_PROVIDER,
  model: parsedEnvironment.data.LLM_MODEL,
} as const;

export const assertGoogleConfigured = () => {
  if (!aiEnv.googleGenerativeAiApiKey?.trim()) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is required to analyze job descriptions with the Google provider.",
    );
  }
};
