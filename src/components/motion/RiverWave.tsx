// Layered, drifting river waves used as a section edge. `fill` is the colour of the section below.
export default function RiverWave({ fill = "#070b18", className = "", flip = false }: { fill?: string; className?: string; flip?: boolean }) {
    const path = (amp: number, y: number) => {
        // Two identical periods side by side (0–1440, 1440–2880) so a -50% translate loops seamlessly.
        let d = `M0 ${y}`;
        for (let x = 0; x < 2880; x += 360) d += ` q90 ${-amp} 180 0 t180 0`;
        return `${d} V120 H0 Z`;
    };
    return (
        <div aria-hidden className={`pointer-events-none h-16 md:h-24 w-full overflow-hidden ${flip ? "rotate-180" : ""} ${className}`}>
            <svg className="wave-drift-slow absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 2880 120" preserveAspectRatio="none">
                <path d={path(14, 52)} fill={fill} opacity="0.35" />
            </svg>
            <svg className="wave-drift absolute bottom-0 left-0 h-full w-[200%] [animation-direction:reverse]" viewBox="0 0 2880 120" preserveAspectRatio="none">
                <path d={path(10, 70)} fill={fill} opacity="0.6" />
            </svg>
            <svg className="wave-drift-slow absolute bottom-0 left-0 h-full w-[200%]" viewBox="0 0 2880 120" preserveAspectRatio="none">
                <path d={path(8, 88)} fill={fill} />
            </svg>
        </div>
    );
}
