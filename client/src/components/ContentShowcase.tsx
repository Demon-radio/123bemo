import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, Eye, Calendar, ThumbsUp, MessageSquare, Clock } from "lucide-react";
import { FaYoutube, FaFacebookF } from "react-icons/fa6";

type ContentType = "all" | "youtube" | "facebook";

// اضفنا ثلاث عناصر محتوى بدلاً من اثنين فقط
const contentItems = [
  {
    id: 1,
    type: "youtube",
    title: "BEMORA YouTube Short #1",
    image: "https://img.youtube.com/vi/B_WnTN1ni3U/maxresdefault.jpg",
    duration: "0:30",
    date: "Featured Short",
    url: "https://youtube.com/shorts/B_WnTN1ni3U",
    stats: {
      views: "1.2K"
    }
  },
  {
    id: 2,
    type: "facebook",
    title: "BEMORA Facebook Content",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    content: "Check out my latest Facebook content! 🎮✨",
    url: "https://www.facebook.com/share/v/1NJHjVxyaB/",
    date: "Featured Post",
    stats: {
      likes: "156",
      comments: "28"
    }
  },
  {
    id: 3,
    type: "youtube",
    title: "BEMORA YouTube Short #2",
    image: "https://img.youtube.com/vi/B_WnTN1ni3U/hqdefault.jpg",
    duration: "0:45",
    date: "New Short",
    url: "https://youtube.com/shorts/B_WnTN1ni3U",
    stats: {
      views: "2.5K"
    }
  }
];

export function ContentShowcase() {
  const [activeFilter, setActiveFilter] = useState<ContentType>("all");
  const [filteredContent, setFilteredContent] = useState(contentItems);

  // دالة تصفية المحتوى بناءً على النوع المحدد
  const updateFilteredContent = useCallback(() => {
    console.log("Filtering by:", activeFilter);
    if (activeFilter === "all") {
      setFilteredContent([...contentItems]);
    } else {
      const filtered = contentItems.filter(item => item.type === activeFilter);
      console.log("Filtered items:", filtered.length);
      setFilteredContent(filtered);
    }
  }, [activeFilter]);

  // تنفيذ التصفية عند تغيير النوع المحدد
  useEffect(() => {
    updateFilteredContent();
  }, [activeFilter, updateFilteredContent]);

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
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {filteredContent.map((item) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="content-card bg-muted rounded-xl overflow-hidden h-full block"
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
            </motion.a>
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
