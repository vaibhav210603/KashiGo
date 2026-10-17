"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SplitWords } from "@/components/motion/primitives";
import Embers from "@/components/motion/Embers";
import RiverWave from "@/components/motion/RiverWave";
import { FIRE_BTN } from "@/components/ui/styles";

type Review = {
  id: string | number;
  name: string;
  message: string;
  rating: number;
  location?: string;
  role?: string;
};

// Only real reviews submitted by customers are shown (loaded from /api/comments).
const staticReviews: Review[] = [];

const STATIC_COUNT = staticReviews.length;

export default function ReviewsSection() {
  const [userComments, setUserComments] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [form, setForm] = useState({ name: "", location: "", message: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const reduce = useReducedMotion();

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
    <section id="reviews" className="grain relative overflow-hidden bg-night pt-36 pb-20 md:pt-44 md:pb-28 text-white">
      <RiverWave fill="#f6eedf" flip className="absolute top-0 left-0" />
      <Embers density={0.4} className="-z-10" />
      <div aria-hidden className="flicker absolute -bottom-40 left-1/2 -z-10 h-80 w-[110%] -translate-x-1/2 rounded-[100%] bg-fire/15 blur-[110px]" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="ornament center text-[11px] font-semibold uppercase tracking-[0.28em] text-marigold">Testimonials</h2>
          <h3 className="mt-4 font-display font-light text-5xl md:text-7xl leading-[0.98] tracking-[-0.03em]">
            <SplitWords text="What Our" />{" "}
            <SplitWords text="Riders Say" delay={0.15} className="italic" wordClassName={() => "text-fire pr-[0.05em]"} />
          </h3>
        </div>

        {/* Carousel */}
        {total === 0 ? (
          <p className="text-center text-white/55">No reviews yet — our boat rides open soon. Been on the river with us? Be the first to share below.</p>
        ) : (
        <div className="relative">
          <div className="flex items-center gap-3 md:gap-5">

            {/* Prev arrow */}
            <button
              onClick={goPrev}
              className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/20 text-white hover:bg-marigold hover:border-marigold hover:text-night flex items-center justify-center transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft size={20} />
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
                    transition={{ duration: reduce ? 0 : 0.32, ease: "easeInOut" }}
                    className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-night-3 to-night-2 p-7 md:p-10"
                  >
                    <div className="flex gap-1 mb-5 text-marigold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 1.5} />
                      ))}
                    </div>
                    <p className="font-display italic text-white/90 text-xl md:text-2xl mb-8 leading-snug min-h-[72px]">
                      &ldquo;{review.message}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-marigold to-ember rounded-full flex items-center justify-center font-display text-xl text-night shrink-0">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{review.name}</h4>
                        <p className="text-sm text-white/50">
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
              className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/20 text-white hover:bg-marigold hover:border-marigold hover:text-night flex items-center justify-center transition-colors"
              aria-label="Next review"
            >
              <ChevronRight size={20} />
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
                      ? "w-7 h-2.5 bg-marigold"
                      : "w-2.5 h-2.5 bg-white/20 hover:bg-marigold/60"
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          )}

          <p className="text-center font-display italic text-white/40 text-sm mt-3 tabular-nums">
            {current + 1} / {total}
          </p>
        </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-16">
          <div className="flex-1 h-px bg-white/15" />
          <div className="flex items-center gap-2 text-white/60 shrink-0">
            <MessageSquare size={16} className="text-marigold" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Share Your Experience</span>
          </div>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Comment Form */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 rounded-[1.75rem] border border-ganga/30 bg-ganga/10"
          >
            <div className="text-5xl mb-4">🙏</div>
            <h4 className="font-display text-3xl text-white mb-2">Thank you!</h4>
            <p className="text-white/65">Your experience is now part of the KashiGo story.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-marigold hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
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
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Your Name <span className="text-marigold">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Rahul Sharma"
                  className="w-full px-5 py-3.5 rounded-2xl border border-white/15 bg-white/5 text-white placeholder:text-white/35 outline-none focus:border-marigold focus:bg-white/10 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Location <span className="text-white/35 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Mumbai, India"
                  className="w-full px-5 py-3.5 rounded-2xl border border-white/15 bg-white/5 text-white placeholder:text-white/35 outline-none focus:border-marigold focus:bg-white/10 transition"
                />
              </div>
            </div>

            {/* Star Rating selector */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Rating <span className="text-marigold">*</span>
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
                      fill={star <= form.rating ? "#ffb627" : "none"}
                      className={star <= form.rating ? "text-marigold" : "text-white/30"}
                      strokeWidth={star <= form.rating ? 0 : 1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Your Experience <span className="text-marigold">*</span>
              </label>
              <textarea
                required
                maxLength={1000}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Tell us about your boat ride experience on the Ganges..."
                rows={4}
                className="w-full px-5 py-3.5 rounded-2xl border border-white/15 bg-white/5 text-white placeholder:text-white/35 outline-none focus:border-marigold focus:bg-white/10 transition resize-none"
              />
              <p className="text-xs text-white/35 mt-1 text-right">{form.message.length}/1000</p>
            </div>

            {submitError && (
              <p className="text-ember text-sm">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`${FIRE_BTN} h-14 px-8`}
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
