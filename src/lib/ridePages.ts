// SEO landing page content for each boat ride (/boat-rides/[slug]).
// Prices and ride names come from boatRides.ts/boatPrices.ts — never hardcode a ₹ amount here,
// so a price change flows through to every page, schema block and FAQ answer.
import type { BoatRideId } from "@/lib/boatRides";

export type RidePageId = BoatRideId | "custom";

export type RidePage = {
    slug: string;
    rideId: RidePageId;
    title: string; // <title>, brand added by the root template
    description: string; // meta description
    h1: string;
    keywords: string[];
    // Typical length on the water. TODO(owner): confirm these against what the boatmen actually do.
    duration: string;
    iso8601Duration: string;
    startPoint: string;
    bestFor: string[];
    intro: string[];
    sections: { heading: string; body: string[] }[];
    tips: string[];
    // Answers may use {price}, {custom} and {phone}; the page fills them in from the live price list.
    faqs: { q: string; a: string }[];
    related: RidePageId[];
};

export const RIDE_PAGES: RidePage[] = [
    {
        slug: "sunrise-boat-ride-varanasi",
        rideId: "p1",
        title: "Sunrise Boat Ride in Varanasi — Book a Private Boat Online",
        description:
            "Book a private sunrise boat ride on the Ganges in Varanasi. Morning rituals along the main ghats, Siberian gulls in winter, fixed price per boat, local boatman.",
        h1: "Sunrise Boat Ride in Varanasi",
        keywords: [
            "sunrise boat ride varanasi",
            "varanasi morning boat ride",
            "ganges sunrise boat tour",
            "varanasi sunrise boat price",
            "bird feeding boat ride varanasi",
            "kashi morning boat ride booking",
        ],
        duration: "About 1 hour",
        iso8601Duration: "PT1H",
        startPoint: "Dashashwamedh Ghat (or the ghat you choose)",
        bestFor: ["Photography", "First-time visitors", "Couples", "Winter birdwatching"],
        intro: [
            "If you only do one thing in Varanasi, make it this. Before the city's traffic and noise begin, the ghats are already alive — people bathing, priests chanting, yoga on the steps, smoke rising from the cremation ghats — and the soft dawn light turns the whole riverfront gold.",
            "A private sunrise boat lets you see all of it from the river, at your own pace, without bargaining on the steps at 5 a.m.",
        ],
        sections: [
            {
                heading: "What you'll see",
                body: [
                    "Your boatman rows or motors past the main ghats while the morning rituals are happening: pilgrims taking their holy dip, priests performing small aartis, washermen at work and the old palaces of the riverfront catching the first light.",
                    "From roughly November to February, flocks of Siberian gulls winter on the Ganges. Feeding them from the boat is a favourite moment for many visitors — and the reason this ride includes bird feeding.",
                ],
            },
            {
                heading: "Why go at sunrise",
                body: [
                    "The light is the best of the day for photos, the river is calm, and it's cool even in the hotter months. Varanasi's daily life is most visible in the early morning — by 9 a.m. much of the ritual activity on the ghats has finished.",
                    "Locals will tell you to do your sightseeing between 5 and 9 a.m., hide from the afternoon heat, and come back out for the evening Aarti. The sunrise boat is the perfect way to start that day.",
                ],
            },
            {
                heading: "Pair it with Subah-e-Banaras",
                body: [
                    "The morning Aarti at Assi Ghat (Subah-e-Banaras) happens around sunrise. If you'd like to see the ceremony and then drift along the ghats, book the Morning Ganga Aarti ride instead — it's built around exactly that.",
                ],
            },
        ],
        tips: [
            "Bring a light layer from October to February — it's cold on the water before the sun is up.",
            "Don't photograph the cremations at Manikarnika Ghat; it upsets the families.",
            "Carry small cash for chai or a diya (small leaf lamp) — ₹10–20.",
        ],
        faqs: [
            {
                q: "How much is a sunrise boat ride in Varanasi?",
                a: "KashiGo's sunrise ride is {price} for the whole private boat, not per person. That's a fixed price with a local boatman — no bargaining on the ghat.",
            },
            {
                q: "What time does the sunrise boat ride start?",
                a: "Our sunrise ride starts at about 5:30 a.m. Sunrise moves through the year, so we'll confirm the exact pickup time with you after you book.",
            },
            {
                q: "Will I see birds on the sunrise ride?",
                a: "Siberian gulls winter on the Ganges from roughly November to February, and feeding them from the boat is part of this ride. Outside those months you'll still see the morning rituals but fewer birds.",
            },
            {
                q: "Is the price per person or per boat?",
                a: "Per boat. The price covers a private boat with 2 passengers; each extra passenger in your group is ₹350.",
            },
        ],
        related: ["p2", "p5", "p6"],
    },
    {
        slug: "ganga-aarti-boat-ride-varanasi",
        rideId: "p5",
        title: "Ganga Aarti Boat Ride Varanasi — Evening Aarti from the River",
        description:
            "Watch the evening Ganga Aarti at Dashashwamedh Ghat from a private boat. Front-row river view of all seven priests, fixed price per boat, book online with a local boatman.",
        h1: "Evening Ganga Aarti Boat Ride (Dashashwamedh Ghat)",
        keywords: [
            "ganga aarti boat ride varanasi",
            "dashashwamedh ghat aarti boat",
            "varanasi evening aarti boat booking",
            "ganga aarti boat price",
            "best way to watch ganga aarti",
            "kashi aarti boat ride",
        ],
        duration: "About 1.5 hours (including the 40–50 minute ceremony)",
        iso8601Duration: "PT1H30M",
        startPoint: "Dashashwamedh Ghat",
        bestFor: ["Seeing the whole ceremony", "Families", "Anyone who dislikes crowds", "Photography"],
        intro: [
            "Every evening at Dashashwamedh Ghat, seven priests perform a synchronised fire ceremony to the Goddess Ganga — brass lamps, conch shells, incense and chanting for 40 to 50 minutes in front of tens of thousands of people.",
            "From the ghat steps you see the priests' backs. From a boat 30 to 50 metres out, you see all seven at once, the lit ghats behind them and the flames reflected in the river. It's the view in every famous photo of the Aarti.",
        ],
        sections: [
            {
                heading: "Why watch the Aarti from a boat",
                body: [
                    "It's the most panoramic way to see it. You get the full width of the ceremony, space around you, and it's cooler and calmer than the packed steps. You can turn around and see the entire illuminated riverfront.",
                    "The trade-off: you're an observer rather than in the crowd, so you won't feel the heat of the lamps or smell the incense. Many visitors do the boat one night and the steps another.",
                ],
            },
            {
                heading: "When the Aarti starts",
                body: [
                    "The Aarti follows sunset, so the time changes through the year: around 6:00 p.m. from October to February (sometimes 5:45 p.m. in December), around 6:30 p.m. from March to May, and around 7:00 p.m. from June to September.",
                    "Boats start taking positions 60 to 90 minutes before the ceremony. We set off early so you're in a good spot before the river fills up.",
                ],
            },
            {
                heading: "Why book ahead",
                body: [
                    "October to February is peak season and the best spots on the water go early. Bargaining with a boatman on the night usually means paying double for a poor position at the back. Booking online locks the price and the boat.",
                ],
            },
            {
                heading: "The diya tradition",
                body: [
                    "After the Aarti, it's traditional to light a diya — a small leaf cup with marigolds and a candle — make a silent wish and float it on the river. Children sell them for ₹10–20. Do it; it's one of the most beautiful things you can do in Varanasi.",
                ],
            },
        ],
        tips: [
            "Ignore anyone selling \"VIP seats\" on the ghat — there are no official paid seats at Dashashwamedh.",
            "Bring a light jacket from October to February; evenings on the water get cool.",
            "Photography and video of the Aarti are fine.",
        ],
        faqs: [
            {
                q: "How much does a Ganga Aarti boat ride cost?",
                a: "KashiGo's evening Aarti ride at Dashashwamedh is {price} for the whole private boat, not per person — a fixed price booked online, with a local boatman.",
            },
            {
                q: "What time should I be at the ghat?",
                a: "Our evening Aarti ride starts at about 6:30 p.m., adjusted to the season's sunset. We'll confirm the exact meeting time after you book.",
            },
            {
                q: "Is the Ganga Aarti better from a boat or the ghat steps?",
                a: "From a boat you see all seven priests and the whole lit riverfront; from the steps you're inside the crowd, close to the fire. For a first visit, most people prefer the boat view.",
            },
            {
                q: "Is the Ganga Aarti free?",
                a: "Yes — watching from the ghat steps is free. You only pay if you want a boat or a rooftop seat.",
            },
            {
                q: "Does the Aarti happen when it rains?",
                a: "The Aarti happens every evening. Boating, however, can be suspended by the local administration when the Ganges floods during the monsoon. If that happens on your date, call us on {phone} and we'll move or refund your booking.",
            },
        ],
        related: ["p6", "p1", "p2"],
    },
    {
        slug: "sunset-boat-ride-varanasi",
        rideId: "p6",
        title: "Sunset Boat Ride Varanasi — Golden Hour on the Ganges",
        description:
            "Book a private sunset boat ride on the Ganges in Varanasi. Golden hour past the old ghats and palaces, fixed price per boat, trusted local boatman.",
        h1: "Sunset Boat Ride in Varanasi",
        keywords: [
            "sunset boat ride varanasi",
            "varanasi evening boat ride",
            "ganges sunset cruise",
            "varanasi boat ride evening price",
            "kashi sunset boat",
        ],
        duration: "About 1 hour",
        iso8601Duration: "PT1H",
        startPoint: "Dashashwamedh Ghat (or the ghat you choose)",
        bestFor: ["Late risers", "Couples", "Golden-hour photography"],
        intro: [
            "Not a morning person? The sunset ride gives you Varanasi's riverfront in warm golden light, without the 5 a.m. alarm.",
            "You'll glide past the old ghats and riverside palaces as the sun drops and the city begins to light up for the evening.",
        ],
        sections: [
            {
                heading: "What you'll see",
                body: [
                    "The long line of ghats in the late afternoon light, evening activity building on the steps, and the fires of the cremation ghats as dusk falls.",
                    "The sunset ride starts around 5 p.m. — before the evening Aarti — so it's an easy way to see the river and still be back on the ghat for the ceremony.",
                ],
            },
            {
                heading: "Sunset ride or Aarti ride?",
                body: [
                    "The sunset ride is about the river and the light. The Aarti ride is about the ceremony — the boat anchors in front of Dashashwamedh Ghat for the whole Aarti. If the Aarti is your priority, book the evening Ganga Aarti ride.",
                ],
            },
        ],
        tips: [
            "Sit on the side facing the ghats for photos — the light will be behind you.",
            "No photos of the cremations at Manikarnika Ghat.",
        ],
        faqs: [
            {
                q: "How much is a sunset boat ride in Varanasi?",
                a: "KashiGo's sunset ride is {price} for the whole private boat, not per person — a fixed price with a local boatman.",
            },
            {
                q: "What time is the sunset boat ride?",
                a: "It starts around 5 p.m. and we adjust to the season's sunset. We'll confirm the exact time after you book.",
            },
            {
                q: "Can I see the Ganga Aarti on the sunset ride?",
                a: "The sunset ride finishes around the time the Aarti begins. To watch the ceremony from the water, book the evening Ganga Aarti ride, which stays in front of Dashashwamedh Ghat for the whole Aarti.",
            },
        ],
        related: ["p5", "p1", "p3"],
    },
    {
        slug: "morning-ganga-aarti-assi-ghat-boat-ride",
        rideId: "p2",
        title: "Morning Ganga Aarti at Assi Ghat — Subah-e-Banaras Boat Ride",
        description:
            "See the quieter dawn Ganga Aarti (Subah-e-Banaras) at Assi Ghat from a private boat, then drift along the ghats at sunrise. Fixed price per boat, book online.",
        h1: "Morning Ganga Aarti at Assi Ghat (Subah-e-Banaras)",
        keywords: [
            "morning ganga aarti varanasi",
            "subah e banaras",
            "assi ghat morning aarti boat",
            "assi ghat aarti time",
            "varanasi morning aarti boat ride",
        ],
        duration: "About 1.5 hours",
        iso8601Duration: "PT1H30M",
        startPoint: "Assi Ghat",
        bestFor: ["Avoiding crowds", "Spiritual travellers", "Early risers"],
        intro: [
            "If the evening Aarti sounds too crowded, the morning ceremony at Assi Ghat is one of Varanasi's best-kept experiences. Subah-e-Banaras combines a small fire ceremony with classical music and yoga, and the crowd is mostly local.",
            "This ride lets you watch the Aarti from the river and then continue along the ghats as the city wakes up.",
        ],
        sections: [
            {
                heading: "What is Subah-e-Banaras?",
                body: [
                    "It's the dawn counterpart to the famous evening Aarti — gentler, more contemplative and far less crowded. It takes place at Assi Ghat around sunrise, roughly 5:00 to 6:30 a.m. depending on the season.",
                ],
            },
            {
                heading: "The best two hours in Varanasi",
                body: [
                    "The morning Aarti followed by a sunrise drift along the ghats is, in our view, the best two-hour experience in the city: a quiet ceremony, then the whole riverfront coming to life in soft dawn light.",
                ],
            },
        ],
        tips: [
            "It's cold on the water before dawn from October to February — bring a layer.",
            "Assi Ghat is at the southern end of the main ghats; allow time to get there in the dark.",
        ],
        faqs: [
            {
                q: "How much is the morning Aarti boat ride?",
                a: "KashiGo's morning Ganga Aarti ride from Assi Ghat is {price} for the whole private boat, not per person.",
            },
            {
                q: "What time is the morning Aarti at Assi Ghat?",
                a: "Around sunrise — roughly 5:00 to 6:30 a.m. depending on the season. Our ride starts at about 6:00 a.m., and we'll confirm the exact time after you book.",
            },
            {
                q: "Morning or evening Aarti — which should I choose?",
                a: "The evening Aarti at Dashashwamedh is the grand spectacle; the morning Aarti at Assi is quieter and more local. If you have two days, do both.",
            },
        ],
        related: ["p1", "p5", "p6"],
    },
    {
        slug: "day-ghat-boat-tour-varanasi",
        rideId: "p3",
        title: "Varanasi Ghat Boat Tour — Daytime Ride Past the Major Ghats",
        description:
            "A daytime private boat ride past Varanasi's major ghats with the stories behind each one. Fixed price per boat, local boatman.",
        h1: "Day Ghat Boat Tour in Varanasi",
        keywords: [
            "varanasi ghat tour by boat",
            "varanasi day boat ride",
            "84 ghats varanasi boat",
            "cheap boat ride varanasi",
            "varanasi boat ride afternoon",
        ],
        duration: "About 1 hour",
        iso8601Duration: "PT1H",
        startPoint: "Dashashwamedh Ghat (or the ghat you choose)",
        bestFor: ["Budget travellers", "History and architecture", "Flexible schedules"],
        intro: [
            "Not every great boat ride happens at dawn or dusk. The day ghat tour is a relaxed daylight ride past the major ghats, with the stories of who built them and why they matter.",
            "It's the easiest ride to fit into a busy day.",
        ],
        sections: [
            {
                heading: "What you'll see",
                body: [
                    "In clear daylight you can properly see the architecture of the riverfront — the palaces, temples and stepped ghats built by maharajas and merchants over centuries — and hear the stories behind places like Dashashwamedh, Manikarnika and Assi.",
                ],
            },
            {
                heading: "When to take it",
                body: [
                    "The ride starts around midday. In the hot months (April to June) the midday sun on the river is strong, so a sunrise or sunset ride may be more comfortable; in winter, a daytime ride is pleasantly warm.",
                ],
            },
        ],
        tips: [
            "Bring sunscreen, a hat and water — there's little shade on the river.",
            "Packaged water has its maximum price (MRP) printed on it; never pay more.",
        ],
        faqs: [
            {
                q: "How much is a daytime boat ride in Varanasi?",
                a: "KashiGo's day ghat tour is {price} for the whole private boat, not per person.",
            },
            {
                q: "Is a daytime boat ride worth it?",
                a: "Yes, if you want to see the ghats' architecture clearly and hear their history. For atmosphere and rituals, sunrise is better; for the ceremony, choose the evening Aarti ride.",
            },
        ],
        related: ["p4", "p1", "p6"],
    },
    {
        slug: "temple-and-boat-tour-varanasi",
        rideId: "p4",
        title: "Varanasi Temple and Boat Tour — Ghats by Boat, Old City on Foot",
        description:
            "Combine a private boat ride on the Ganges with a walk to the key temples of Varanasi's old city. Fixed price, local guide-boatman, book online.",
        h1: "Temple + Boat Tour in Varanasi",
        keywords: [
            "varanasi temple tour",
            "varanasi temple and boat tour",
            "kashi vishwanath and boat ride",
            "varanasi half day tour",
            "varanasi old city walk and boat",
        ],
        duration: "About 3 hours",
        iso8601Duration: "PT3H",
        startPoint: "Dashashwamedh Ghat",
        bestFor: ["Short stays", "First-time visitors", "Culture and religion"],
        intro: [
            "Short on time? This tour combines the two essentials of Varanasi: the ghats seen from the river, and the temples of the old city reached through its narrow lanes.",
            "It starts with a boat ride along the riverfront, then continues on foot to the key temples of the old city.",
        ],
        sections: [
            {
                heading: "What's included",
                body: [
                    "A private boat ride past the main ghats, followed by a walk through the old city's lanes to its most important temples. It's an efficient half-day that covers what most first-time visitors want to see.",
                ],
            },
            {
                heading: "Temple etiquette",
                body: [
                    "Dress modestly with shoulders and knees covered. Shoes come off before entering temples. Kashi Vishwanath has strict security — phones, bags and leather items usually aren't allowed inside, so carry as little as possible.",
                ],
            },
        ],
        tips: [
            "Wear shoes that are easy to slip on and off.",
            "Ignore anyone offering paid \"fast-track\" darshan on the street.",
        ],
        faqs: [
            {
                q: "How much is the temple and boat tour?",
                a: "KashiGo's temple + boat tour is {price} for your group, not per person.",
            },
            {
                q: "Can foreigners enter Kashi Vishwanath Temple?",
                a: "Yes, foreign visitors can enter. Expect a security check and restrictions on phones and bags — our full Kashi Vishwanath guide on the blog explains the details.",
            },
        ],
        related: ["p3", "p5", "p1"],
    },
    {
        slug: "private-boat-hire-varanasi",
        rideId: "custom",
        title: "Private Boat Hire in Varanasi — Your Route, Your Time",
        description:
            "Hire a private boat in Varanasi for your own route and time — any start ghat, any destination. Fixed online price, local boatman. Ideal for photographers and groups.",
        h1: "Private Boat Hire in Varanasi",
        keywords: [
            "private boat varanasi",
            "boat hire varanasi",
            "varanasi private boat booking",
            "custom boat ride varanasi",
            "varanasi boat for photography",
        ],
        duration: "You choose",
        iso8601Duration: "PT2H",
        startPoint: "Any ghat you choose",
        bestFor: ["Photographers", "Groups and families", "Special occasions", "Custom routes"],
        intro: [
            "Want a route the fixed rides don't cover — Namo Ghat to Assi, a long photography session, or a special family occasion on the water? Hire your own private boat.",
            "Pick the start ghat, the destination and the time. We'll arrange the boatman.",
        ],
        sections: [
            {
                heading: "Popular custom routes",
                body: [
                    "Full riverfront rides from Assi Ghat to Namo Ghat, slow photography rides at golden hour, and private rides for families with elders or small children who want more space and time.",
                ],
            },
        ],
        tips: [
            "Tell us your route and timing when booking so we can match the right boat.",
            "For ash immersion or other rituals, call us first on the number below.",
        ],
        faqs: [
            {
                q: "How much does it cost to hire a private boat in Varanasi?",
                a: "KashiGo's custom private boat is {custom} at a fixed online price. Call {phone} if you need something longer or unusual.",
            },
            {
                q: "Can I choose my own start ghat?",
                a: "Yes — pick any start ghat, destination and time when you book.",
            },
        ],
        related: ["p1", "p5", "p6"],
    },
];

export const ridePageBySlug = (slug: string) => RIDE_PAGES.find((p) => p.slug === slug);
export const ridePageFor = (id: RidePageId) => RIDE_PAGES.find((p) => p.rideId === id);
export const ridePagePath = (id: RidePageId) => `/boat-rides/${ridePageFor(id)!.slug}`;
