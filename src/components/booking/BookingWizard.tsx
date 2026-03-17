"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Anchor, Clock, Users, Sun, Moon, Map, Compass, Package } from "lucide-react";

export default function BookingWizard() {
    const [step, setStep] = useState(1);
    const [couponInput, setCouponInput] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponError, setCouponError] = useState("");

    const COUPON_CODE = "KASHIGO21";
    const COUPON_PRICE = 10;
    const [formData, setFormData] = useState({
        ghat: "",
        timeOfDay: "",
        boatType: "Private",
        experienceType: "package",
        customDetails: {
            time: "",
            tripType: "round",
            destinationGhat: ""
        },
        packageId: "",
        paymentMode: "cod", // Added payment mode
        passengerDetails: {
            name: "",
            phone: "",
            email: "",
            passengersCount: 1,
        },
        isSubmitting: false,
        rideId: ""
    });

    const nextStep = () => setStep((s) => Math.min(s + 1, 6));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const updateFormData = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const updatePassengerDetail = (key: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            passengerDetails: { ...prev.passengerDetails, [key]: value }
        }));
    };

    // Dummy data for options
    const ghats = ["Dashashwamedh Ghat", "Assi Ghat", "Namo Ghat", "Manikarnika Ghat", "Panchganga Ghat"];
    const packages = {
        "Morning": [
            { id: "p1", name: "Sunrise + Bird Feeding", price: 499, description: "All ghats visit early morning.", imgSrc: "https://kashigo.in/sunrise_bg.png" },
            { id: "p2", name: "Morning Ganga Aarti", price: 699, description: "Assi ghat morning aarti visit.", imgSrc: "https://kashigo.in/m_aarti_bg.png" }
        ],
        "Afternoon": [
            { id: "p3", name: "Day Ghat Tour", price: 399, description: "Cover all major 84 ghats in daylight.", imgSrc: "https://kashigo.in/day_ghat_bg.png" },
            { id: "p4", name: "Temple + Boat Tour", price: 899, description: "Combined tour logic.", imgSrc: "https://kashigo.in/temple_boat_bg.png" }
        ],
        "Evening": [
            { id: "p5", name: "Dashashwamedh Evening Aarti", price: 799, description: "Special viewing angle for Aarti.", imgSrc: "https://kashigo.in/e_aarti_bg.png" },
            { id: "p6", name: "Sunset Ride", price: 599, description: "Enjoy the beautiful sunset over the Ganges.", imgSrc: "https://kashigo.in/sunset_bg.png" }
        ]
    };

    const currentPackages = (packages as any)[formData.timeOfDay] || [];

    const baseAmount = formData.experienceType === "package"
        ? (currentPackages.find((p: any) => p.id === formData.packageId)?.price || 0)
        : 1499;
    const finalAmount = couponApplied ? COUPON_PRICE : baseAmount;

    const applyCoupon = () => {
        if (couponInput.trim().toUpperCase() === COUPON_CODE) {
            setCouponApplied(true);
            setCouponError("");
        } else {
            setCouponApplied(false);
            setCouponError("Invalid coupon code. Please try again.");
        }
    };

    const removeCoupon = () => {
        setCouponApplied(false);
        setCouponInput("");
        setCouponError("");
    };

    const submitBooking = async (amount: number, razorpayPaymentId?: string) => {
        const res = await fetch("/api/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, amount, razorpayPaymentId })
        });
        const data = await res.json();
        if (data.success) {
            updateFormData("rideId", data.rideId);
            nextStep();
        } else {
            // If a refund is being initiated (payment was captured but DB failed),
            // surface the server's message directly so the user knows about the refund.
            throw new Error(data.message || "Booking failed. Please try again.");
        }
    };

    const handleCheckout = async () => {
        updateFormData("isSubmitting", true);
        try {
            let amount = 0;
            if (formData.experienceType === "package") {
                amount = currentPackages.find((p: any) => p.id === formData.packageId)?.price || 0;
            } else {
                amount = 1499;
            }

            if (formData.paymentMode === "cod") {
                // Cash on Delivery — direct booking
                await submitBooking(finalAmount);
            } else {
                // Online payment via Razorpay
                const orderRes = await fetch("/api/razorpay", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: finalAmount }),
                });
                const orderData = await orderRes.json();
                if (!orderData.success) throw new Error("Could not create payment order.");

                // Dynamically load Razorpay checkout script
                await new Promise<void>((resolve, reject) => {
                    if ((window as any).Razorpay) { resolve(); return; }
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
                    document.body.appendChild(script);
                });

                await new Promise<void>((resolve, reject) => {
                    const options = {
                        key: orderData.keyId,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: "KashiGo",
                        description: formData.experienceType === "package"
                            ? `${formData.timeOfDay} Package - ${formData.ghat}`
                            : `Custom Ride - ${formData.ghat}`,
                        image: "/icon.png",
                        order_id: orderData.orderId,
                        prefill: {
                            name: formData.passengerDetails.name,
                            email: formData.passengerDetails.email,
                            contact: formData.passengerDetails.phone,
                        },
                        theme: { color: "#f97316" },
                        handler: async (response: any) => {
                            try {
                                await submitBooking(finalAmount, response.razorpay_payment_id);
                                resolve();
                            } catch (err: any) {
                                reject(err);
                            }
                        },
                        modal: {
                            ondismiss: () => {
                                updateFormData("isSubmitting", false);
                                reject(new Error("Payment cancelled"));
                            },
                        },
                    };
                    const rzp = new (window as any).Razorpay(options);
                    rzp.open();
                });
            }
        } catch (error: any) {
            if (error?.message !== "Payment cancelled") {
                alert(error?.message || "An error occurred during payment.");
            }
        } finally {
            updateFormData("isSubmitting", false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Progress Bar */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`flex items-center ${s < 5 ? "flex-1" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? "bg-orange-500 text-white" : "bg-slate-700 text-slate-400"
                            }`}>
                            {step > s ? <Check size={16} /> : s}
                        </div>
                        {s < 5 && (
                            <div className={`flex-1 h-1 mx-2 rounded ${step > s ? "bg-orange-500" : "bg-slate-700"
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    {/* Step 1: Ghat & Time */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Where are you right now?</h2>
                                <p className="text-slate-600">Select your current location or preferred starting point.</p>
                            </div>

                            <div className="space-y-4 text-slate-700">
                                <label className="block text-sm font-medium text-slate-900">Starting Point (Ghat)</label>
                                <select
                                    value={formData.ghat}
                                    onChange={(e) => updateFormData("ghat", e.target.value)}
                                    className="w-full border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border bg-slate-50"
                                >
                                    <option className="" value="">-- Select a Ghat --</option>
                                    {ghats.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="block text-sm font-medium text-slate-700">When do you want to ride?</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 perspective-1000 mt-2 mb-4">
                                    {[
                                        { id: 'Morning', icon: Sun, label: 'Morning', desc: 'Serene sunrise to 11 AM', img: 'https://kashigo.in/sunrise_bg.png' },
                                        { id: 'Afternoon', icon: Clock, label: 'Afternoon', desc: '11 AM to sunset', img: 'https://kashigo.in/day_ghat_bg.png' },
                                        { id: 'Evening', icon: Moon, label: 'Evening', desc: 'Sunset & evening lights', img: 'https://kashigo.in/e_aarti_bg.png' }
                                    ].map((timeOption, idx) => {
                                        const isSelected = formData.timeOfDay === timeOption.id;
                                        const rotateDir = idx === 0 ? 10 : idx === 2 ? -10 : 0;
                                        const xOffset = idx === 0 ? -15 : idx === 2 ? 15 : 0;
                                        return (
                                            <motion.div
                                                key={timeOption.id}
                                                initial={{ rotateY: rotateDir, x: xOffset, opacity: 0 }}
                                                animate={{
                                                    rotateY: isSelected ? 0 : rotateDir,
                                                    x: isSelected ? 0 : xOffset,
                                                    scale: isSelected ? 1.05 : 1,
                                                    opacity: 1,
                                                    zIndex: isSelected ? 20 : 10
                                                }}
                                                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                                                whileHover={{ scale: isSelected ? 1.05 : 1.02, zIndex: 20 }}
                                                onClick={() => updateFormData("timeOfDay", timeOption.id)}
                                                className={`cursor-pointer w-full h-40 md:h-52 rounded-[1.5rem] p-5 flex flex-col justify-end relative shadow-xl transition-colors duration-150 transform-gpu overflow-hidden border border-white/10 ${isSelected ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-white" : ""}`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10 opacity-80" />
                                                <img src={timeOption.img} alt={timeOption.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear hover:scale-110" />

                                                <div className="relative z-20 text-white translate-y-[10px] transition-transform duration-500 group-hover:translate-y-0">
                                                    <div className="flex items-center space-x-3 mb-[2px]">
                                                        <timeOption.icon size={22} className={isSelected ? "text-orange-400" : "text-white"} />
                                                        <h3 className="text-xl font-heading font-bold tracking-tight">{timeOption.label}</h3>
                                                    </div>
                                                    <p className="text-xs text-slate-200">{timeOption.desc}</p>

                                                    <AnimatePresence>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                                className="flex items-center text-orange-400 font-bold uppercase tracking-wider text-[10px]"
                                                            >
                                                                <Check size={14} className="mr-2 stroke-[3]" /> Selected
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.ghat || !formData.timeOfDay}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors"
                                >
                                    Next Step <ChevronRight size={20} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}


                    {/* Step 2: Experience Selection */}
                    {step === 2 && (
                        <motion.div
                            key="step2-experience"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4 md:space-y-8"
                        >
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">How would you like to explore?</h2>
                                <p className="text-slate-600">Choose between our curated packages or create your own custom journey.</p>
                            </div>

                            <div className="relative flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 mt-12 mb-16 h-auto md:h-[26rem] perspective-1000">
                                {/* Package Card */}
                                <motion.div
                                    initial={{ rotateY: 15, rotateZ: -4, x: -20, opacity: 0 }}
                                    animate={{
                                        rotateY: formData.experienceType === "package" ? 0 : 15,
                                        rotateZ: formData.experienceType === "package" ? 0 : -4,
                                        x: formData.experienceType === "package" ? 0 : -20,
                                        scale: formData.experienceType === "package" ? 1.05 : 1,
                                        opacity: 1,
                                        zIndex: formData.experienceType === "package" ? 20 : 10
                                    }}
                                    transition={{ type: "spring", stiffness: 600, damping: 30 }}
                                    whileHover={{ scale: formData.experienceType === "package" ? 1.05 : 1.02, zIndex: 20 }}
                                    onClick={() => updateFormData("experienceType", "package")}
                                    className={`cursor-pointer w-full md:w-96 h-80 md:h-full rounded-[2rem] p-8 flex flex-col justify-end relative shadow-2xl transition-colors duration-150 transform-gpu overflow-hidden border border-white/10 ${formData.experienceType === "package" ? "ring-2 ring-orange-500 ring-offset-4 ring-offset-white" : ""
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10 opacity-80" />
                                    <img src="https://kashigo.in/package_bg.png" alt="Packages" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear hover:scale-110" />

                                    <div className="relative z-20 text-white translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                                        <div className="bg-orange-500 backdrop-blur-md bg-opacity-90 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-orange-400/50">
                                            <Package size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-3xl font-heading font-bold mb-3 tracking-tight">Curated Packages</h3>
                                        <p className="text-sm text-slate-200 leading-relaxed font-medium">Immerse yourself in expertly planned spiritual itineraries. Perfect timing, verified paths, and transparent pricing.</p>

                                        <AnimatePresence>
                                            {formData.experienceType === "package" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    className="flex items-center text-orange-400 font-bold uppercase tracking-wider text-xs"
                                                >
                                                    <Check size={16} className="mr-2 stroke-[3]" /> Experience Selected
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                {/* Custom Ride Card */}
                                <motion.div
                                    initial={{ rotateY: -15, rotateZ: 4, x: 20, opacity: 0 }}
                                    animate={{
                                        rotateY: formData.experienceType === "custom" ? 0 : -15,
                                        rotateZ: formData.experienceType === "custom" ? 0 : 4,
                                        x: formData.experienceType === "custom" ? 0 : 20,
                                        scale: formData.experienceType === "custom" ? 1.05 : 1,
                                        opacity: 1,
                                        zIndex: formData.experienceType === "custom" ? 20 : 10
                                    }}
                                    transition={{ type: "spring", stiffness: 600, damping: 30 }}
                                    whileHover={{ scale: formData.experienceType === "custom" ? 1.05 : 1.02, zIndex: 20 }}
                                    onClick={() => updateFormData("experienceType", "custom")}
                                    className={`cursor-pointer w-full md:w-96 h-80 md:h-full rounded-[2rem] p-8 flex flex-col justify-end relative shadow-2xl transition-colors duration-150 transform-gpu overflow-hidden border border-white/10 ${formData.experienceType === "custom" ? "ring-2 ring-slate-800 ring-offset-4 ring-offset-white" : ""
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 opacity-80" />
                                    <img src="https://kashigo.in/custom_bg.png" alt="Custom Ride" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear hover:scale-110" />

                                    <div className="relative z-20 text-white translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                                        <div className="bg-slate-800 backdrop-blur-md bg-opacity-90 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-slate-600/50">
                                            <Compass size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-3xl font-heading font-bold mb-3 tracking-tight">Custom Journey</h3>
                                        <p className="text-sm text-slate-200 leading-relaxed font-medium">Design your own river exploration. Choose precise timings, unique routes, and craft your intimate spiritual voyage.</p>

                                        <AnimatePresence>
                                            {formData.experienceType === "custom" && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    className="flex items-center text-slate-300 font-bold uppercase tracking-wider text-xs"
                                                >
                                                    <Check size={16} className="mr-2 stroke-[3]" /> Experience Selected
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex justify-between pt-6">
                                <button onClick={prevStep} className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 flex items-center transition-colors">
                                    <ChevronLeft size={20} className="mr-2" /> Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.experienceType}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors shadow-lg hover:shadow-orange-500/30"
                                >
                                    Next Step <ChevronRight size={20} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Package Selection or Custom Details */}
                    {step === 3 && formData.experienceType === "package" && (
                        <motion.div
                            key="step3-package"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a Package</h2>
                                <p className="text-slate-600">Based on your choice of {formData.timeOfDay} rides.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 perspective-1000 mt-4 mb-8">
                                {currentPackages.map((pkg: any, idx: number) => {
                                    const isSelected = formData.packageId === pkg.id;
                                    const rotateDir = idx % 2 === 0 ? 15 : -15; // Alternating stack effect
                                    return (
                                        <motion.div
                                            key={pkg.id}
                                            initial={{ rotateY: rotateDir, x: rotateDir > 0 ? -20 : 20, opacity: 0 }}
                                            animate={{
                                                rotateY: isSelected ? 0 : rotateDir,
                                                x: isSelected ? 0 : (rotateDir > 0 ? -20 : 20),
                                                scale: isSelected ? 1.05 : 1,
                                                opacity: 1,
                                                zIndex: isSelected ? 20 : 10
                                            }}
                                            transition={{ type: "spring", stiffness: 600, damping: 30 }}
                                            whileHover={{ scale: isSelected ? 1.05 : 1.02, zIndex: 20 }}
                                            onClick={() => updateFormData("packageId", pkg.id)}
                                            className={`cursor-pointer w-full h-56 md:h-72 rounded-[1.5rem] p-6 flex flex-col justify-end relative shadow-xl transition-colors duration-150 transform-gpu overflow-hidden border border-white/10 ${isSelected ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-white" : ""}`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10 opacity-80" />
                                            <img src={pkg.imgSrc} alt={pkg.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear hover:scale-110" />

                                            <div className="relative z-20 text-white translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                                                <div className="flex justify-between items-end mb-2">
                                                    <h3 className="text-xl font-heading font-bold truncate pr-4">{pkg.name}</h3>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="font-bold text-lg text-orange-400">₹{pkg.price}</div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-200 line-clamp-2">{pkg.description}</p>

                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            className="flex items-center text-orange-400 font-bold uppercase tracking-wider text-xs"
                                                        >
                                                            <Check size={16} className="mr-2 stroke-[3]" /> Selected
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between pt-6">
                                <button onClick={prevStep} className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 flex items-center transition-colors">
                                    <ChevronLeft size={20} className="mr-2" /> Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.packageId}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors"
                                >
                                    Next Step <ChevronRight size={20} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Custom Ride Details Form */}
                    {step === 3 && formData.experienceType === "custom" && (
                        <motion.div
                            key="step3-custom"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Custom Ride Details</h2>
                                <p className="text-slate-600">Plan your perfect river journey at your chosen time.</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time *</label>
                                    <input
                                        type="time"
                                        value={formData.customDetails.time}
                                        onChange={(e) => updateFormData("customDetails", { ...formData.customDetails, time: e.target.value })}
                                        className="w-full border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-4">Trip Type *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 perspective-1000 mb-6">
                                        {/* Round About Card */}
                                        <motion.div
                                            initial={{ rotateY: 15, x: -20, opacity: 0 }}
                                            animate={{
                                                rotateY: formData.customDetails.tripType === "round" ? 0 : 15,
                                                x: formData.customDetails.tripType === "round" ? 0 : -20,
                                                scale: formData.customDetails.tripType === "round" ? 1.05 : 1,
                                                opacity: 1,
                                                zIndex: formData.customDetails.tripType === "round" ? 20 : 10
                                            }}
                                            transition={{ type: "spring", stiffness: 600, damping: 30 }}
                                            whileHover={{ scale: formData.customDetails.tripType === "round" ? 1.05 : 1.02, zIndex: 20 }}
                                            onClick={() => updateFormData("customDetails", { ...formData.customDetails, tripType: "round", destinationGhat: "" })}
                                            className={`cursor-pointer w-full h-48 md:h-64 rounded-[1.5rem] p-6 flex flex-col justify-end relative shadow-xl transition-colors duration-150 transform-gpu overflow-hidden border border-white/10 ${formData.customDetails.tripType === "round" ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-white" : ""}`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10 opacity-80" />
                                            <img src="/round_bg.png" alt="Round About Trip" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear hover:scale-110" />

                                            <div className="relative z-20 text-white translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                                                <h3 className="text-xl font-heading font-bold mb-2">Round About</h3>
                                                <p className="text-sm text-slate-200">Return to your starting ghat.</p>
                                                <AnimatePresence>
                                                    {formData.customDetails.tripType === "round" && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            className="flex items-center text-orange-400 font-bold uppercase tracking-wider text-xs"
                                                        >
                                                            <Check size={16} className="mr-2 stroke-[3]" /> Selected
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>

                                        {/* Single Way Card */}
                                        <motion.div
                                            initial={{ rotateY: -15, x: 20, opacity: 0 }}
                                            animate={{
                                                rotateY: formData.customDetails.tripType === "single" ? 0 : -15,
                                                x: formData.customDetails.tripType === "single" ? 0 : 20,
                                                scale: formData.customDetails.tripType === "single" ? 1.05 : 1,
                                                opacity: 1,
                                                zIndex: formData.customDetails.tripType === "single" ? 20 : 10
                                            }}
                                            transition={{ type: "spring", stiffness: 600, damping: 30 }}
                                            whileHover={{ scale: formData.customDetails.tripType === "single" ? 1.05 : 1.02, zIndex: 20 }}
                                            onClick={() => updateFormData("customDetails", { ...formData.customDetails, tripType: "single" })}
                                            className={`cursor-pointer w-full h-48 md:h-64 rounded-[1.5rem] p-6 flex flex-col justify-end relative shadow-xl transition-colors duration-150 transform-gpu overflow-hidden border border-white/10 ${formData.customDetails.tripType === "single" ? "ring-2 ring-slate-800 ring-offset-2 ring-offset-white" : ""}`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10 opacity-80" />
                                            <img src="/single_bg.png" alt="Single Way Trip" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear hover:scale-110" />

                                            <div className="relative z-20 text-white translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
                                                <h3 className="text-xl font-heading font-bold mb-2">Single Way</h3>
                                                <p className="text-sm text-slate-200">Drop off at a different ghat.</p>
                                                <AnimatePresence>
                                                    {formData.customDetails.tripType === "single" && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            className="flex items-center text-slate-300 font-bold uppercase tracking-wider text-xs"
                                                        >
                                                            <Check size={16} className="mr-2 stroke-[3]" /> Selected
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {formData.customDetails.tripType === "round" && (
                                        <div className="mt-4 p-4 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100 flex items-start shadow-sm">
                                            <Compass className="w-5 h-5 mr-3 flex-shrink-0 text-orange-500" />
                                            <p>Explore all the ghats in a round about tour from one end to the other, witnessing the full grandeur of Varanasi from the river.</p>
                                        </div>
                                    )}
                                </div>

                                {formData.customDetails.tripType === "single" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                    >
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Destination Ghat *</label>
                                        <select
                                            value={formData.customDetails.destinationGhat}
                                            onChange={(e) => updateFormData("customDetails", { ...formData.customDetails, destinationGhat: e.target.value })}
                                            className="w-full border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border bg-slate-50"
                                        >
                                            <option value="">-- Select Destination --</option>
                                            {ghats.filter(g => g !== formData.ghat).map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex justify-between pt-6">
                                <button onClick={prevStep} className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 flex items-center transition-colors">
                                    <ChevronLeft size={20} className="mr-2" /> Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.customDetails.time || (formData.customDetails.tripType === "single" && !formData.customDetails.destinationGhat)}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors"
                                >
                                    Next Step <ChevronRight size={20} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Passenger Details */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Passenger Details</h2>
                                <p className="text-slate-600">We need these details to confirm your booking.</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.passengerDetails.name}
                                        onChange={(e) => updatePassengerDetail("name", e.target.value)}
                                        className="w-full border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border bg-white"
                                        placeholder="Enter lead passenger name"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={formData.passengerDetails.phone}
                                            onChange={(e) => updatePassengerDetail("phone", e.target.value)}
                                            className="w-full border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border bg-white"
                                            placeholder="+91"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address (Optional)</label>
                                        <input
                                            type="email"
                                            value={formData.passengerDetails.email}
                                            onChange={(e) => updatePassengerDetail("email", e.target.value)}
                                            className="w-full border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border bg-white"
                                            placeholder="For booking receipt"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-black text-sm font-medium text-slate-700 mb-1">Number of Passengers *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={formData.passengerDetails.passengersCount}
                                        onChange={(e) => updatePassengerDetail("passengersCount", parseInt(e.target.value))}
                                        className="w-full text-black border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between pt-6">
                                <button onClick={prevStep} className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 flex items-center transition-colors">
                                    <ChevronLeft size={20} className="mr-2" /> Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.passengerDetails.name || !formData.passengerDetails.phone || formData.passengerDetails.passengersCount < 1}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors"
                                >
                                    Review Booking <ChevronRight size={20} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Checkout & Payment */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Review & Pay</h2>
                                <p className="text-slate-600">Please review your selections before proceeding to payment.</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
                                <div className="flex justify-between border-b border-slate-200 pb-4">
                                    <span className="text-slate-500">Pick-up Location</span>
                                    <span className="font-semibold text-slate-900">{formData.ghat}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-4">
                                    <span className="text-slate-500">Experience</span>
                                    <span className="font-semibold text-slate-900 text-right">
                                        {formData.experienceType === "package" ? (
                                            <>Popular Package • {formData.timeOfDay}</>
                                        ) : (
                                            <>Custom Ride at {formData.customDetails.time} <br /> <span className="text-sm text-slate-500">{formData.customDetails.tripType === "round" ? "Round About" : `Single Way to ${formData.customDetails.destinationGhat}`}</span></>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-4">
                                    <span className="text-slate-500">Passengers</span>
                                    <span className="font-semibold text-slate-900">{formData.passengerDetails.passengersCount} Person(s) - {formData.passengerDetails.name}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-slate-900">Total Amount</span>
                                    <div className="text-right">
                                        {couponApplied && (
                                            <div className="text-sm text-slate-400 line-through">₹{baseAmount}</div>
                                        )}
                                        <span className={`text-2xl font-bold ${couponApplied ? 'text-green-600' : 'text-orange-600'}`}>
                                            ₹{finalAmount}
                                        </span>
                                        {couponApplied && (
                                            <div className="text-xs text-green-600 font-semibold mt-0.5">Coupon applied ✓</div>
                                        )}
                                    </div>
                                </div>

                                {/* Coupon Code */}
                                <div className="pt-3 border-t border-slate-200">
                                    {!couponApplied ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponInput}
                                                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                                                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                                                placeholder="Enter coupon code"
                                                className="flex-1 border border-slate-300 rounded-lg py-2 px-3 text-sm text-black focus:ring-orange-500 focus:border-orange-500 outline-none uppercase tracking-widest font-mono"
                                            />
                                            <button
                                                onClick={applyCoupon}
                                                className="bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                                            <div className="flex items-center gap-2 text-green-700">
                                                <Check size={16} className="stroke-[3]" />
                                                <span className="text-sm font-semibold font-mono tracking-widest">{COUPON_CODE}</span>
                                                <span className="text-sm">— ₹{baseAmount - COUPON_PRICE} off!</span>
                                            </div>
                                            <button onClick={removeCoupon} className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-4">Remove</button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-red-500 text-xs mt-1.5 ml-1">{couponError}</p>
                                    )}
                                </div>

                                {/* Payment Modes */}
                                <div className="pt-4 border-t border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Payment Mode</h3>
                                    <div className="space-y-3">
                                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMode === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'}`}>
                                            <input
                                                type="radio"
                                                name="paymentMode"
                                                value="cod"
                                                checked={formData.paymentMode === 'cod'}
                                                onChange={(e) => updateFormData('paymentMode', e.target.value)}
                                                className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300"
                                            />
                                            <span className="ml-3 font-medium text-slate-900">Cash on Delivery (CoD)</span>
                                        </label>

                                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMode === 'online' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-200'}`}>
                                            <input
                                                type="radio"
                                                name="paymentMode"
                                                value="online"
                                                checked={formData.paymentMode === 'online'}
                                                onChange={(e) => updateFormData('paymentMode', e.target.value)}
                                                className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300"
                                            />
                                            <div className="ml-3 flex items-center gap-3">
                                                <span className="font-medium text-slate-900">Credit / Debit / UPI</span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    Powered by Razorpay
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6">
                                <button onClick={prevStep} className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 flex items-center transition-colors">
                                    <ChevronLeft size={20} className="mr-2" /> Back
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={formData.isSubmitting}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center transition-colors shadow-lg shadow-green-500/30 disabled:bg-slate-400 disabled:cursor-wait"
                                >
                                    {formData.isSubmitting ? "Processing..." : "Proceed to Pay"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 6: Confirmation */}
                    {step === 6 && (
                        <motion.div
                            key="step6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={48} className="text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900">Ride Booked Successfully!</h2>
                            <p className="text-lg text-slate-600">Your booking is confirmed. Check your email for details.</p>

                            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 max-w-sm mx-auto my-8">
                                <p className="text-sm text-slate-500 mb-2">Your Ride Number</p>
                                <p className="text-2xl font-mono font-bold text-orange-600">{formData.rideId}</p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
                                <p className="text-slate-500">Need help?</p>
                                <p className="font-semibold text-slate-800">Customer Care: +91 98765 43210</p>
                                <p className="text-sm text-orange-600">support@kashigo.com</p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
