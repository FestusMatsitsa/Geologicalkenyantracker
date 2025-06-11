import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertForumPostSchema, insertForumReplySchema, insertJobSchema, insertResourceSchema, insertEventSchema, insertEventRegistrationSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to authenticate JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
      
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
      
      res.json({ user: { ...user, password: undefined }, token });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // User routes
  app.get("/api/users/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.put("/api/users/me", authenticateToken, async (req: any, res) => {
    try {
      const userData = req.body;
      const user = await storage.updateUser(req.user.userId, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Forum routes
  app.get("/api/forum/categories", async (req, res) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/forum/posts", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const posts = await storage.getForumPosts(categoryId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/forum/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getForumPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/forum/posts", authenticateToken, async (req: any, res) => {
    try {
      const postData = insertForumPostSchema.parse({
        ...req.body,
        authorId: req.user.userId,
      });
      const post = await storage.createForumPost(postData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/forum/posts/:id/replies", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const replies = await storage.getForumReplies(postId);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/forum/posts/:id/replies", authenticateToken, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        postId,
        authorId: req.user.userId,
      });
      const reply = await storage.createForumReply(replyData);
      res.json(reply);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const jobs = await storage.getJobs(limit);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/jobs", authenticateToken, async (req: any, res) => {
    try {
      const jobData = insertJobSchema.parse({
        ...req.body,
        postedById: req.user.userId,
      });
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    try {
      const category = req.query.category as string;
      const resources = await storage.getResources(category);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/resources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getResource(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/resources", authenticateToken, async (req: any, res) => {
    try {
      const resourceData = insertResourceSchema.parse({
        ...req.body,
        uploadedById: req.user.userId,
      });
      const resource = await storage.createResource(resourceData);
      res.json(resource);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.post("/api/resources/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementDownloadCount(id);
      res.json({ message: "Download count incremented" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete("/api/resources/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getResource(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Only allow resource owner to delete
      if (resource.uploadedBy.id !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to delete this resource" });
      }
      
      await storage.deleteResource(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const events = await storage.getEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/events", authenticateToken, async (req: any, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: req.user.userId,
      });
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.post("/api/events/:id/register", authenticateToken, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.userId;
      
      // Check if already registered
      const isRegistered = await storage.isUserRegisteredForEvent(eventId, userId);
      if (isRegistered) {
        return res.status(400).json({ message: "Already registered for this event" });
      }
      
      const registration = await storage.registerForEvent({ eventId, userId });
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Message routes
  app.get("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const messages = await storage.getMessages(req.user.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/messages", authenticateToken, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.userId,
      });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.put("/api/messages/:id/read", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markMessageAsRead(id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
