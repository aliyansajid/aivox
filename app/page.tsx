"use client";

import { ArrowRight, Sparkles, FileText, Calendar, MessageSquare, BarChart3, Zap, Shield, Plus, Minus, Check, Star, Quote, PlayCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <div ref={ref}>{count}{suffix}</div>;
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#fffffe] dark:bg-[#0e0e0e]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fffffe]/80 dark:bg-[#0e0e0e]/80 backdrop-blur-md border-b border-black/8 dark:border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff480e] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0e0e0e] dark:text-[#fffffe]">AIVOX</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[#0e0e0e] dark:text-[#fffffe] hover:text-[#ff480e] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-[#0e0e0e] dark:text-[#fffffe] hover:text-[#ff480e] transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-[#0e0e0e] dark:text-[#fffffe] hover:text-[#ff480e] transition-colors">Pricing</a>
            <button className="relative px-5 py-2.5 bg-[#ff480e] text-white rounded-full font-medium text-sm overflow-hidden group">
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#ff480e] via-[#ff6b3d] to-[#ff480e] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#ff480e]/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff480e]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#ff480e]/5 to-transparent rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff480e]/10 rounded-full mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff480e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff480e]"></span>
            </span>
            <span className="text-sm font-medium text-[#0e0e0e] dark:text-[#fffffe]">AI-Powered Recruitment</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[96px] font-bold tracking-[-0.06em] leading-[1.1] text-[#0e0e0e] dark:text-[#fffffe] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Hire Smarter<br />
            <span className="text-[#ff480e]">Not Harder</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Let AI agents handle resume screening, shortlisting, and initial interviews.
            Focus on what matters - meeting the best candidates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button className="relative px-8 py-4 bg-[#ff480e] text-white rounded-full font-semibold text-base overflow-hidden group flex items-center gap-2">
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#ff480e] via-[#ff6b3d] to-[#ff480e] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
            </button>
            <button className="relative px-8 py-4 bg-transparent border-2 border-[#0e0e0e] dark:border-[#fffffe] text-[#0e0e0e] dark:text-[#fffffe] rounded-full font-semibold text-base overflow-hidden group flex items-center gap-2">
              <span className="relative z-10 flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </span>
              <span className="absolute inset-0 bg-[#0e0e0e] dark:bg-[#fffffe] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <span className="absolute inset-0 flex items-center justify-center text-[#fffffe] dark:text-[#0e0e0e] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 gap-2">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </span>
            </button>
          </div>

          {/* Stats with Animated Counters */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="group cursor-pointer">
              <div className="text-4xl md:text-5xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-2 group-hover:text-[#ff480e] transition-colors">
                <AnimatedCounter end={90} suffix="%" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time Saved</div>
            </div>
            <div className="group cursor-pointer">
              <div className="text-4xl md:text-5xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-2 group-hover:text-[#ff480e] transition-colors">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI Availability</div>
            </div>
            <div className="group cursor-pointer">
              <div className="text-4xl md:text-5xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-2 group-hover:text-[#ff480e] transition-colors">
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unbiased</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <section className="py-12 border-y border-black/8 dark:border-white/8 bg-white dark:bg-[#0e0e0e] overflow-hidden ticker-container">
        <div className="relative flex">
          <div className="flex animate-scroll whitespace-nowrap ticker-content">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center">
                <span className="mx-8 text-2xl font-bold text-gray-300 dark:text-gray-700 ticker-item transition-colors duration-300">TechCorp</span>
                <span className="text-[#ff480e]">•</span>
                <span className="mx-8 text-2xl font-bold text-gray-300 dark:text-gray-700 ticker-item transition-colors duration-300">InnovateLabs</span>
                <span className="text-[#ff480e]">•</span>
                <span className="mx-8 text-2xl font-bold text-gray-300 dark:text-gray-700 ticker-item transition-colors duration-300">FutureStart</span>
                <span className="text-[#ff480e]">•</span>
                <span className="mx-8 text-2xl font-bold text-gray-300 dark:text-gray-700 ticker-item transition-colors duration-300">CloudMinds</span>
                <span className="text-[#ff480e]">•</span>
                <span className="mx-8 text-2xl font-bold text-gray-300 dark:text-gray-700 ticker-item transition-colors duration-300">DataDrive</span>
                <span className="text-[#ff480e]">•</span>
                <span className="mx-8 text-2xl font-bold text-gray-300 dark:text-gray-700 ticker-item transition-colors duration-300">NextGen AI</span>
                <span className="text-[#ff480e]">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.06em] text-[#0e0e0e] dark:text-[#fffffe] mb-4">
              Powered by AI
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our intelligent agents handle the entire recruitment pipeline, from resume to report.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Smart Resume Parsing",
                description: "AI automatically extracts and analyzes candidate information, skills, and experience from any resume format.",
                delay: "0s"
              },
              {
                icon: Zap,
                title: "Automated Shortlisting",
                description: "Intelligent matching algorithms rank candidates based on job requirements and company culture fit.",
                delay: "0.1s"
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "Automatically send interview invitations and manage scheduling without any manual intervention.",
                delay: "0.2s"
              },
              {
                icon: MessageSquare,
                title: "AI Interviews",
                description: "Conversational AI conducts initial interviews, asks relevant questions, and evaluates responses naturally.",
                delay: "0.3s"
              },
              {
                icon: BarChart3,
                title: "Detailed Reports",
                description: "Get comprehensive interview reports with candidate insights, strengths, and recommendations.",
                delay: "0.4s"
              },
              {
                icon: Shield,
                title: "Bias-Free Hiring",
                description: "AI ensures fair evaluation based solely on qualifications, eliminating unconscious bias.",
                delay: "0.5s"
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 bg-gray-50 dark:bg-[#1f2124] rounded-3xl border border-black/8 dark:border-white/8 hover:border-[#ff480e]/50 transition-all hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: feature.delay }}>
                <div className="w-12 h-12 bg-[#ff480e]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#ff480e]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Modern Cards */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50 dark:bg-[#1f2124] relative overflow-hidden">
        <div className="max-w-7xl mx-auto mb-16 text-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.06em] text-[#0e0e0e] dark:text-[#fffffe] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Four simple steps to revolutionize your hiring process
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Step 1 */}
          <div className="group relative bg-white dark:bg-[#0e0e0e] rounded-3xl p-8 border border-black/8 dark:border-white/8 hover:border-[#ff480e]/50 transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff480e]/5 rounded-full blur-3xl group-hover:bg-[#ff480e]/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#ff480e] to-[#ff6b3d] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  01
                </div>
                <FileText className="w-16 h-16 text-[#ff480e]/20 group-hover:text-[#ff480e]/30 transition-colors group-hover:scale-110 group-hover:rotate-6 transition-transform" />
              </div>
              <h3 className="text-3xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-4">Post Your Job</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Create comprehensive job listings with AI-powered optimization. Our intelligent system helps you attract the right candidates.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Templates", "AI Optimization", "Multi-platform"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#ff480e]/10 text-[#ff480e] text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="group relative bg-white dark:bg-[#0e0e0e] rounded-3xl p-8 border border-black/8 dark:border-white/8 hover:border-[#ff480e]/50 transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff480e]/5 rounded-full blur-3xl group-hover:bg-[#ff480e]/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#ff480e] to-[#ff6b3d] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  02
                </div>
                <Zap className="w-16 h-16 text-[#ff480e]/20 group-hover:text-[#ff480e]/30 transition-colors group-hover:scale-110 group-hover:rotate-6 transition-transform" />
              </div>
              <h3 className="text-3xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-4">AI Screens Resumes</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Advanced AI analyzes applications instantly, extracting key information and ranking candidates by fit. Never miss qualified talent.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Smart Parsing", "Skills Match", "Culture Fit"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#ff480e]/10 text-[#ff480e] text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group relative bg-white dark:bg-[#0e0e0e] rounded-3xl p-8 border border-black/8 dark:border-white/8 hover:border-[#ff480e]/50 transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff480e]/5 rounded-full blur-3xl group-hover:bg-[#ff480e]/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#ff480e] to-[#ff6b3d] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  03
                </div>
                <MessageSquare className="w-16 h-16 text-[#ff480e]/20 group-hover:text-[#ff480e]/30 transition-colors group-hover:scale-110 group-hover:rotate-6 transition-transform" />
              </div>
              <h3 className="text-3xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-4">Automated Interviews</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                AI agents conduct natural, conversational interviews 24/7. Candidates complete interviews at their convenience with real-time evaluation.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Natural Flow", "Custom Q&A", "24/7 Access"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#ff480e]/10 text-[#ff480e] text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="group relative bg-white dark:bg-[#0e0e0e] rounded-3xl p-8 border border-black/8 dark:border-white/8 hover:border-[#ff480e]/50 transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff480e]/5 rounded-full blur-3xl group-hover:bg-[#ff480e]/10 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#ff480e] to-[#ff6b3d] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  04
                </div>
                <BarChart3 className="w-16 h-16 text-[#ff480e]/20 group-hover:text-[#ff480e]/30 transition-colors group-hover:scale-110 group-hover:rotate-6 transition-transform" />
              </div>
              <h3 className="text-3xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-4">Review & Decide</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Get detailed reports with insights, strengths, and AI recommendations. Make confident, data-driven hiring decisions quickly.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Full Reports", "Comparisons", "Quick Hire"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-[#ff480e]/10 text-[#ff480e] text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-white dark:bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.06em] text-[#0e0e0e] dark:text-[#fffffe] mb-4">
              Loved by HR Teams
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See what recruiters are saying about AIVOX
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Head of HR, TechCorp",
                content: "AIVOX reduced our time-to-hire by 70%. The AI interviews are incredibly natural and candidates love the flexibility.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Talent Lead, InnovateLabs",
                content: "We've screened over 5,000 candidates with AIVOX. The accuracy is impressive and we've made significantly better hires.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Recruiter, FutureStart",
                content: "Game changer! The detailed reports save us hours of work and the bias-free screening ensures we see all qualified candidates.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="p-8 bg-gray-50 dark:bg-[#1f2124] rounded-3xl border border-black/8 dark:border-white/8 hover:border-[#ff480e]/50 transition-all hover:scale-105">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#ff480e] text-[#ff480e]" />
                  ))}
                </div>
                <Quote className="w-10 h-10 text-[#ff480e]/20 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{testimonial.content}</p>
                <div>
                  <div className="font-semibold text-[#0e0e0e] dark:text-[#fffffe]">{testimonial.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gray-50 dark:bg-[#1f2124]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.06em] text-[#0e0e0e] dark:text-[#fffffe] mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your hiring needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white dark:bg-[#0e0e0e] rounded-3xl p-8 border border-black/8 dark:border-white/8 hover:border-[#ff480e]/50 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-2">Starter</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for small teams</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-[#0e0e0e] dark:text-[#fffffe]">$99</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Up to 50 candidates/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">AI resume screening</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Basic interview reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Email support</span>
                </li>
              </ul>
              <button className="relative w-full px-6 py-3 bg-transparent border-2 border-[#0e0e0e] dark:border-[#fffffe] text-[#0e0e0e] dark:text-[#fffffe] rounded-full font-semibold overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-[#0e0e0e] dark:bg-[#fffffe] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                <span className="absolute inset-0 flex items-center justify-center text-[#fffffe] dark:text-[#0e0e0e] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">Get Started</span>
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-[#ff480e] rounded-3xl p-8 relative transform md:scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0e0e0e] text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-white/80 mb-6">For growing companies</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$299</span>
                <span className="text-white/80">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Up to 200 candidates/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">AI interviews & screening</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Detailed analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Custom branding</span>
                </li>
              </ul>
              <button className="relative w-full px-6 py-3 bg-white text-[#ff480e] rounded-full font-semibold overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-[#0e0e0e] rounded-3xl p-8 border border-black/8 dark:border-white/8 hover:border-[#ff480e]/50 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-[#0e0e0e] dark:text-[#fffffe] mb-2">Enterprise</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-[#0e0e0e] dark:text-[#fffffe]">Custom</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Unlimited candidates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">All features included</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Dedicated support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#ff480e] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">SLA guarantee</span>
                </li>
              </ul>
              <button className="relative w-full px-6 py-3 bg-transparent border-2 border-[#0e0e0e] dark:border-[#fffffe] text-[#0e0e0e] dark:text-[#fffffe] rounded-full font-semibold overflow-hidden group">
                <span className="relative z-10">Contact Sales</span>
                <span className="absolute inset-0 bg-[#0e0e0e] dark:bg-[#fffffe] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                <span className="absolute inset-0 flex items-center justify-center text-[#fffffe] dark:text-[#0e0e0e] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">Contact Sales</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white dark:bg-[#0e0e0e]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.06em] text-[#0e0e0e] dark:text-[#fffffe] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about AIVOX
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How accurate is the AI screening process?",
                answer: "Our AI screening achieves 95%+ accuracy by analyzing resumes against job requirements, skills matching, and cultural fit indicators. The system continuously learns from feedback to improve its accuracy over time."
              },
              {
                question: "Can I customize the interview questions?",
                answer: "Absolutely! You have full control over interview questions. Create custom question sets tailored to specific roles, or use our AI-suggested questions based on the job description and industry best practices."
              },
              {
                question: "How long does the AI interview process take?",
                answer: "AI interviews typically take 15-30 minutes depending on the role complexity. Candidates can complete interviews at their convenience 24/7, and you'll receive detailed reports within minutes of completion."
              },
              {
                question: "Is my candidate data secure?",
                answer: "Yes, security is our top priority. We use enterprise-grade encryption, comply with GDPR and SOC 2 standards, and never share candidate data with third parties. All data is stored securely and can be deleted upon request."
              },
              {
                question: "Can I integrate AIVOX with my existing ATS?",
                answer: "Yes, AIVOX integrates seamlessly with popular ATS platforms including Greenhouse, Lever, Workday, and more. Our API also allows for custom integrations with your existing HR tools."
              },
              {
                question: "What happens if a candidate needs special accommodations?",
                answer: "We're committed to accessibility. Candidates can request accommodations, and our platform supports various accessibility features including extended time, screen readers, and alternative interview formats."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-black/8 dark:border-white/8 rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#1f2124] hover:border-[#ff480e]/50 transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white dark:hover:bg-[#0e0e0e] transition-colors"
                >
                  <span className="text-lg font-semibold text-[#0e0e0e] dark:text-[#fffffe] pr-8">
                    {faq.question}
                  </span>
                  <div className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                    {openFaq === index ? (
                      <Minus className="w-5 h-5 text-[#ff480e] flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-[#ff480e] flex-shrink-0" />
                    )}
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Grid */}
      <section className="py-24 px-6 bg-[#0e0e0e] dark:bg-[#1f2124] relative overflow-hidden">
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff480e]/10 via-transparent to-[#ff480e]/10"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold tracking-[-0.06em] text-[#fffffe] mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join leading companies using AI to build better teams faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="relative px-8 py-4 bg-[#ff480e] text-white rounded-full font-semibold text-base overflow-hidden group flex items-center gap-2">
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#ff480e] via-[#ff6b3d] to-[#ff480e] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
            </button>
            <button className="relative px-8 py-4 bg-transparent border-2 border-[#fffffe] text-[#fffffe] rounded-full font-semibold text-base overflow-hidden group">
              <span className="relative z-10">Schedule Demo</span>
              <span className="absolute inset-0 bg-[#fffffe] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
              <span className="absolute inset-0 flex items-center justify-center text-[#0e0e0e] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">Schedule Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-black/8 dark:border-white/8 bg-white dark:bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#ff480e] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#0e0e0e] dark:text-[#fffffe]">AIVOX</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered recruitment platform for modern teams.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-[#0e0e0e] dark:text-[#fffffe] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0e0e0e] dark:text-[#fffffe] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#0e0e0e] dark:text-[#fffffe] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[#ff480e] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-black/8 dark:border-white/8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 AIVOX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
