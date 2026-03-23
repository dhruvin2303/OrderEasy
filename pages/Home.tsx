import React, { useRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform, useInView, Variants } from 'framer-motion';
import {
    ArrowRight,
    BarChart2,
    Truck,
    Database,
    ShieldCheck,
    Zap,
    PieChart,
    Check,
    X,
    Minus,
    Mail,
    Send,
    Users,
    Package,
    TrendingUp,
    Clock,
    FileText,
    Cloud,
    Rocket,
    Smartphone,
    Layers,
    Bolt,
} from 'lucide-react';
import { SEO } from '../components/SEO';

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

// --- Spotlight Card Component ---
const SpotlightCard = ({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            variants={fadeInUp}
            onMouseMove={handleMouseMove}
            whileHover={{ y: -5 }}
            className="group relative border border-white/10 bg-slate-900/40 backdrop-blur-md overflow-hidden rounded-2xl px-6 py-8 shadow-2xl transition-all duration-300"
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(99, 102, 241, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full flex flex-col">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/10 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-brand-400" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-white tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-300 grow font-medium">
                    {desc}
                </p>
            </div>
        </motion.div>
    );
};

const benefits = [
    {
        icon: FileText,
        problem: 'Manual spreadsheets everywhere, no single source of truth.',
        solution: 'Centralize orders, inventory and invoices in one live platform.',
        focus: 'One source of truth for every team',
    },
    {
        icon: Bolt,
        problem: 'Forecasting is guesswork and takes too long.',
        solution: 'AI-powered demand predictions that refresh automatically.',
        focus: 'Forecasts that update as your data changes',
    },
    {
        icon: Clock,
        problem: 'Delayed deliveries frustrate customers and teams.',
        solution: 'Track status in real time and prioritize late orders instantly.',
        focus: 'Proactive alerts for late and at-risk shipments',
    },
    {
        icon: Layers,
        problem: 'Data hidden across tools makes insights impossible.',
        solution: 'All your business metrics in one dashboard, not scattered tabs.',
        focus: 'A single pane for every metric and KPI',
    },
];

const BenefitsGrid = () => {
    const sectionRef = useRef<HTMLElement | null>(null);
    const inView = useInView(sectionRef, { once: true, margin: '-120px' });

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 24, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 120,
                damping: 16,
            },
        },
    };

    return (
        <section ref={sectionRef} className="py-24 relative z-10">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 1.1, x: -50, y: -50 }}
                    animate={inView ? { opacity: 0.4, x: 0, y: 0, scale: 1 } : {}}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500/50 to-purple-500/30 blur-3xl"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 1.2, x: 50, y: 40 }}
                    animate={inView ? { opacity: 0.3, x: 0, y: 0, scale: 1 } : {}}
                    transition={{ duration: 1.3, ease: 'easeOut' }}
                    className="absolute right-1/3 bottom-1/4 h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-cyan-400/30 via-brand-500/20 to-slate-900/0 blur-3xl"
                />
            </div>

            <ParallaxSection offset={25}>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4 drop-shadow-lg">Benefits That Matter</h2>
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto">Stop solving workarounds and start focusing on what moves the business.</p>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={inView ? 'visible' : 'hidden'}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {benefits.map((item) => (
                            <motion.div
                                key={item.problem}
                                variants={cardVariants}
                                whileHover={{ y: -8, boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}
                                className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl transition"
                            >
                                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-brand-500/20 via-purple-500/20 to-slate-900/10 opacity-0 transition-opacity duration-500 group-hover:opacity-70" />
                                <div className="relative z-10 flex flex-col gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
                                            <item.icon className="h-6 w-6 text-white" />
                                            <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-emerald-400/80 blur-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-white">{item.problem}</p>
                                            <p className="mt-3 text-sm text-slate-300">{item.solution}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {item.focus}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </ParallaxSection>
        </section>
    );
};

const whyDifferent = [
    {
        icon: Cloud,
        title: 'Cloud‑First Architecture',
        desc: 'Access your data anywhere without on‑prem maintenance or costly hardware.',
    },
    {
        icon: Rocket,
        title: 'Zero Setup',
        desc: 'Get started in minutes with guided onboarding and prebuilt templates.',
    },
    {
        icon: BarChart2,
        title: 'Data‑Driven Decisions',
        desc: 'Insights and recommended actions are delivered automatically, not buried in spreadsheets.',
    },
    {
        icon: Smartphone,
        title: 'Mobile Ready',
        desc: 'Manage orders, approvals, and updates from your phone on the go.',
    },
];

const WhyDifferent = () => (
    <section className="py-24 relative z-10">
        <ParallaxSection offset={25}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4 drop-shadow-lg">Why It’s Different</h2>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">Built for modern teams that need speed, visibility, and flexibility.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {whyDifferent.map((item) => (
                        <motion.div
                            key={item.title}
                            whileHover={{ y: -6 }}
                            className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-lg transition"
                        >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/10 blur-3xl" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 text-brand-200 mb-5">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-300 text-sm leading-relaxed flex-1">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </ParallaxSection>
    </section>
);

type PlanKey = 'ordereasy' | 'erp' | 'basic';

type ComparisonRow = {
    feature: string;
    ordereasy: boolean | 'partial';
    erp: boolean | 'partial';
    basic: boolean | 'partial';
};

const comparisonData: ComparisonRow[] = [
    { feature: "Order Management", ordereasy: true, erp: true, basic: true },
    { feature: "Partial Delivery Management", ordereasy: true, erp: "partial", basic: false },
    { feature: "AI Business Analyst", ordereasy: true, erp: false, basic: false },
    { feature: "RFM Customer Analysis", ordereasy: true, erp: false, basic: false },
    { feature: "Automated Forecasts", ordereasy: true, erp: "partial", basic: false },
    { feature: "Data Export", ordereasy: true, erp: true, basic: false },
    { feature: "User-Friendly UI", ordereasy: true, erp: false, basic: true },
];

type PlanInfo = {
    key: PlanKey;
    name: string;
    subtitle: string;
    description: string;
    featured?: boolean;
};

const planCards: PlanInfo[] = [
    {
        key: 'ordereasy',
        name: 'OrderEasy',
        subtitle: 'Modern SaaS',
        description: 'AI-driven forecasting, instant insights, and an ultra-intuitive interface built for speed and flexibility.',
        featured: true,
    },
    {
        key: 'erp',
        name: 'Legacy ERP',
        subtitle: 'Traditional Systems',
        description: 'Heavy on setup and customization, with dated interfaces and long implementation cycles.',
    },
    {
        key: 'basic',
        name: 'Basic App',
        subtitle: 'Simple Tooling',
        description: 'Lightweight solution with limited functionality and minimal analytics capabilities.',
    },
];

const RenderIcon = ({ status }: { status: boolean | 'partial' }) => {
    if (status === true) {
        return (
            <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex justify-center"
            >
                <div className="bg-emerald-500/20 p-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.35)]">
                    <Check className="w-5 h-5 text-emerald-400" />
                </div>
            </motion.div>
        );
    }

    if (status === false) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex justify-center"
            >
                <X className="w-5 h-5 text-slate-400/50" />
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex justify-center"
        >
            <div className="bg-amber-500/20 p-1.5 rounded-full">
                <Minus className="w-5 h-5 text-amber-400" />
            </div>
        </motion.div>
    );
};

// --- Parallax Section Wrapper ---
const ParallaxSection = ({ children, offset = 50 }: { children: React.ReactNode, offset?: number }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

    return (
        <motion.div ref={ref} style={{ y, opacity }}>
            {children}
        </motion.div>
    );
};

// --- Contact Section Component (Web3Forms) ---
const ContactSection = () => {
    const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        const formData = new FormData(e.currentTarget);
        formData.append("access_key", "12d44591-0dc6-43fe-afd2-278e097fe923");

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('success');
                setMessage("Success! Your message has been sent.");
                (e.target as HTMLFormElement).reset();
            } else {
                setStatus('error');
                setMessage(data.message || "Something went wrong.");
            }
        } catch (err) {
            setStatus('error');
            setMessage("Failed to send message. Please try again later.");
        }

        // Reset status after a few seconds
        setTimeout(() => setStatus('idle'), 5000);
    };

    return (
        <section id="contact" className="py-24 relative z-10 overflow-hidden">
            <ParallaxSection offset={20}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="text-center mb-12 relative z-10">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4 drop-shadow-lg">Get in Touch</h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-brand-500 to-purple-500 mx-auto rounded-full mb-6"></div>
                        <p className="text-slate-300 text-lg">Have questions or need help? We'd love to hear from you.</p>
                        <a href="mailto:krishchaudhary144@gmail.com" className="inline-flex items-center gap-2 mt-6 text-brand-300 hover:text-white transition-colors font-medium bg-brand-500/20 px-5 py-2.5 rounded-full border border-brand-500/30 hover:bg-brand-500/30 hover:scale-105 backdrop-blur-sm">
                            <Mail className="w-5 h-5" /> krishchaudhary144@gmail.com
                        </a>
                    </div>

                    <div className="relative z-10 border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                                    <input type="text" name="name" id="name" required className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-500" placeholder="Your Name" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                    <input type="email" name="email" id="email" required className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-500" placeholder="user@email.com" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                                <textarea name="message" id="message" rows={5} required className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-500 resize-none" placeholder="How can we help you?"></textarea>
                            </div>

                            {status !== 'idle' && status !== 'submitting' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl text-sm font-medium border ${status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                                >
                                    {message}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {status === 'submitting' ? (
                                    <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</span>
                                ) : (
                                    <span className="flex items-center gap-2">Send Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </ParallaxSection>
        </section>
    );
};


const Home: React.FC = () => {
    const navigate = useNavigate();
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    // Smooth background parallax
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 0.6, 0.4]);

    return (
        <div ref={targetRef} className="min-h-screen bg-[#05050A] text-slate-100 overflow-x-hidden selection:bg-brand-500 selection:text-white font-sans relative">
            <SEO
                title="OrderEasy - Advanced Order Management & Analytics Platform"
                description="OrderEasy: Manage orders, track deliveries, and gain real-time analytics. The ultimate order management system for modern businesses to optimize their operations."
                keywords="OrderEasy, Order Management, Order Analytics, Order Management System, Order Tracking, Business Insights, Delivery Management, Supply Chain Optimization"
            />
            {/* Visual Analytics Background with Parallax */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-screen will-change-transform"
                    style={{
                        backgroundImage: 'url("/bg-analytics.png")',
                        y: bgY,
                        opacity: bgOpacity,
                        scale: 1.1 // Slight scale to prevent gaps
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/70 via-[#05050A]/60 to-[#05050A]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_100%,transparent_100%)]"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#05050A]/70 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <motion.img
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            src="/logo.svg"
                            alt="OrderEasy Logo"
                            className="h-10 w-10 relative z-10"
                        />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-400">
                            OrderEasy
                        </span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-full backdrop-blur-md transition-all text-sm"
                    >
                        Login
                    </motion.button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden z-10 min-h-[90vh] flex items-center justify-center">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Static parallax for hero elements to create depth */}
                        <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }} >
                            <motion.div variants={fadeInUp} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-brand-900/60 border border-brand-500/30 text-brand-300 text-sm font-medium shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-sm">
                                ✨ The Future of Order Management is Here
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight drop-shadow-2xl"
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 animate-gradient-x">
                                    Turn every order into insight, every delivery into confidence.
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg"
                            >
                                Track orders, manage partial deliveries, upload bills, and analyze everything with interactive charts to turn your data into clear business insights.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center gap-2 transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    <span className="relative">Get Started Now</span>
                                    <ArrowRight size={20} className="relative group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('contact');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-full font-semibold text-lg border border-slate-700 backdrop-blur-sm transition-all hover:scale-105"
                                >
                                    Contact Us
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid with Scroll Reveal */}
            <section className="py-24 relative z-10">
                <ParallaxSection offset={30}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6 drop-shadow-lg">Powerful Features</h2>
                            <div className="h-1 w-20 bg-gradient-to-r from-brand-500 to-purple-500 mx-auto rounded-full"></div>
                            <p className="text-slate-300 mt-6 text-lg drop-shadow-md">Everything you need to scale your delivery operations.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SpotlightCard
                                icon={BarChart2}
                                title="AI Business Analyst"
                                desc="Ask questions in plain English and get data-driven insights instantly using our integrated LLM engine."
                                delay={0}
                            />
                            <SpotlightCard
                                icon={Truck}
                                title="Smart Delivery Management"
                                desc="Track order fulfillment status and manage partial deliveries with ease. Monitor dispatched quantities and pending balances."
                                delay={0.1}
                            />
                            <SpotlightCard
                                icon={Database}
                                title="Instant Data Exports"
                                desc="Seamlessly download reports and analytics data in CSV/Excel formats for offline analysis."
                                delay={0.2}
                            />
                            <SpotlightCard
                                icon={ShieldCheck}
                                title="Secure Authentication"
                                desc="Enterprise-grade security with OTP-based login and role-based access control."
                                delay={0.3}
                            />
                            <SpotlightCard
                                icon={Zap}
                                title="E-Way Bill Management"
                                desc="Easily upload, store, and retrieve E-Way bills for your orders. Keep all your compliance documents in one secure place."
                                delay={0.4}
                            />
                            <SpotlightCard
                                icon={PieChart}
                                title="Visual Data Analytics"
                                desc="Visualize your business performance with dynamic charts covering sales trends, product distribution, and revenue analysis."
                                delay={0.5}
                            />
                        </div>
                    </div>
                </ParallaxSection>
            </section>

            {/* Benefits Grid (Problem → Solution) */}
            <BenefitsGrid />

            {/* Why It’s Different (Value Props) */}
            <WhyDifferent />

            {/* Comparative Analysis — Plan Cards */}
            <section className="py-24 relative z-10 overflow-hidden">
                <ParallaxSection offset={-20}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6 drop-shadow-lg">Why Choose OrderEasy?</h2>
                            <div className="h-1 w-20 bg-gradient-to-r from-brand-500 to-purple-500 mx-auto rounded-full"></div>
                            <p className="text-slate-300 mt-6 text-lg drop-shadow-md">See how we stack up against traditional solutions.</p>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/30 via-purple-500/20 to-slate-900/10" />
                            <div className="absolute -top-24 left-1/2 sm:left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-brand-500/20 blur-3xl" />
                            <div className="absolute -bottom-24 right-1/2 sm:right-1/3 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-purple-500/20 blur-3xl" />

                            <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-8">
                                {planCards.map((plan, index) => (
                                    <motion.div
                                        key={plan.key}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-120px' }}
                                        transition={{ duration: 0.7, delay: index * 0.12 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="group relative rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-lg hover:border-brand-400/40 hover:shadow-[0_25px_60px_-15px_rgba(99,102,241,0.35)] transition"
                                    >
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-brand-400/20 to-purple-500/10 blur-3xl" />
                                        </div>

                                        <div className="relative">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-xs font-semibold tracking-widest uppercase text-slate-200/60">{plan.subtitle}</div>
                                                    <h3 className="mt-2 text-2xl font-bold text-white tracking-tight">{plan.name}</h3>
                                                </div>

                                                {plan.featured && (
                                                    <span className="whitespace-nowrap rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-100 ring-1 ring-brand-500/25">
                                                        Recommended
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-4 text-sm leading-relaxed text-slate-300">
                                                {plan.description}
                                            </p>

                                            <div className="mt-6 space-y-3">
                                                {comparisonData.map((row) => (
                                                    <div
                                                        key={row.feature}
                                                        className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500/60" />
                                                            <span className="text-slate-200">{row.feature}</span>
                                                        </div>
                                                        <RenderIcon status={row[plan.key]} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ParallaxSection>
            </section>

            {/* Contact Section */}
            <ContactSection />

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-[#05050A]/80 backdrop-blur-lg relative z-10">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity">
                        <img src="/logo.svg" alt="Footer Logo" className="h-6 w-6 grayscale hover:grayscale-0 transition-all" />
                        <span className="font-semibold text-white">OrderEasy</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} OrderEasy Analytics. • <a href="/#/privacy" className="hover:text-brand-400 transition-colors">Privacy Policy</a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
