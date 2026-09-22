import z from "zod";

export const PoemSchema = z.object({
  title: z.string().min(1, "Poem title required").max(75, "Poem title too long"),
  body: z.string().min(1, "Poem entry required").max(7500, "Poem too long"),
  tags: z.array(z.string()).max(5, "Max 5 tags allowed").default([]),
  isPublic: z.boolean().default(false),
});

export type PoemInput = z.infer<typeof PoemSchema>