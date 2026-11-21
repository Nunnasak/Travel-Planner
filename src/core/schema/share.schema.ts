import { z } from "zod";

export const MEMBER_ROLES = ["VIEWER", "EDITOR"] as const;
export const LINK_ACCESS = ["RESTRICTED", "VIEWER", "EDITOR"] as const;

const role = z.enum(MEMBER_ROLES, { error: "Pick Viewer or Editor." });

export const addMemberSchema = z.object({
  identifier: z
    .string({ error: "Enter a username or email." })
    .trim()
    .min(1, "Enter a username or email.")
    .max(254, "That username or email is too long."),
  role,
});

export const updateMemberSchema = z.object({ role });

export const linkAccessSchema = z.object({
  link_access: z.enum(LINK_ACCESS, { error: "Pick who can open the link." }),
});

export type AddMemberInput = z.output<typeof addMemberSchema>;
export type MemberRole = (typeof MEMBER_ROLES)[number];
export type LinkAccessValue = (typeof LINK_ACCESS)[number];
