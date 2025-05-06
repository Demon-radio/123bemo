import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Eye, Calendar, ThumbsUp, MessageSquare, Clock } from "lucide-react";
import { FaYoutube, FaXTwitter, FaFacebookF } from "react-icons/fa6";

type ContentType = "all" | "youtube" | "twitter" | "facebook";

const contentItems = [
  {
    id: 1,
    type: "youtube",
    title: "Ultimate Gaming Setup Tour 2023 - BEMORA Edition",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    duration: "10:24",
    date: "2 days ago",
    stats: {
      views: "3.2K"
    }
  },
  {
    id: 2,
    type: "twitter",
    title: "New Video Tutorial",
    content: "Just dropped a new video tutorial on my YouTube channel! Check out how to optimize your streaming setup for maximum performance 🎮🔥 #Gaming #Tech #Streaming",
    date: "12:45 PM · Mar 15, 2023",
    stats: {
      likes: "245",
      retweets: "32",
      comments: "18"
    }
  },
  {
    id: 3,
    type: "facebook",
    title: "New RGB setup is complete! What do you think of the colors?",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    content: "The perfect gaming atmosphere is all about the lighting! 🎮✨",
    date: "Yesterday",
    stats: {
      likes: "320",
      comments: "45"
    }
  },
  {
    id: 4,
    type: "youtube",
    title: "How I Create My Social Media Content - Behind The Scenes",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    duration: "15:36",
    date: "1 week ago",
    stats: {
      views: "5.7K"
    }
  },
  {
    id: 5,
    type: "twitter",
    title: "Content Suggestions",
    content: "What content would you like to see next on my channel? Reply with your suggestions! 🤖💬 #ContentCreator #AskTheCommunity",
    date: "09:22 AM · Mar 18, 2023",
    stats: {
      likes: "178",
      retweets: "24",
      comments: "53"
    }
  },
  {
    id: 6,
    type: "facebook",
    title: "Upgraded my streaming setup! Now with better audio quality!",
    image: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    content: "Finally invested in a proper microphone and audio interface. Sound quality makes such a difference! 🎙️🔊",
    date: "3 days ago",
    stats: {
      likes: "287",
      comments: "32"
    }
  }
];

export function ContentShowcase() {
  const [activeFilter, setActiveFilter] = useState<ContentType>("all");

  const filteredContent = contentItems.filter(item => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="content" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading text-center mb-4">
          <span className="text-primary">Latest</span>{" "}
          <span className="text-secondary">Content</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Check out my latest videos, posts, and updates from across my social media platforms.
        </p>

        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex space-x-2 bg-muted rounded-full p-1">
            <Button
              variant={activeFilter === "all" ? "default" : "ghost"}
              onClick={() => setActiveFilter("all")}
              className={cn(
                "rounded-full",
                activeFilter === "all" ? "bg-background text-primary" : ""
              )}
            >
              All
            </Button>
            <Button
              variant={activeFilter === "youtube" ? "default" : "ghost"}
              onClick={() => setActiveFilter("youtube")}
              className={cn(
                "rounded-full",
                activeFilter === "youtube" ? "bg-background text-primary" : ""
              )}
            >
              YouTube
            </Button>
            <Button
              variant={activeFilter === "twitter" ? "default" : "ghost"}
              onClick={() => setActiveFilter("twitter")}
              className={cn(
                "rounded-full",
                activeFilter === "twitter" ? "bg-background text-primary" : ""
              )}
            >
              Twitter
            </Button>
            <Button
              variant={activeFilter === "facebook" ? "default" : "ghost"}
              onClick={() => setActiveFilter("facebook")}
              className={cn(
                "rounded-full",
                activeFilter === "facebook" ? "bg-background text-primary" : ""
              )}
            >
              Facebook
            </Button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {filteredContent.map((item) => (
            <motion.div
              key={item.id}
              className="content-card bg-muted rounded-xl overflow-hidden h-full"
              variants={itemVariants}
            >
              {item.type === "youtube" && (
                <>
                  <div className="relative pb-[56.25%] bg-background">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-50"></div>
                    <div className="absolute bottom-3 right-3 bg-secondary text-white text-xs font-mono py-1 px-2 rounded">
                      {item.duration}
                    </div>
                    <div className="absolute top-3 left-3 bg-background bg-opacity-70 text-white text-xs py-1 px-2 rounded-full flex items-center">
                      <FaYoutube className="text-red-500 mr-1" /> YouTube
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium line-clamp-2 mb-2">{item.title}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{item.stats.views} views</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {item.type === "twitter" && (
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-6 h-4 bg-background rounded-md flex items-center justify-center">
                        <div className="flex space-x-0.5">
                          <div className="w-0.5 h-0.5 bg-primary rounded-full"></div>
                          <div className="w-0.5 h-0.5 bg-primary rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">BEMORA</h4>
                      <p className="text-xs text-muted-foreground">@Bemora_BEMO</p>
                    </div>
                    <div className="ml-auto">
                      <FaXTwitter className="text-muted-foreground" />
                    </div>
                  </div>
                  <p className="mb-4">{item.content}</p>
                  <div className="flex justify-between text-xs text-muted-foreground mt-auto">
                    <span>{item.date}</span>
                    <div className="flex space-x-3">
                      <div><ThumbsUp className="inline h-3 w-3 mr-1" /> {item.stats.likes}</div>
                      <div><ChevronRight className="inline h-3 w-3 mr-1 rotate-90" /> {item.stats.retweets}</div>
                      <div><MessageSquare className="inline h-3 w-3 mr-1" /> {item.stats.comments}</div>
                    </div>
                  </div>
                </div>
              )}

              {item.type === "facebook" && (
                <>
                  <div className="relative pb-[75%] bg-background">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-background bg-opacity-70 text-white text-xs py-1 px-2 rounded-full flex items-center">
                      <FaFacebookF className="text-blue-500 mr-1" /> Facebook
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.content}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div><ThumbsUp className="inline h-4 w-4 text-blue-500 mr-1" /> {item.stats.likes}</div>
                        <div><MessageSquare className="inline h-4 w-4 mr-1" /> {item.stats.comments}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Clock className="inline h-4 w-4 mr-1" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center mt-12">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/10 transition-all flex items-center space-x-2"
          >
            <span>View More Content</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
