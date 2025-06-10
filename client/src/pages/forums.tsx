import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Plus, 
  AlertCircle, 
  Lightbulb, 
  Award, 
  Calendar,
  HelpCircle,
  RefreshCw,
  Clock,
  User
} from "lucide-react";

const categoryIcons = {
  "Job Frustrations": AlertCircle,
  "Research Ideas": Lightbulb,
  "Success Stories": Award,
  "Internship Alerts": Calendar,
  "Professional Advice": HelpCircle,
  "Career Change": RefreshCw,
};

const categoryColors = {
  "Job Frustrations": "text-red-600 bg-red-100",
  "Research Ideas": "text-blue-600 bg-blue-100",
  "Success Stories": "text-green-600 bg-green-100",
  "Internship Alerts": "text-orange-600 bg-orange-100",
  "Professional Advice": "text-purple-600 bg-purple-100",
  "Career Change": "text-indigo-600 bg-indigo-100",
};

export default function Forums() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", categoryId: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/forum/categories"],
  });

  const { data: posts = [] } = useQuery({
    queryKey: selectedCategory ? [`/api/forum/posts?categoryId=${selectedCategory}`] : ["/api/forum/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest("POST", "/api/forum/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setIsDialogOpen(false);
      setNewPost({ title: "", content: "", categoryId: "" });
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate({
      ...newPost,
      categoryId: parseInt(newPost.categoryId),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Community Forums</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">Connect with fellow geologists, share experiences, and get answers to your questions.</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-green-700 hover:bg-green-800" : ""}
            >
              All Categories
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-green-700 hover:bg-green-800" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Create Post Button */}
        <div className="mb-8 text-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="w-4 h-4 mr-2" />
                Create New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPost.categoryId}
                    onValueChange={(value) => setNewPost(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Forum Categories Grid */}
        {selectedCategory === null && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category: any) => {
              const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || MessageSquare;
              const colorClass = categoryColors[category.name as keyof typeof categoryColors] || "text-slate-600 bg-slate-100";
              
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCategory(category.id)}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-slate-700">{category.name}</h3>
                        <p className="text-sm text-slate-500">
                          {posts.filter((post: any) => post.categoryId === category.id).length} discussions
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Forum Posts */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post: any) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{post.category?.name}</Badge>
                        <span className="text-sm text-slate-500">
                          by {post.author?.username}
                        </span>
                        <span className="text-sm text-slate-400">•</span>
                        <span className="text-sm text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">{post.title}</h3>
                      <p className="text-slate-600 mb-4">{post.content.substring(0, 200)}...</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replyCount || 0} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No posts yet</h3>
                <p className="text-slate-500 mb-4">Be the first to start a discussion in this category!</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-700 hover:bg-green-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Post
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
