"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ReviewsSection() {
    const reviews = [
        {
            name: "Rahul Sharma",
            review: "The evening Aarti ride was magical. Best experience in Varanasi. The boat was clean and on time.",
            rating: 5,
            role: "Tourist"
        },
        {
            name: "Priya Desai",
            review: "Loved the easy booking process. No haggling with boatmen. Highly recommend the morning sunrise ride to feed the birds!",
            rating: 5,
            role: "Photographer"
        },
        {
            name: "Amit Patel",
            review: "Premium service indeed. The guide explained everything beautifully. The sunset view was spectacular.",
            rating: 4,
            role: "Pilgrim"
        },
        {
            name: "Sneha Gupta",
            review: "Absolutely breathtaking! The night ride was peaceful, and the KashiGo team was so professional throughout.",
            rating: 5,
            role: "Solo Traveler"
        },
        {
            name: "Vikram Singh",
            review: "Great value for money. The shared boat was not overcrowded and we enjoyed the cultural stories shared by the boatman.",
            rating: 4,
            role: "Family Tourist"
        },
        {
            name: "Ananya Iyer",
            review: "The website is so easy to use! We pre-booked our sunrise ride and everything was ready for us when we arrived at the ghat.",
            rating: 5,
            role: "Digital Nomad"
        }
    ];

    // Duplicate reviews to create a seamless infinite marquee
    const marqueeReviews = [...reviews, ...reviews];

    return (
        <section id="reviews" className="py-12 bg-white text-slate-900 overflow-hidden border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-cursive text-orange-500 mb-3">Testimonials</h2>
                    <h3 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 mb-6">What Our Riders Say</h3>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full flex overflow-hidden group">
                {/* Gradient Fades for visual effect */}
                <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <motion.div
                    className="flex gap-8 w-max px-4"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        ease: "linear",
                        duration: 30,
                        repeat: Infinity,
                    }}
                >
                    {marqueeReviews.map((review, idx) => (
                        <div key={idx} className="w-[350px] md:w-[400px] bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-orange-500/50 shadow-sm hover:shadow-md transition-all shrink-0">
                            <div className="flex gap-1 mb-6 text-orange-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill={i < review.rating ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <p className="text-slate-600 mb-8 italic whitespace-normal">&quot;{review.review}&quot;</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl font-bold text-orange-600 shrink-0">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{review.name}</h4>
                                    <p className="text-sm text-slate-500">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
