"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";

const features = [
    { label: "Easy booking in seconds", tint: "bg-orange-100 text-orange-700" },
    { label: "Transparent pricing", tint: "bg-teal-100 text-teal-700" },
    { label: "Premium experience", tint: "bg-pink-100 text-pink-700" },
    { label: "Your own timings", tint: "bg-sky-100 text-sky-700" },
];

export default function AboutSection() {
    return (
        <section id="about" className="py-14 sm:py-20 px-4 bg-white">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800">Why KashiGo?</span>
                    <h2 className="mt-3 text-3xl sm:text-5xl font-bold font-heading text-slate-900 tracking-tight">
                        Save your spirit and peace of mind
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="space-y-4 text-[15px] sm:text-lg text-slate-600 leading-relaxed">
                        <p>
                            Spiritual journeys require spirit — so why lose it getting harassed and scammed? KashiGo is Varanasi&apos;s boat ride booking platform, offering easy, transparent and structured experiences on the river Ganges.
                        </p>
                        <p>
                            Gone are the days of haggling at the ghats. Book a boat ride for the perfect time of day — whether you wish to feed the Siberian gulls at dawn or witness the grand Dashashwamedh Aarti at dusk.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {features.map((feature) => (
                                <li key={feature.label} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200/70 shadow-sm px-4 py-3">
                                    <span className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${feature.tint}`}>
                                        <Check size={15} strokeWidth={3} />
                                    </span>
                                    <span className="font-medium text-slate-800 text-[15px]">{feature.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative aspect-[4/3] md:aspect-square rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm bg-amber-50">
                        <Image
                            src="/gif1.gif"
                            alt="Varanasi Ghats at golden hour"
                            fill
                            sizes="(max-width: 768px) 100vw, 480px"
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
