import z from "zod";

export const bioSchema = z
  .object({
    blocks: z
      .array(z.object({ type: z.string(), data: z.any() }))
      .max(10, "Only 10 blocks allowed"),
  })
  .refine(
    ({ blocks }) =>
      blocks.reduce(
        (sum, b) =>
          sum + (typeof b.data?.text === "string" ? b.data.text.length : 0),
        0,
      ) <= 1000,
    "Bio is too long",
  );

export type BioInput = z.infer<typeof bioSchema>;
