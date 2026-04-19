import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import DonationModal from '@/components/DonationModal';
import { 
  Heart, Users, Gift, Calendar, TrendingUp, Shield, 
  Clock, HandHeart, Zap, Eye, CheckCircle, ArrowRight,
  Camera
} from 'lucide-react';

// CountUp component with Intersection Observer
const CountUp = ({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = end / (duration * 60);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
};


// Section animation wrapper
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const controls = useAnimation();
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          controls.start('visible');
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
      }}
    >
      {children}
    </motion.div>
  );
};

// Rotating text phrases
const rotatingPhrases = [
  "نساعد المحتاجين...",
  "نوصل الدعم لمستحقيه...",
  "معًا نصنع فرقًا...",
  "نصنع حياة أفضل...",
  "نمد يد العون..."
];

export default function HomePage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [currentText, setCurrentText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [showDonationModal, setShowDonationModal] = useState(false); 

  // Typing animation effect
  useEffect(() => {
    const currentPhrase = rotatingPhrases[phraseIndex];
    
    if (isTyping) {
      if (charIndex < currentPhrase.length) {
        const timer = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        setTimeout(() => setIsTyping(true), 3000);
      }
    } else {
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 50);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(true);
        setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
      }
    }
  }, [charIndex, isTyping, phraseIndex]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Parallax Effect */}
      <div className="relative bg-gradient-to-br from-primary-900 to-primary-800 text-white overflow-hidden">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/pattern.png')",
            backgroundRepeat: "repeat",
            backgroundAttachment: "fixed",
            transform: "translateZ(-10px) scale(1.5)",
          }}
        />
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0 bg-[url('/slogan-bg.png')] bg-cover bg-center"
            style={{ backgroundAttachment: 'fixed' }}
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Heart size={40} className="text-secondary" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              جمعية النور المحمدي
            </h1>
            
            {/* Animated Typing Text */}
            <div className="h-16 md:h-20">
              <p className="text-xl md:text-2xl text-gray-300">
                <span className="border-l-2 border-secondary pr-2">
                  {currentText}
                </span>
                <span className="animate-pulse">|</span>
              </p>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/login"
                className="bg-secondary hover:bg-secondary-dark text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                دخول الموظفين
              </Link>
              <a
                href="#contact"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                تواصل معنا
              </a>
              {/* New CTA Button */}
              <a
  onClick={() => setShowDonationModal(true)}
  className="bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer"
  style={{ background: 'linear-gradient(135deg, #e67e22, #d35400)' }}
>
  تبرع الآن
</a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Statistics Section with Count Animation */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedSection>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  +<CountUp end={500} duration={2} />
                </div>
                <div className="text-gray-600 text-sm mt-1">حالة تم مساعدتها</div>
              </motion.div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  <CountUp end={2000000} duration={2} />+
                </div>
                <div className="text-gray-600 text-sm mt-1">ج.م مساعدات مالية</div>
              </motion.div>
            </AnimatedSection>
            <AnimatedSection delay={0.4}>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  +<CountUp end={1000} duration={2} />
                </div>
                <div className="text-gray-600 text-sm mt-1">أسرة مستفيدة</div>
              </motion.div>
            </AnimatedSection>
            <AnimatedSection delay={0.6}>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  +<CountUp end={50} duration={2} />
                </div>
                <div className="text-gray-600 text-sm mt-1">شريك داعم</div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-16">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">خدماتنا</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نقدم مجموعة متكاملة من الخدمات لمساعدة الأسر المحتاجة والمستفيدين
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Gift, title: 'مساعدات مالية', desc: 'تقديم مساعدات مالية شهرية للأسر المحتاجة وفق دراسات حالة دقيقة', color: 'from-blue-500 to-blue-600' },
            { icon: HandHeart, title: 'مساعدات عينية', desc: 'توزيع مواد غذائية وملابس وأدوية على الأسر المستحقة', color: 'from-green-500 to-green-600' },
            { icon: Calendar, title: 'رعاية موسمية', desc: 'برامج خاصة في رمضان والأعياد وشتاء لكل محتاج', color: 'from-orange-500 to-orange-600' }
          ].map((service, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.2}>
              <motion.div 
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <service.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section (New) */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">لماذا نحن؟</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                نتميز بالسرعة والشفافية والمتابعة المستمرة لضمان وصول المساعدة لمستحقيها
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'سرعة توصيل المساعدة', desc: 'نوصل المساعدات في أسرع وقت ممكن للمحتاجين', color: 'text-yellow-500' },
              { icon: Eye, title: 'شفافية كاملة', desc: 'نضمن وصول المساعدات لمستحقيها بشفافية تامة', color: 'text-blue-500' },
              { icon: CheckCircle, title: 'متابعة مستمرة للحالات', desc: 'نقوم بمتابعة الحالات بشكل دوري لضمان استمرارية الدعم', color: 'text-green-500' }
            ].map((item, idx) => (
              <AnimatedSection key={idx} delay={idx * 0.2}>
                <motion.div 
                  className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5, scale: 1.01 }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                      <item.icon size={40} className={item.color} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>



{/* Gallery Section with Real Images */}
<div className="container mx-auto px-4 py-16">
  <AnimatedSection>
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-primary-900 mb-4">معرض الأعمال</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">
        لحظات من مساعداتنا وفعالياتنا الخيرية
      </p>
    </div>
  </AnimatedSection>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {[1, 2, 3, 4, 5].map((item) => (
      <AnimatedSection key={item} delay={item * 0.1}>
        <motion.div 
          className="relative group overflow-hidden rounded-xl cursor-pointer aspect-square"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src={`/gallery-${item}.jpg`} 
            alt={`نشاط خيري ${item}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <p className="text-white text-sm font-medium">نشاط خيري</p>
          </div>
        </motion.div>
      </AnimatedSection>
    ))}
  </div>
</div>



      {/* Mission Section */}
      <div className="bg-primary-50 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">رسالتنا</h2>
              <p className="text-lg text-gray-700 mb-6">
                نسعى لتقديم الدعم والمساعدة للمحتاجين بكل شفافية وكفاءة،
                من خلال نظام متكامل لإدارة الحالات يضمن وصول المساعدات
                إلى مستحقيها في الوقت المناسب.
              </p>
              <motion.div 
                className="flex items-center justify-center gap-2 text-primary"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Shield size={20} />
                <span>الشفافية</span>
                <span className="mx-2">•</span>
                <Clock size={20} />
                <span>السرعة</span>
                <span className="mx-2">•</span>
                <Users size={20} />
                <span>الإنسانية</span>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Recent Activities Section with Hover Effects */}
      <div className="container mx-auto px-4 py-16">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">آخر الأنشطة</h2>
            <p className="text-gray-600">تعرف على آخر المساعدات التي تم تقديمها</p>
          </div>
        </AnimatedSection>

        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            { text: "تم توزيع 50 كرتونة مواد غذائية بمناسبة شهر رمضان", icon: Gift },
            { text: "تقديم مساعدات مالية لـ 30 أسرة في منطقة وسط البلد", icon: Heart },
            { text: "تسليم كسوة العيد لـ 100 طفل يتيم", icon: HandHeart },
            { text: "مبادرة الشتاء الدافئ بتوزيع 75 بطانية", icon: Calendar }
          ].map((activity, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <motion.div 
                className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-secondary hover:shadow-md transition-all duration-300 cursor-pointer group"
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <activity.icon size={16} className="text-secondary" />
                  </motion.div>
                  <p className="text-gray-700 group-hover:text-primary transition-colors duration-300">
                    {activity.text}
                  </p>
                  <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-auto" />
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
          <p className="text-gray-400 mb-4">
            للاستفسارات أو المساعدة، يمكنك التواصل مع فريق الدعم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:info@charity.org" className="text-secondary hover:underline">
              info@charity.org
            </a>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <a href="tel:+20123456789" className="text-secondary hover:underline">
              0123456789+
            </a>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} جمعية النور المحمدي. جميع الحقوق محفوظة
          </div>
        </div>
      </div>

      {/* Donation Modal - ADD THIS RIGHT HERE */}
      <DonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)} 
      />
    </div>  
  );
}