import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/authContext";
import { 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  Download, 
  Users, 
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs?limit=3"],
  });

  const { data: forumPosts = [] } = useQuery({
    queryKey: ["/api/forum/posts?limit=3"],
  });

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events?limit=3"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-slate-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-800 mb-6">
              Empowering Geologists <br className="hidden sm:block" />Through Connection
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Join Kenya's premier professional hub for geologists. Network, collaborate, share research, find opportunities, and shape the future of our geological profession.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 text-lg font-semibold">
                  Join the Community
                </Button>
              </Link>
              <Link href="/forums">
                <Button variant="outline" size="lg" className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white px-8 py-3 text-lg font-semibold">
                  Explore Platform
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-slate-500">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">500+</div>
                <div className="text-sm">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">120+</div>
                <div className="text-sm">Job Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">350+</div>
                <div className="text-sm">Active Discussions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">What's Happening in Our Community</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Stay connected with the latest opportunities, discussions, and resources in Kenya's geological community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Recent Job Postings */}
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  Latest Job Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs.length > 0 ? (
                    jobs.map((job: any) => (
                      <div key={job.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-medium text-slate-700">{job.title}</h4>
                        <p className="text-sm text-slate-500">{job.company}</p>
                        <p className="text-xs text-slate-400">
                          {job.location} • {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No job postings available.</p>
                  )}
                </div>
                <Link href="/jobs">
                  <Button variant="link" className="mt-4 p-0 h-auto text-blue-600 hover:text-blue-700">
                    View all opportunities
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Hot Discussions */}
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  Hot Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forumPosts.length > 0 ? (
                    forumPosts.map((post: any) => (
                      <div key={post.id} className="p-3 bg-white rounded-lg">
                        <h4 className="font-medium text-slate-700 mb-1">{post.title}</h4>
                        <p className="text-sm text-slate-500 mb-2">{post.content.substring(0, 100)}...</p>
                        <div className="flex items-center text-xs text-slate-400">
                          <span>@{post.author?.username}</span>
                          <span className="mx-2">•</span>
                          <span>{post.replyCount} replies</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No discussions available.</p>
                  )}
                </div>
                <Link href="/forums">
                  <Button variant="link" className="mt-4 p-0 h-auto text-green-600 hover:text-green-700">
                    Join the conversation
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.length > 0 ? (
                    events.map((event: any) => (
                      <div key={event.id} className="p-3 bg-white rounded-lg">
                        <h4 className="font-medium text-slate-700 mb-1">{event.title}</h4>
                        <p className="text-sm text-slate-500 mb-2">{event.location}</p>
                        <div className="flex items-center text-xs text-slate-400">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No upcoming events.</p>
                  )}
                </div>
                <Link href="/events">
                  <Button variant="link" className="mt-4 p-0 h-auto text-orange-600 hover:text-orange-700">
                    View all events
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action - Only show for non-authenticated users */}
      {!user && (
        <section className="py-16 bg-gradient-to-br from-green-700 to-green-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Kenya's Geological Community?</h2>
            <p className="text-xl text-green-100 mb-8">Connect with fellow geologists, find opportunities, and advance your career with GeoConnect Kenya.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 px-8 py-3 text-lg font-semibold">
                  Create Your Profile
                </Button>
              </Link>
              <Link href="/forums">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 text-lg font-semibold">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="text-green-100 text-sm mt-6">Join 500+ geologists already connected on our platform</p>
          </div>
        </section>
      )}
    </div>
  );
}
