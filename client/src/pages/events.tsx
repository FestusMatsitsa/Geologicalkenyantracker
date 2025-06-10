import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus,
  ExternalLink
} from "lucide-react";

export default function Events() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    imageUrl: "",
    maxAttendees: "",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/events", {
        ...eventData,
        date: new Date(eventData.date).toISOString(),
        maxAttendees: eventData.maxAttendees ? parseInt(eventData.maxAttendees) : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        location: "",
        date: "",
        imageUrl: "",
        maxAttendees: "",
      });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/register`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Successfully registered for the event",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an event",
        variant: "destructive",
      });
      return;
    }
    createEventMutation.mutate(newEvent);
  };

  const handleRegister = (eventId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for events",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(eventId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-green-800 mb-4">Upcoming Events</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">Stay updated with conferences, webinars, field trips, and networking events in the geological community.</p>
        </div>

        {/* Create Event Button */}
        <div className="mb-8 text-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={newEvent.maxAttendees}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={newEvent.imageUrl}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event: any) => {
              const dateInfo = formatDate(event.date);
              const isUpcoming = new Date(event.date) > new Date();
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.imageUrl && (
                    <div className="h-48 bg-slate-200 overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex flex-col items-center justify-center text-white mr-4">
                        <div className="text-lg font-bold">{dateInfo.day}</div>
                        <div className="text-xs">{dateInfo.month}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-700 mb-1">{event.title}</h3>
                        <p className="text-sm text-slate-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">{event.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{dateInfo.full}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>
                          {event.registrationCount || 0}
                          {event.maxAttendees && ` / ${event.maxAttendees}`} 
                          {event.maxAttendees ? ' registered' : ' attending'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-800"
                        onClick={() => handleRegister(event.id)}
                        disabled={!isUpcoming || registerMutation.isPending}
                      >
                        {!isUpcoming ? 'Past Event' : 'Register'}
                      </Button>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-400">
                        Organized by @{event.organizer?.username}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No events scheduled</h3>
                  <p className="text-slate-500 mb-4">Be the first to organize an event for the geological community!</p>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-700 hover:bg-green-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Event
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
