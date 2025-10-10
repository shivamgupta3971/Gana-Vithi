import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { 
  MessageCircle, 
  Send, 
  Mic, 
  Globe,
  BookOpen,
  GraduationCap,
  Award,
  Users,
  Phone
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  language?: string;
  type?: 'text' | 'suggestion' | 'resource';
}

const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long (max 1000 characters)')
});

const ChatBot = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "नमस्ते! मैं आपका AI शिक्षा सलाहकार हूं। मैं 15+ भाषाओं में सरकारी कॉलेजों के बारे में जानकारी दे सकता हूं। आप कैसे मदद चाहते हैं?",
      isUser: false,
      timestamp: new Date(),
      language: 'hi'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isListening, setIsListening] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' }
  ];

  const quickQuestions = [
    { text: "Best engineering colleges?", icon: "🏗️" },
    { text: "Medical college fees?", icon: "⚕️" },
    { text: "Scholarship deadlines?", icon: "💰" },
    { text: "JEE preparation tips?", icon: "📚" },
    { text: "IAS exam pattern?", icon: "🏛️" },
    { text: "College hostel info?", icon: "🏠" }
  ];

  const sendMessage = async (content: string) => {
    // Validate input
    const result = messageSchema.safeParse({ content });
    if (!result.success) {
      toast({
        title: "Invalid message",
        description: result.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    const validatedContent = result.data.content;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: validatedContent,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Call AI backend
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: validatedContent,
          language: selectedLanguage,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.content
          }))
        }
      });

      if (error) {
        console.error('Error calling chat-ai:', error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setInputMessage("Tell me about engineering colleges in Tamil Nadu");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MessageCircle className="h-4 w-4" />
              AI Counselor - 24/7 Available
            </div>
            <h2 className="text-3xl font-bold mb-4">Talk to Your AI Career Counselor</h2>
            <p className="text-muted-foreground text-lg">
              Get instant guidance in your preferred language. Our AI understands regional contexts and government college systems.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col gradient-card border-0 shadow-medium">
                {/* Chat Header */}
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">AI Career Counselor</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          Online • Responds instantly
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="text-sm border rounded px-2 py-1 bg-background"
                      >
                        {languages.map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                        <div className="whitespace-pre-line leading-relaxed">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Questions */}
                <div className="p-4 border-t border-border/50">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quickQuestions.map((question, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => sendMessage(question.text)}
                      >
                        {question.icon} {question.text}
                      </Button>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about government colleges..."
                        className="pr-12"
                        onKeyPress={(e) => e.key === 'Enter' && inputMessage.trim() && sendMessage(inputMessage)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`absolute right-1 top-1/2 -translate-y-1/2 ${isListening ? 'text-destructive' : ''}`}
                        onClick={handleVoiceInput}
                      >
                        <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                      </Button>
                    </div>
                    <Button 
                      onClick={() => inputMessage.trim() && sendMessage(inputMessage)}
                      disabled={!inputMessage.trim()}
                      className="gradient-primary text-white border-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Capabilities */}
              <Card className="p-6 gradient-card border-0 shadow-medium">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  AI Capabilities
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      🌐
                    </div>
                    <div>
                      <div className="font-medium">15+ Languages</div>
                      <div className="text-xs text-muted-foreground">Regional language support</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                      🎯
                    </div>
                    <div>
                      <div className="font-medium">Personalized Advice</div>
                      <div className="text-xs text-muted-foreground">Based on your profile</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      📊
                    </div>
                    <div>
                      <div className="font-medium">Real-time Data</div>
                      <div className="text-xs text-muted-foreground">Latest college info</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Popular Topics */}
              <Card className="p-6 gradient-card border-0 shadow-medium">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  Popular Topics
                </h3>
                <div className="space-y-2">
                  {[
                    { topic: "Engineering Admissions", count: "2.1k questions" },
                    { topic: "Medical College Fees", count: "1.8k questions" },
                    { topic: "Scholarship Applications", count: "1.5k questions" },
                    { topic: "IAS Preparation", count: "1.2k questions" },
                    { topic: "College Hostel Info", count: "950 questions" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-smooth">
                      <span className="text-sm font-medium">{item.topic}</span>
                      <Badge variant="outline" className="text-xs">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Success Stories */}
              <Card className="p-6 gradient-card border-0 shadow-medium">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  Recent Success
                </h3>
                <div className="text-sm">
                  <div className="font-medium text-secondary mb-1">Priya from Rajasthan</div>
                  <div className="text-muted-foreground text-xs mb-2">Got admission to AIIMS Delhi</div>
                  <p className="text-xs leading-relaxed">"The AI counselor helped me understand the scholarship process in Hindi. Now I'm studying medicine with full financial support!"</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;