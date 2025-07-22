import { motion } from "framer-motion";
import { RobotLogo } from "@/components/RobotLogo";
import bemoraPng from "@assets/file_00000000b38462439ee014f225bec5b0.png";

export function AboutSection() {
  const stats = [
    { value: "150+", label: "Videos" },
    { value: "15K+", label: "Followers" },
    { value: "3+", label: "Years" },
    { value: "4", label: "Platforms" },
  ];

  return (
    <section id="about" className="py-12 bg-muted relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full opacity-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary filter blur-[100px]"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary filter blur-[100px]"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            className="md:w-2/5 flex justify-center"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <img
                src={bemoraPng}
                alt="BEMORA Logo with turquoise robot and pink text"
                className="rounded-2xl shadow-2xl w-full max-w-md h-auto"
              />
              <motion.div 
                className="absolute -bottom-6 -right-6 transform rotate-12 bg-primary p-3 rounded-lg shadow-xl"
                animate={{ rotate: [12, 0, 12] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-12 h-12 robot-container">
                  <RobotLogo size={48} className="text-background" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="md:w-3/5"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-heading mb-6">
              <span className="text-primary">About</span>{" "}
              <span className="text-secondary">BEMORA</span>
            </h2>

            <div className="space-y-4 text-lg">
              <p>
                Welcome to my digital universe! I'm the creator behind BEMORA, passionate about technology, gaming, and creating engaging content that connects with audiences across multiple platforms.
              </p>

              <p>
                What began as a hobby has evolved into a dedicated journey of content creation, where I share my experiences, insights, and entertainment with a growing community of followers.
              </p>

              <p>
                My mission is to create content that not only entertains but also informs and inspires. Whether you're here for tech reviews, gaming streams, or just to connect with like-minded individuals, BEMORA is your digital home.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.label} 
                  className="bg-background rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <h3 className="text-3xl font-bold text-primary mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
