import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  bio: text("bio"),
  fieldExperience: text("field_experience"),
  skills: text("skills").array(),
  education: text("education"),
  location: text("location"),
  availability: text("availability"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => forumCategories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  postId: integer("post_id").references(() => forumPosts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  salary: text("salary"),
  contactEmail: text("contact_email").notNull(),
  postedById: integer("posted_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: text("file_size"),
  uploadedById: integer("uploaded_by_id").references(() => users.id).notNull(),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  imageUrl: text("image_url"),
  maxAttendees: integer("max_attendees"),
  registrationCount: integer("registration_count").default(0),
  organizerId: integer("organizer_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  downloadCount: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  registrationCount: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
