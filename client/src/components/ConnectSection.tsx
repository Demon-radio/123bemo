import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FaXTwitter, FaFacebookF, FaWhatsapp, FaYoutube } from "react-icons/fa6";

export function ConnectSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to BEMORA updates.",
        duration: 5000,
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  const socialLinks = [
    { icon: FaXTwitter, label: "Twitter/X", href: "https://x.com/Bemora_BEMO" },
    { icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com/share/12LQYx45ZEV/" },
    { icon: FaWhatsapp, label: "WhatsApp", href: "https://chat.whatsapp.com/CmQ8KDLZtmz0BmOKoHCzZh" },
    { icon: FaYoutube, label: "YouTube", href: "https://www.youtube.com/channel/UCFWrMkQr-siukGZ3gS3dMUA" },
  ];

  const contactLink = "https://linktr.ee/Mustafa_Bemo";

  return (
    <section id="connect" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading mb-6">
              <span className="text-primary">Join the</span>{" "}
              <span className="text-secondary">BEMORA</span>{" "}
              <span className="text-primary">Community</span>
            </h2>
            <p className="text-lg mb-4">
              Stay updated with my latest content and connect with me on your favorite platforms.
            </p>
            <div className="mb-8">
              <Button 
                onClick={() => window.open(contactLink, "_blank")}
                className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 py-3"
              >
                Contact Me
              </Button>
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon px-5 py-3 bg-muted rounded-full flex items-center gap-2 hover:bg-background hover:border-primary border border-transparent transition-all"
                whileHover={{ y: -5 }}
              >
                <social.icon className="text-primary" />
                <span>{social.label}</span>
              </motion.a>
            ))}
          </motion.div>

          <motion.div 
            className="bg-muted p-8 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-2xl font-heading mb-4">Never Miss an Update</h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to get notified when new content is posted.
            </p>

            <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-4 py-3 bg-background border border-primary focus:border-secondary"
                  required
                />
                <Button 
                  type="submit"
                  className="px-6 py-3 bg-primary text-background font-medium hover:bg-primary/90 transition-all whitespace-nowrap"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                By subscribing, you agree to receive email updates from BEMORA. You can unsubscribe at any time.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
