import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";
import { useLocation } from "wouter";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Settings
} from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    fieldExperience: user?.fieldExperience || "",
    education: user?.education || "",
    location: user?.location || "",
    availability: user?.availability || "",
    skills: user?.skills?.join(", ") || "",
  });

  // Redirect to auth if not logged in
  if (!user) {
    setLocation("/auth");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        ...formData,
        skills: formData.skills.split(",").map(skill => skill.trim()).filter(skill => skill),
      });
      
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      bio: user?.bio || "",
      fieldExperience: user?.fieldExperience || "",
      education: user?.education || "",
      location: user?.location || "",
      availability: user?.availability || "",
      skills: user?.skills?.join(", ") || "",
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">My Profile</h1>
          <p className="text-slate-600">Manage your professional information and settings</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.fullName}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-green-700">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-1">{user.fullName}</h2>
                <p className="text-slate-500 mb-2">@{user.username}</p>
                
                {user.location && (
                  <div className="flex items-center justify-center text-sm text-slate-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </div>
                )}
                
                <div className="flex items-center justify-center text-sm text-slate-600 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {formatDate(user.createdAt)}
                </div>
                
                {user.availability && (
                  <Badge variant="secondary" className="mb-4">
                    {user.availability}
                  </Badge>
                )}
                
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-green-700 hover:bg-green-800"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Professional Information
                  </span>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        form="profile-form"
                        size="sm"
                        disabled={loading}
                        className="bg-green-700 hover:bg-green-800"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {loading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                          />
                        ) : (
                          <p className="text-slate-700 py-2">{user.fullName}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center py-2">
                          <Mail className="w-4 h-4 mr-2 text-slate-500" />
                          <span className="text-slate-700">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        {isEditing ? (
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g., Nairobi, Kenya"
                          />
                        ) : (
                          <p className="text-slate-700 py-2">{user.location || "Not specified"}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability</Label>
                        {isEditing ? (
                          <Input
                            id="availability"
                            name="availability"
                            value={formData.availability}
                            onChange={handleInputChange}
                            placeholder="e.g., Available for freelance work"
                          />
                        ) : (
                          <p className="text-slate-700 py-2">{user.availability || "Not specified"}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      ) : (
                        <p className="text-slate-700 py-2">{user.bio || "No bio provided"}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Education & Experience
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      {isEditing ? (
                        <Input
                          id="education"
                          name="education"
                          value={formData.education}
                          onChange={handleInputChange}
                          placeholder="e.g., BSc Geology, University of Nairobi"
                        />
                      ) : (
                        <p className="text-slate-700 py-2">{user.education || "Not specified"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fieldExperience">Field Experience</Label>
                      {isEditing ? (
                        <Textarea
                          id="fieldExperience"
                          name="fieldExperience"
                          value={formData.fieldExperience}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Describe your geological field experience..."
                        />
                      ) : (
                        <p className="text-slate-700 py-2">{user.fieldExperience || "No field experience provided"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      {isEditing ? (
                        <Input
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          placeholder="e.g., GIS, Remote Sensing, Structural Geology (comma separated)"
                        />
                      ) : (
                        <div className="py-2">
                          {user.skills && user.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {user.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500">No skills listed</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
