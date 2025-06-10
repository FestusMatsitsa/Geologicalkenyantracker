import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Plus,
  Search,
  Building,
  Calendar
} from "lucide-react";

const locations = [
  "All Locations",
  "Nairobi",
  "Mombasa", 
  "Nakuru",
  "Eldoret",
  "Kisumu",
  "Meru",
  "Nyeri"
];

const jobTypes = [
  "All Types",
  "Full-time",
  "Part-time", 
  "Contract",
  "Internship",
  "Remote"
];

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    description: "",
    requirements: "",
    salary: "",
    contactEmail: "",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await apiRequest("POST", "/api/jobs", {
        ...jobData,
        requirements: jobData.requirements.split('\n').filter((req: string) => req.trim()),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setIsDialogOpen(false);
      setNewJob({
        title: "",
        company: "",
        location: "",
        type: "",
        description: "",
        requirements: "",
        salary: "",
        contactEmail: "",
      });
      toast({
        title: "Success",
        description: "Job posted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive",
      });
    },
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post a job",
        variant: "destructive",
      });
      return;
    }
    createJobMutation.mutate(newJob);
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === "All Locations" || job.location.includes(selectedLocation);
    const matchesType = selectedType === "All Types" || job.type === selectedType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Job Opportunities</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">Discover career opportunities posted by leading employers in Kenya's geological sector.</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                  Job Title or Keywords
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="e.g. Geologist, Mining Engineer"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-2">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-2">Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post Job Button */}
        <div className="mb-8 text-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newJob.company}
                      onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Job Type</Label>
                    <Select
                      value={newJob.type}
                      onValueChange={(value) => setNewJob(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.slice(1).map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary (Optional)</Label>
                    <Input
                      id="salary"
                      value={newJob.salary}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
                      placeholder="e.g. KSh 120,000/month"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                    rows={4}
                    placeholder="Bachelor's degree in Geology&#10;5+ years of experience&#10;Proficiency in GIS software"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={newJob.contactEmail}
                    onChange={(e) => setNewJob(prev => ({ ...prev, contactEmail: e.target.value }))}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={createJobMutation.isPending}
                >
                  {createJobMutation.isPending ? "Posting..." : "Post Job"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {job.company.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-xl font-semibold text-slate-700 mb-1">{job.title}</h3>
                          <p className="text-lg text-green-700 mb-2">{job.company}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {job.type}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            {job.salary && (
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {job.salary}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mb-4">{job.description}</p>
                          {job.requirements && job.requirements.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.requirements.slice(0, 3).map((req: string, index: number) => (
                                <Badge key={index} variant="secondary">{req}</Badge>
                              ))}
                              {job.requirements.length > 3 && (
                                <Badge variant="secondary">+{job.requirements.length - 3} more</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                      <Button 
                        className="bg-green-700 hover:bg-green-800"
                        onClick={() => window.location.href = `mailto:${job.contactEmail}?subject=Application for ${job.title}`}
                      >
                        Apply Now
                      </Button>
                      <p className="text-xs text-slate-500 mt-2">
                        Posted by {job.postedBy?.username}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No jobs found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your search criteria or check back later for new opportunities.</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLocation("All Locations");
                    setSelectedType("All Types");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
