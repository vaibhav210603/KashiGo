"use client";

import Link from "next/link";
import Image from "next/image";

export default function PackagesSection() {
    const packages = [
        {
            time: "Morning",
            title: "Sunrise & Bird Feeding",
            description: "Experience the tranquil morning vibes of Kashi. Perfect for photography and meditation.",
            price: "₹499",
            features: ["Subah-e-Banaras", "Siberian Gull Feeding", "All Ghat Visit"],
            image: "/sunrise.png"
        },
        {
            time: "Evening",
            title: "Majestic Sunset & Aarti",
            description: "Witness the magnificent Ganga Aarti from the best vantage point on the water.",
            price: "₹799",
            features: ["Dashashwamedh Aarti", "Evening Lights", "Comfortable Seating"],
            image: "/sunset.png",
            featured: true
        },
        {
            time: "Night",
            title: "Mystic Night Cruise",
            description: "A serene, quiet ride exploring the mystical ghats under the moonlight.",
            price: "₹999",
            features: ["Peaceful Ambiance", "Namo Ghat Visit", "Private Options"],
            image: "/night.png"
        }
    ];

    return (
        <section id="packages" className="py-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-2xl md:text-3xl font-cursive text-orange-500 mb-3">What's Popular</h2>
                    <h3 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 mb-6">Choose Your Experience</h3>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Whether you prefer the peaceful morning sunrise or the vibrant evening Aarti, we have curated rides to suit your spiritual journey.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {packages.map((pkg, idx) => (
                        <div key={idx} className={`relative group rounded-2xl overflow-hidden bg-white shadow-lg transition-transform hover:-translate-y-2 ${pkg.featured ? 'ring-2 ring-orange-500 shadow-orange-100' : ''}`}>
                            {pkg.featured && (
                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                                    MOST POPULAR
                                </div>
                            )}
                            <div className="relative h-64 overflow-hidden">
                                <Image 
                                    src={pkg.image} 
                                    alt={`KashiGo Package: ${pkg.title} boat ride in Varanasi`} 
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-slate-800 z-10">
                                    {pkg.time}
                                </div>
                            </div>
                            <div className="p-8">
                                <h4 className="text-2xl font-bold text-slate-900 mb-2">{pkg.title}</h4>
                                <p className="text-slate-600 mb-6 h-12">{pkg.description}</p>
                                <div className="space-y-3 mb-8">
                                    {pkg.features.map((feat, i) => (
                                        <div key={i} className="flex items-center text-slate-700 text-sm">
                                            <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                                    <div>
                                        <span className="text-sm text-slate-500">Starting from</span>
                                        <div className="text-orange-600 text-2xl font-bold">{pkg.price}</div>
                                    </div>
                                    <Link href="/book" className="bg-slate-900 hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                                        Book
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
