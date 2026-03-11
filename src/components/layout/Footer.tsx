import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <img src="/KashiGo.png" alt="KashiGo" className="h-10 w-auto object-contain" />
                            <span className="tracking-tighter text-white">
                                <span className="font-cursive text-4xl text-orange-500 font-bold pr-1">Kashi</span>
                                <span className="font-heading font-bold text-2xl">Go</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 mt-2 max-w-sm">
                            Varanasi Boat Rides, Made Simple.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="#about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
                            <li><Link href="#packages" className="hover:text-orange-500 transition-colors">Rides & Packages</Link></li>
                            <li><Link href="#reviews" className="hover:text-orange-500 transition-colors">Reviews</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><a href="mailto:support@kashigo.com" className="hover:text-orange-500 transition-colors">support@kashigo.com</a></li>
                            <li><a href="tel:+919876543210" className="hover:text-orange-500 transition-colors">+91 8175966910</a></li>
                            <li className="text-slate-400 mt-4">Brahma Ghat, Varanasi</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} KashiGo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
