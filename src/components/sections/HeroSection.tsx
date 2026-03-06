"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function HeroSection() {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Check if video is already loaded from cache on mount
    useEffect(() => {
        if (videoRef.current && videoRef.current.readyState >= 3) {
            setIsVideoLoaded(true);
        }
    }, []);

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">

            {/* Full-screen Loading Overlay */}
            <AnimatePresence>
                {!isVideoLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center"
                    >
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            src="/Untitled.png"
                            alt="KashiGo Loading"
                            className="h-40 md:h-56 w-auto object-contain mb-12 drop-shadow-2xl opacity-90"
                        />
                        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-orange-500 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: ["0%", "70%", "100%"] }}
                                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                            />
                        </div>
                        <p className="text-slate-400 mt-4 text-sm font-medium tracking-widest uppercase">
                            Loading Experience...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Background */}
            <div className="absolute inset-0 bg-slate-900 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onCanPlayThrough={() => setIsVideoLoaded(true)}
                    className="w-full h-full object-cover opacity-60"
                >
                    <source src="/back_video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-900 z-10" />
            </div>

            <div className="relative z-20 px-4 max-w-7xl mx-auto mt-16 flex flex-col md:flex-row items-center justify-center pt-8 md:pt-0">

                {/* Left Side: Text and Button */}
                <div className="text-center md:text-left relative z-20 w-full md:w-[60%] lg:w-[55%] pl-0 lg:pl-8 order-2 md:order-1">
                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-[4.5rem] leading-tight font-bold font-heading text-white tracking-tight mb-4"
                    >
                        <span className="sm:whitespace-nowrap">Experience the Soul of</span> <br className="block sm:hidden" /><span className="text-orange-500 font-cursive text-6xl sm:text-7xl md:text-9xl lg:text-[9rem] tracking-normal relative z-20">Varanasi</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-200 mb-8 max-w-lg mx-auto md:mx-0 relative z-20"
                    >
                        Premium boat rides along the sacred Ganges. Witness the majestic Aarti, breathtaking sunrises, and serene sunsets from the comfort of our luxury fleet.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Link href="/book" className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-1 relative z-20">
                            Book Your Ride Now
                        </Link>
                    </motion.div>
                </div>

                {/* Right Side: Logo */}
                <motion.div
                    initial={{ opacity: 0, x: 30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 md:mb-0 relative z-10 w-full md:w-[40%] lg:w-[45%] flex justify-center md:justify-start md:-ml-12 lg:-ml-24 pointer-events-none order-1 md:order-2"
                >
                    <img
                        src="/Untitled.png"
                        alt="KashiGo logo"
                        className="h-72 md:h-[32rem] lg:h-[42rem] w-auto object-contain drop-shadow-2xl opacity-90"
                    />
                </motion.div>
            </div>
        </section>
    );
}
