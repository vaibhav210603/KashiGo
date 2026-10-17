"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { Eyebrow, Reveal, SplitWords } from "@/components/motion/primitives";

const features = [
    { label: "Easy booking in seconds" },
    { label: "Transparent pricing" },
    { label: "Premium experience" },
    { label: "Your own timings" },
];

export default function AboutSection() {
    return (
        <section id="about" className="relative overflow-hidden bg-parchment pt-6 pb-20 sm:pb-28 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 sm:mb-14">
                    <Eyebrow className="text-fire">Why KashiGo?</Eyebrow>
                    <h2 className="mt-4 max-w-4xl font-display font-light text-4xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.03em] text-night">
                        <SplitWords text="Save your spirit" />{" "}
                        <SplitWords text="and peace of mind" delay={0.15} className="italic" wordClassName={() => "text-fire-deep pr-[0.05em]"} />
                    </h2>
                </div>

                <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center">
                    <Reveal className="space-y-5 text-[16px] sm:text-lg text-night/70 leading-relaxed">
                        <p>
                            Spiritual journeys require spirit — so why lose it getting harassed and scammed? KashiGo is Varanasi&apos;s boat ride booking platform, offering easy, transparent and structured experiences on the river Ganges.
                        </p>
                        <p>
                            Gone are the days of haggling at the ghats. Book a boat ride for the perfect time of day — whether you wish to feed the Siberian gulls at dawn or witness the grand Dashashwamedh Aarti at dusk.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 border-t border-night/15 pt-2">
                            {features.map((feature, i) => (
                                <li key={feature.label} className="flex items-center gap-3 border-b border-night/15 py-4 sm:odd:pr-4">
                                    <span className="font-display italic text-sm text-fire">0{i + 1}</span>
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 bg-night text-marigold">
                                        <Check size={13} strokeWidth={3} />
                                    </span>
                                    <span className="font-medium text-night text-[15px]">{feature.label}</span>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                    <Reveal y={50} delay={0.15}>
                        <div className="relative mx-auto max-w-lg rotate-1">
                            <div aria-hidden className="absolute -inset-3 -rotate-3 rounded-[2.25rem] border border-sandstone/50" />
                            <div className="relative aspect-[4/3] md:aspect-[4/5] rounded-[2rem] overflow-hidden bg-night shadow-[0_40px_80px_-35px_rgba(7,11,24,0.7)]">
                                <Image
                                    src="/gif1.gif"
                                    alt="Varanasi Ghats at golden hour"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 480px"
                                    className="object-cover"
                                    unoptimized
                                />
                                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/50 via-transparent to-transparent" />
                                <p aria-hidden className="absolute bottom-4 left-5 font-deva text-3xl text-white/80">काशी</p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
