"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Anchor, Clock, Users, Sun, Moon } from "lucide-react";

export default function BookingWizard() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        ghat: "",
        timeOfDay: "",
        boatType: "",
        packageId: "",
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
            { id: "p1", name: "Sunrise + Bird Feeding", price: 499, description: "All ghats visit early morning." },
            { id: "p2", name: "Morning Ganga Aarti", price: 699, description: "Assi ghat morning aarti visit." }
        ],
        "Afternoon": [
            { id: "p3", name: "Day Ghat Tour", price: 399, description: "Cover all major 84 ghats in daylight." },
            { id: "p4", name: "Temple + Boat Tour", price: 899, description: "Combined tour logic." }
        ],
        "Evening": [
            { id: "p5", name: "Dashashwamedh Evening Aarti", price: 799, description: "Special viewing angle for Aarti." },
            { id: "p6", name: "Sunset Ride", price: 599, description: "Enjoy the beautiful sunset over the Ganges." }
        ]
    };

    const currentPackages = (packages as any)[formData.timeOfDay] || [];

    const handleCheckout = async () => {
        updateFormData("isSubmitting", true);
        try {
            const amount = currentPackages.find((p: any) => p.id === formData.packageId)?.price || 0;
            const res = await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, amount })
            });
            const data = await res.json();
            if (data.success) {
                updateFormData("rideId", data.rideId);
                nextStep(); // Move to confirmation step 6
            } else {
                alert("Booking failed. Please try again.");
            }
        } catch (error) {
            alert("An error occurred during booking.");
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['Morning', 'Afternoon', 'Evening'].map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => updateFormData("timeOfDay", time)}
                                            className={`flex flex-col items-center justify-center py-6 border-2 rounded-xl transition-all ${formData.timeOfDay === time
                                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                                : "border-slate-200 hover:border-orange-200 text-slate-600"
                                                }`}
                                        >
                                            {time === 'Morning' && <Sun size={32} className="mb-2" />}
                                            {time === 'Afternoon' && <Clock size={32} className="mb-2" />}
                                            {time === 'Evening' && <Moon size={32} className="mb-2" />}
                                            <span className="font-semibold">{time}</span>
                                        </button>
                                    ))}
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

                    {/* Step 2: Boat Type */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose your boat type</h2>
                                <p className="text-slate-600">Select how you want to experience the river.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={() => updateFormData("boatType", "Private")}
                                    className={`text-left p-6 border-2 rounded-2xl transition-all ${formData.boatType === "Private"
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-slate-200 hover:border-orange-200"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-lg ${formData.boatType === "Private" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                                            <Anchor size={24} />
                                        </div>
                                        {formData.boatType === "Private" && <Check className="text-orange-500" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Private Boat</h3>
                                    <p className="text-sm text-slate-600">Flexible timings. Best for family, couples, or private groups. You have the whole boat to yourself.</p>
                                </button>

                                <button
                                    onClick={() => updateFormData("boatType", "Sharing")}
                                    className={`text-left p-6 border-2 rounded-2xl transition-all ${formData.boatType === "Sharing"
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-slate-200 hover:border-orange-200"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-lg ${formData.boatType === "Sharing" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                                            <Users size={24} />
                                        </div>
                                        {formData.boatType === "Sharing" && <Check className="text-orange-500" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sharing Boat</h3>
                                    <p className="text-sm text-slate-600">Fixed departure times. Economical choice. Share the experience with other travellers.</p>
                                </button>
                            </div>

                            <div className="flex justify-between pt-6">
                                <button
                                    onClick={prevStep}
                                    className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 flex items-center transition-colors"
                                >
                                    <ChevronLeft size={20} className="mr-2" /> Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.boatType}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors"
                                >
                                    Next Step <ChevronRight size={20} className="ml-2" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Package Selection */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a Package</h2>
                                <p className="text-slate-600">Based on your choice of {formData.timeOfDay} rides.</p>
                            </div>

                            <div className="space-y-4">
                                {currentPackages.map((pkg: any) => (
                                    <div
                                        key={pkg.id}
                                        onClick={() => updateFormData("packageId", pkg.id)}
                                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${formData.packageId === pkg.id
                                            ? "border-orange-500 bg-orange-50/50"
                                            : "border-slate-200 hover:border-orange-200"
                                            }`}
                                    >
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900">{pkg.name}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-xl text-orange-600">₹{pkg.price}</div>
                                            <span className="text-xs text-slate-400">per person/boat</span>
                                        </div>
                                    </div>
                                ))}
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Number of Passengers *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={formData.passengerDetails.passengersCount}
                                        onChange={(e) => updatePassengerDetail("passengersCount", parseInt(e.target.value))}
                                        className="w-full border-slate-300 rounded-lg shadow-sm py-3 px-4 focus:ring-orange-500 focus:border-orange-500 border bg-white"
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
                                    <span className="text-slate-500">Boat & Time</span>
                                    <span className="font-semibold text-slate-900">{formData.boatType} • {formData.timeOfDay}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-4">
                                    <span className="text-slate-500">Passengers</span>
                                    <span className="font-semibold text-slate-900">{formData.passengerDetails.passengersCount} Person(s) - {formData.passengerDetails.name}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-slate-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-orange-600">₹{currentPackages.find((p: any) => p.id === formData.packageId)?.price || 0}</span>
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
