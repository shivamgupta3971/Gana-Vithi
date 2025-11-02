import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Target, 
  Users, 
  MessageCircle,
  Award,
  MapPin
} from "lucide-react";

const Hero = () => {
  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4 text-sm font-medium px-6 py-2">
            🇮🇳 Empowering Rural Students
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            GYANA VITHI
            <span className="block text-3xl md:text-4xl mt-4 text-white/90">
              Your Path to Government Colleges
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered career guidance in your language. Connecting students to government education opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-strong">
              <Target className="mr-2 h-5 w-5" />
              Start Career Quiz
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold transition-smooth">
              <MessageCircle className="mr-2 h-5 w-5" />
              Talk to AI Counselor
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="animate-fade-in delay-200">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-white/80">Govt Colleges</div>
            </div>
            <div className="animate-fade-in delay-300">
              <div className="text-3xl font-bold">15+</div>
              <div className="text-white/80">Languages</div>
            </div>
            <div className="animate-fade-in delay-400">
              <div className="text-3xl font-bold">₹10L+</div>
              <div className="text-white/80">Scholarships</div>
            </div>
            <div className="animate-fade-in delay-500">
              <div className="text-3xl font-bold">85%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 gradient-card shadow-strong border-0 hover:scale-105 transition-smooth animate-slide-in-right">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-6">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Career Navigator</h3>
            <p className="text-muted-foreground leading-relaxed">
              Personalized career paths based on your interests, scores, and personality. Get matched with perfect government colleges.
            </p>
          </Card>

          <Card className="p-8 gradient-card shadow-strong border-0 hover:scale-105 transition-smooth animate-slide-in-right delay-200">
            <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mb-6">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Quest-Based Learning</h3>
            <p className="text-muted-foreground leading-relaxed">
              Unlock career journeys like game levels. Complete "Engineering Quest" or "Civil Services Journey" step by step.
            </p>
          </Card>

          <Card className="p-8 gradient-card shadow-strong border-0 hover:scale-105 transition-smooth animate-slide-in-right delay-400">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Mentor Network</h3>
            <p className="text-muted-foreground leading-relaxed">
              Connect with alumni from your region who studied in government colleges. Get real guidance from those who've made it.
            </p>
          </Card>
        </div>

        {/* Language Support Banner */}
        <Card className="p-6 gradient-card border-0 shadow-medium text-center animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Available in 15+ Regional Languages</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {["हिंदी", "বাংলা", "తెలుగు", "தமிழ்", "ಕನ್ನಡ", "മലയാളം", "ગુજરાતી", "ਪੰਜਾਬੀ"].map((lang) => (
              <Badge key={lang} variant="outline" className="text-sm">
                {lang}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Hero;