"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AboutSection() {
    const containerRef = useRef<HTMLElement>(null);

    // Setup scroll animation for the clouds
    const { scrollYProgress } = useScroll({
        target: containerRef,
        // Start when the top of About section hits bottom of screen
        // End when the top of About section hits 30% from the top of screen
        offset: ["start end", "start 30%"]
    });

    // Transform scroll progress (0 to 1) to horizontal movement
    const cloudsX = useTransform(scrollYProgress, [0.4, 1], ["-200vw", "120vw"])

    return (
        <section id="about" ref={containerRef} className="relative py-12 bg-white overflow-hidden">

            {/* Scroll Animated Clouds */}
            <motion.div
                style={{ x: cloudsX }}
                className="absolute top-12 left-0 w-full md:w-[150%] max-w-none h-auto z-0 pointer-events-none opacity-40 mix-blend-multiply"
            >
                <img
                    src="/clouds_white_bg.png"
                    alt="Clouds"
                    className="w-full h-auto object-cover"
                />
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-cursive text-orange-500 mb-3">Why KashiGo ? </h2>
                    <h3 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 mb-6">Save your spirit and peace of mind</h3>
                    <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-8"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 text-lg text-slate-600">
                        <p>
                            Spiritual Journeys require spirit but why lose it often getting harassed and scammed. <br></br><br></br>KashiGo is Varanasi&apos;s premier boat ride booking platform, offering easy, transparent and structured spiritual experiences on the river Ganges.
                        </p>
                        <p>
                            Gone are the days of haggling at the ghats. With our platform, you can seamlessly book private or shared boat rides for the perfect time of day—whether you wish to feed the Siberian gulls at dawn or witness the grand Dashashwamedh Aarti at dusk.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {['Easy booking in seconds','Transparent Pricing', 'Premium Experience', 'Your own Timings'].map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                    <span className="font-medium text-slate-800">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                        {/* About Us Video/GiF */}
                        <div className="absolute inset-0 bg-slate-200">
                            <img src="/gif1.gif" alt="Varanasi Ghats" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
