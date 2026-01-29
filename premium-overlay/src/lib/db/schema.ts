import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "../../../auth-schema";

// Re-export the user table to be used in other parts of the application
export * from "../../../auth-schema";

// Define a new table for user profiles with a one-to-one relationship to the user table
export const userProfile = pgTable("user_profile", {
  id: text("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  notifications: jsonb("notifications"),
  privacy: jsonb("privacy"),
});

// Define relations
export const userRelations = relations(user, ({ one }) => ({
  profile: one(userProfile, {
    fields: [user.id],
    references: [userProfile.id],
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.id],
    references: [user.id],
  }),
}));

