import { motion } from "framer-motion";
import { FaXTwitter, FaFacebookF, FaWhatsapp, FaYoutube } from "react-icons/fa6";

const socialLinks = [
  {
    platform: "Twitter/X",
    icon: FaXTwitter,
    url: "https://x.com/Bemora_BEMO",
    username: "@Bemora_BEMO"
  },
  {
    platform: "Facebook",
    icon: FaFacebookF,
    url: "https://www.facebook.com/share/12LQYx45ZEV/",
    username: "BEMORA Page"
  },
  {
    platform: "WhatsApp",
    icon: FaWhatsapp,
    url: "https://chat.whatsapp.com/CmQ8KDLZtmz0BmOKoHCzZh",
    username: "Community Group"
  },
  {
    platform: "YouTube",
    icon: FaYoutube,
    url: "https://www.youtube.com/channel/UCFWrMkQr-siukGZ3gS3dMUA",
    username: "BEMORA Channel"
  }
];

export function SocialLinksSection() {
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
    <section id="social" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading text-center mb-12">
          <span className="gradient-text">Connect with BEMORA</span>
        </h2>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {socialLinks.map((social) => (
            <motion.a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-platform flex flex-col items-center p-6 rounded-xl bg-background transition-all duration-300 hover:bg-opacity-80 social-glow"
              variants={itemVariants}
            >
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 border-2 border-primary">
                <social.icon className="text-3xl text-primary" />
              </div>
              <h3 className="text-xl font-medium">{social.platform}</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center">{social.username}</p>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
