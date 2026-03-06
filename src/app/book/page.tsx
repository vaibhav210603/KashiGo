import BookingWizard from "@/components/booking/BookingWizard";

export const metadata = {
    title: "Book a Ride - KashiGo",
    description: "Book your premium boat ride in Varanasi.",
};

export default function BookPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <BookingWizard />
            </div>
        </div>
    );
}
