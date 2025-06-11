import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Download, 
  Plus, 
  Search,
  FileText,
  Map,
  BookOpen,
  RotateCcw,
  File,
  User,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";

const resourceCategories = [
  { name: "All Categories", value: "" },
  { name: "Geological Maps", value: "Geological Maps", icon: Map, color: "text-blue-600 bg-blue-100" },
  { name: "Field Manuals", value: "Field Manuals", icon: BookOpen, color: "text-green-600 bg-green-100" },
  { name: "Research Papers", value: "Research Papers", icon: FileText, color: "text-purple-600 bg-purple-100" },
  { name: "Thesis Examples", value: "Thesis Examples", icon: RotateCcw, color: "text-orange-600 bg-orange-100" },
];

export default function Resources() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "",
    fileUrl: "",
    fileName: "",
    fileSize: "",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: resources = [] } = useQuery({
    queryKey: selectedCategory ? [`/api/resources?category=${selectedCategory}`] : ["/api/resources"],
  });

  const createResourceMutation = useMutation({
    mutationFn: async (resourceData: any) => {
      const response = await apiRequest("POST", "/api/resources", resourceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsDialogOpen(false);
      setNewResource({
        title: "",
        description: "",
        category: "",
        fileUrl: "",
        fileName: "",
        fileSize: "",
      });
      toast({
        title: "Success",
        description: "Resource shared successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share resource",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      await apiRequest("POST", `/api/resources/${resourceId}/download`);
    },
  });

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share a resource",
        variant: "destructive",
      });
      return;
    }
    createResourceMutation.mutate(newResource);
  };

  const handleDownload = (resource: any) => {
    downloadMutation.mutate(resource.id);
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    } else {
      toast({
        title: "Download Unavailable",
        description: "This resource file is not available for download",
        variant: "destructive",
      });
    }
  };

  const filteredResources = resources.filter((resource: any) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Resource Library</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">Access geological maps, field manuals, research papers, and share useful materials with the community.</p>
        </div>

        {/* Search and Category Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                  Search Resources
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-2">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Overview */}
        {!selectedCategory && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {resourceCategories.slice(1).map((category) => {
              const IconComponent = category.icon;
              const categoryResources = Array.isArray(resources) ? resources.filter((r: any) => r.category === category.value) : [];
              
              return (
                <Card 
                  key={category.value} 
                  className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${category.color}`}>
                      {React.createElement(IconComponent, { className: "w-8 h-8" })}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">{category.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {category.name === "Geological Maps" && "Topographic and geological survey maps of Kenya and East Africa"}
                      {category.name === "Field Manuals" && "Practical guides for geological fieldwork and data collection"}
                      {category.name === "Research Papers" && "Academic publications and geological research studies"}
                      {category.name === "Thesis Examples" && "Graduate thesis examples and academic templates"}
                    </p>
                    <div className="text-sm text-green-700 font-medium">
                      {categoryResources.length} documents
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Share Resource Button */}
        <div className="mb-8 text-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="w-4 h-4 mr-2" />
                Share a Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share New Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateResource} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newResource.category}
                    onValueChange={(value) => setNewResource(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceCategories.slice(1).map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newResource.description}
                    onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileName">File Name</Label>
                    <Input
                      id="fileName"
                      value={newResource.fileName}
                      onChange={(e) => setNewResource(prev => ({ ...prev, fileName: e.target.value }))}
                      placeholder="e.g., geological-survey-2024.pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fileSize">File Size</Label>
                    <Input
                      id="fileSize"
                      value={newResource.fileSize}
                      onChange={(e) => setNewResource(prev => ({ ...prev, fileSize: e.target.value }))}
                      placeholder="e.g., 2.4 MB"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileUrl">File URL (optional)</Label>
                  <Input
                    id="fileUrl"
                    type="url"
                    value={newResource.fileUrl}
                    onChange={(e) => setNewResource(prev => ({ ...prev, fileUrl: e.target.value }))}
                    placeholder="https://example.com/file.pdf"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={createResourceMutation.isPending}
                >
                  {createResourceMutation.isPending ? "Sharing..." : "Share Resource"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resource List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedCategory ? `${selectedCategory} Resources` : "All Resources"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource: any) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                        <File className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-700">{resource.title}</h4>
                        <p className="text-sm text-slate-500">
                          {resource.fileName && `${resource.fileName} • `}
                          {resource.fileSize && `${resource.fileSize} • `}
                          Uploaded by @{resource.uploadedBy?.username}
                        </p>
                        {resource.description && (
                          <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-400">
                        {resource.downloadCount || 0} downloads
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(resource)}
                        disabled={downloadMutation.isPending}
                        className="hover:bg-green-50 hover:text-green-700 hover:border-green-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No resources found</h3>
                  <p className="text-slate-500 mb-4">
                    {selectedCategory 
                      ? `No resources available in the ${selectedCategory} category.`
                      : "No resources match your search criteria."
                    }
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
