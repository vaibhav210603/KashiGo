"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Review = {
  id: string | number;
  name: string;
  message: string;
  rating: number;
  location?: string;
  role?: string;
};

const staticReviews: Review[] = [
  { id: "s1", name: "Rahul Sharma", message: "The evening Aarti ride was magical. Best experience in Varanasi. The boat was clean and on time.", rating: 5, role: "Tourist", location: "Delhi, India" },
  { id: "s2", name: "Priya Gupta", message: "Loved the easy booking process. No haggling with boatmen. Highly recommend the morning sunrise ride to feed the birds!", rating: 5, role: "Photographer", location: "Bangalore, India" },
  { id: "s3", name: "Amit Patel", message: "Premium service indeed. The guide explained everything beautifully. The sunset view was spectacular.", rating: 4, role: "Pilgrim", location: "Gujarat, India" },
  { id: "s4", name: "Sneha Gupta", message: "Absolutely breathtaking! The night ride was peaceful, and the KashiGo team was so professional throughout.", rating: 5, role: "Solo Traveler", location: "Mumbai, India" },
  { id: "s5", name: "Vikram Singh", message: "Great value for money. The shared boat was not overcrowded and we enjoyed the cultural stories shared by the boatman.", rating: 4, role: "Family Tourist", location: "Lucknow, India" },
  { id: "s6", name: "Ananya Iyer", message: "The website is so easy to use! We pre-booked our sunrise ride and everything was ready for us when we arrived at the ghat.", rating: 5, role: "Digital Nomad", location: "Chennai, India" },
];

const STATIC_COUNT = staticReviews.length;

export default function ReviewsSection() {
  const [userComments, setUserComments] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [form, setForm] = useState({ name: "", location: "", message: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const allReviews = [...staticReviews, ...userComments];
  const total = allReviews.length;

  const fetchComments = useCallback(async (): Promise<Review[]> => {
    try {
      const res = await fetch("/api/comments");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const fetched: Review[] = json.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          message: c.message,
          rating: c.rating,
          location: c.location ?? undefined,
        }));
        setUserComments(fetched);
        return fetched;
      }
    } catch {
      // silently fall back to static reviews
    }
    return [];
  }, []);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const goNext = useCallback(() => {
    goTo((current + 1) % total, 1);
  }, [current, total, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + total) % total, -1);
  }, [current, total, goTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        setForm({ name: "", location: "", message: "", rating: 5 });
        const newComments = await fetchComments();
        if (newComments.length > 0) {
          setDirection(1);
          setCurrent(STATIC_COUNT); // jump to the newest user comment (desc order = index 0 of userComments)
        }
      } else {
        setSubmitError(json.message || "Failed to submit.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? "80%" : "-80%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-80%" : "80%", opacity: 0 }),
  };

  const review = allReviews[Math.min(current, total - 1)];

  return (
    <section id="reviews" className="py-20 bg-white text-slate-900 border-y border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-cursive text-orange-500 mb-3">Testimonials</h2>
          <h3 className="text-4xl md:text-6xl font-bold font-heading text-slate-900 mb-6">What Our Riders Say</h3>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex items-center gap-3 md:gap-5">

            {/* Prev arrow */}
            <button
              onClick={goPrev}
              className="flex-shrink-0 w-11 h-11 md:w-13 md:h-13 rounded-full border-2 border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-400 flex items-center justify-center transition-all shadow-sm group"
              aria-label="Previous review"
            >
              <ChevronLeft size={20} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
            </button>

            {/* Card */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {review && (
                  <motion.div
                    key={review.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: "easeInOut" }}
                    className="bg-slate-50 rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm"
                  >
                    <div className="flex gap-1 mb-5 text-orange-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 1.5} />
                      ))}
                    </div>
                    <p className="text-slate-700 text-lg md:text-xl italic mb-8 leading-relaxed min-h-[72px]">
                      &ldquo;{review.message}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl font-bold text-orange-600 shrink-0">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{review.name}</h4>
                        <p className="text-sm text-slate-500">
                          {[review.role, review.location].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Next arrow */}
            <button
              onClick={goNext}
              className="flex-shrink-0 w-11 h-11 md:w-13 md:h-13 rounded-full border-2 border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-400 flex items-center justify-center transition-all shadow-sm group"
              aria-label="Next review"
            >
              <ChevronRight size={20} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
            </button>
          </div>

          {/* Dot indicators */}
          {total <= 14 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {allReviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-7 h-2.5 bg-orange-500"
                      : "w-2.5 h-2.5 bg-slate-200 hover:bg-orange-300"
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          )}

          <p className="text-center text-slate-400 text-sm mt-3 tabular-nums">
            {current + 1} / {total}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-16">
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-2 text-slate-500 shrink-0">
            <MessageSquare size={16} />
            <span className="text-sm font-medium">Share Your Experience</span>
          </div>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Comment Form */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-orange-50 rounded-2xl border border-orange-100"
          >
            <div className="text-5xl mb-4">🙏</div>
            <h4 className="text-xl font-bold font-heading text-slate-900 mb-2">Thank you!</h4>
            <p className="text-slate-600">Your experience is now part of the KashiGo story.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-orange-500 hover:text-orange-600 text-sm font-medium underline underline-offset-2 transition-colors"
            >
              Leave another comment
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Mumbai, India"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Star Rating selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Rating <span className="text-orange-500">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, rating: star }))}
                    className="transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      size={30}
                      fill={star <= form.rating ? "#f97316" : "none"}
                      className={star <= form.rating ? "text-orange-500" : "text-slate-300"}
                      strokeWidth={star <= form.rating ? 0 : 1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Experience <span className="text-orange-500">*</span>
              </label>
              <textarea
                required
                maxLength={1000}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Tell us about your boat ride experience on the Ganges..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{form.message.length}/1000</p>
            </div>

            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Review"}
              <Send size={16} />
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
