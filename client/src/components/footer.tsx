import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Linkedin,
  MessageSquare,
  Users,
  Calendar,
  BookOpen,
  Briefcase,
  FileText,
  HelpCircle,
  TrendingUp
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const communityLinks = [
    { href: "/forums", label: "Discussion Forums", icon: MessageSquare },
    { href: "/profile", label: "Member Directory", icon: Users },
    { href: "/events", label: "Events Calendar", icon: Calendar },
    { href: "#", label: "Mentorship Program", icon: TrendingUp },
  ];

  const opportunityLinks = [
    { href: "/jobs", label: "Job Board", icon: Briefcase },
    { href: "#", label: "Internships", icon: BookOpen },
    { href: "#", label: "Consulting Projects", icon: FileText },
    { href: "#", label: "Research Collaborations", icon: Users },
  ];

  const resourceLinks = [
    { href: "/resources", label: "Document Library", icon: FileText },
    { href: "#", label: "Industry Reports", icon: BookOpen },
    { href: "#", label: "Career Guides", icon: TrendingUp },
    { href: "#", label: "Field Safety", icon: HelpCircle },
  ];

  const legalLinks = [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Contact Us" },
    { href: "#", label: "Report Issue" },
  ];

  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="ml-2 text-xl font-bold">GeoConnect Kenya</span>
            </div>
            <p className="text-slate-300 mb-4">
              Empowering geologists through connection, collaboration, and career opportunities across Kenya and East Africa.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-slate-300">
              {communityLinks.map((link, i) => (
                <li key={`${link.href}-${i}`}>
                  <Link href={link.href}>
                    <span className="hover:text-white transition-colors cursor-pointer flex items-center">
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Opportunities</h3>
            <ul className="space-y-2 text-slate-300">
              {opportunityLinks.map((link, i) => (
                <li key={`${link.href}-${i}`}>
                  <Link href={link.href}>
                    <span className="hover:text-white transition-colors cursor-pointer flex items-center">
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}

          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-slate-300">
              {resourceLinks.map((link, i) => (
                <li key={`${link.href}-${i}`}>
                  <Link href={link.href}>
                    <span className="hover:text-white transition-colors cursor-pointer flex items-center">
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} GeoConnect Kenya. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
