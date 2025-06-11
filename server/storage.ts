import {
  users, forumCategories, forumPosts, forumReplies, jobs, resources, events, eventRegistrations, messages,
  type User, type InsertUser, type ForumCategory, type InsertForumCategory,
  type ForumPost, type InsertForumPost, type ForumReply, type InsertForumReply,
  type Job, type InsertJob, type Resource, type InsertResource,
  type Event, type InsertEvent, type EventRegistration, type InsertEventRegistration,
  type Message, type InsertMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Forum operations
  getForumCategories(): Promise<ForumCategory[]>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  getForumPosts(categoryId?: number): Promise<(ForumPost & { author: User, category: ForumCategory, replyCount: number })[]>;
  getForumPost(id: number): Promise<(ForumPost & { author: User, category: ForumCategory }) | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumReplies(postId: number): Promise<(ForumReply & { author: User })[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  // Job operations
  getJobs(limit?: number): Promise<(Job & { postedBy: User })[]>;
  getJob(id: number): Promise<(Job & { postedBy: User }) | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  
  // Resource operations
  getResources(category?: string): Promise<(Resource & { uploadedBy: User })[]>;
  getResource(id: number): Promise<(Resource & { uploadedBy: User }) | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  incrementDownloadCount(id: number): Promise<void>;
  deleteResource(id: number): Promise<void>;
  
  // Event operations
  getEvents(limit?: number): Promise<(Event & { organizer: User })[]>;
  getEvent(id: number): Promise<(Event & { organizer: User }) | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration>;
  isUserRegisteredForEvent(eventId: number, userId: number): Promise<boolean>;
  
  // Message operations
  getMessages(userId: number): Promise<(Message & { sender: User, receiver: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async getForumCategories(): Promise<ForumCategory[]> {
    return await db.select().from(forumCategories);
  }

  async createForumCategory(category: InsertForumCategory): Promise<ForumCategory> {
    const [newCategory] = await db.insert(forumCategories).values(category).returning();
    return newCategory;
  }

  async getForumPosts(categoryId?: number): Promise<(ForumPost & { author: User, category: ForumCategory, replyCount: number })[]> {
    const query = db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        authorId: forumPosts.authorId,
        categoryId: forumPosts.categoryId,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        author: users,
        category: forumCategories,
        replyCount: count(forumReplies.id).as('replyCount')
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id))
      .leftJoin(forumReplies, eq(forumPosts.id, forumReplies.postId))
      .groupBy(forumPosts.id, users.id, forumCategories.id)
      .orderBy(desc(forumPosts.createdAt));

    if (categoryId) {
      query.where(eq(forumPosts.categoryId, categoryId));
    }

    return await query;
  }

  async getForumPost(id: number): Promise<(ForumPost & { author: User, category: ForumCategory }) | undefined> {
    const [post] = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        authorId: forumPosts.authorId,
        categoryId: forumPosts.categoryId,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        author: users,
        category: forumCategories,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id))
      .where(eq(forumPosts.id, id));
    
    return post;
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    return newPost;
  }

  async getForumReplies(postId: number): Promise<(ForumReply & { author: User })[]> {
    return await db
      .select({
        id: forumReplies.id,
        content: forumReplies.content,
        authorId: forumReplies.authorId,
        postId: forumReplies.postId,
        createdAt: forumReplies.createdAt,
        author: users,
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .where(eq(forumReplies.postId, postId))
      .orderBy(forumReplies.createdAt);
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    return newReply;
  }

  async getJobs(limit = 50): Promise<(Job & { postedBy: User })[]> {
    return await db
      .select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        location: jobs.location,
        type: jobs.type,
        description: jobs.description,
        requirements: jobs.requirements,
        salary: jobs.salary,
        contactEmail: jobs.contactEmail,
        postedById: jobs.postedById,
        createdAt: jobs.createdAt,
        expiresAt: jobs.expiresAt,
        postedBy: users,
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.postedById, users.id))
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
  }

  async getJob(id: number): Promise<(Job & { postedBy: User }) | undefined> {
    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        location: jobs.location,
        type: jobs.type,
        description: jobs.description,
        requirements: jobs.requirements,
        salary: jobs.salary,
        contactEmail: jobs.contactEmail,
        postedById: jobs.postedById,
        createdAt: jobs.createdAt,
        expiresAt: jobs.expiresAt,
        postedBy: users,
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.postedById, users.id))
      .where(eq(jobs.id, id));
    
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getResources(category?: string): Promise<(Resource & { uploadedBy: User })[]> {
    const query = db
      .select({
        id: resources.id,
        title: resources.title,
        description: resources.description,
        category: resources.category,
        fileUrl: resources.fileUrl,
        fileName: resources.fileName,
        fileSize: resources.fileSize,
        uploadedById: resources.uploadedById,
        downloadCount: resources.downloadCount,
        createdAt: resources.createdAt,
        uploadedBy: users,
      })
      .from(resources)
      .leftJoin(users, eq(resources.uploadedById, users.id))
      .orderBy(desc(resources.createdAt));

    if (category) {
      query.where(eq(resources.category, category));
    }

    return await query;
  }

  async getResource(id: number): Promise<(Resource & { uploadedBy: User }) | undefined> {
    const [resource] = await db
      .select({
        id: resources.id,
        title: resources.title,
        description: resources.description,
        category: resources.category,
        fileUrl: resources.fileUrl,
        fileName: resources.fileName,
        fileSize: resources.fileSize,
        uploadedById: resources.uploadedById,
        downloadCount: resources.downloadCount,
        createdAt: resources.createdAt,
        uploadedBy: users,
      })
      .from(resources)
      .leftJoin(users, eq(resources.uploadedById, users.id))
      .where(eq(resources.id, id));
    
    return resource;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await db.update(resources)
      .set({ downloadCount: sql`${resources.downloadCount} + 1` })
      .where(eq(resources.id, id));
  }

  async deleteResource(id: number): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  async getEvents(limit = 50): Promise<(Event & { organizer: User })[]> {
    return await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        date: events.date,
        imageUrl: events.imageUrl,
        maxAttendees: events.maxAttendees,
        registrationCount: events.registrationCount,
        organizerId: events.organizerId,
        createdAt: events.createdAt,
        organizer: users,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .orderBy(events.date)
      .limit(limit);
  }

  async getEvent(id: number): Promise<(Event & { organizer: User }) | undefined> {
    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        location: events.location,
        date: events.date,
        imageUrl: events.imageUrl,
        maxAttendees: events.maxAttendees,
        registrationCount: events.registrationCount,
        organizerId: events.organizerId,
        createdAt: events.createdAt,
        organizer: users,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, id));
    
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [newRegistration] = await db.insert(eventRegistrations).values(registration).returning();
    
    // Increment registration count
    await db.update(events)
      .set({ registrationCount: sql`${events.registrationCount} + 1` })
      .where(eq(events.id, registration.eventId));
    
    return newRegistration;
  }

  async isUserRegisteredForEvent(eventId: number, userId: number): Promise<boolean> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .where(eq(eventRegistrations.userId, userId));
    
    return !!registration;
  }

  async getMessages(userId: number): Promise<(Message & { sender: User, receiver: User })[]> {
    return await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        subject: messages.subject,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          bio: users.bio,
          fieldExperience: users.fieldExperience,
          skills: users.skills,
          education: users.education,
          location: users.location,
          availability: users.availability,
          profilePicture: users.profilePicture,
          createdAt: users.createdAt,
          password: users.password,
        },
        receiver: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          bio: users.bio,
          fieldExperience: users.fieldExperience,
          skills: users.skills,
          education: users.education,
          location: users.location,
          availability: users.availability,
          profilePicture: users.profilePicture,
          createdAt: users.createdAt,
          password: users.password,
        },
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(users, eq(messages.receiverId, users.id))
      .where(eq(messages.receiverId, userId))
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }
}

export const storage = new DatabaseStorage();
