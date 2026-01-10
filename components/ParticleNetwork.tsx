"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useTheme } from "next-themes";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    originX: number;
    originY: number;
    size: number;
    brightness: number;
    angle: number; // For ring orbit
    phase: number; // For gentle floating
    floatSpeed: number; // Individual float speed
}

export interface ParticleNetworkRef {
    setRingTarget: (x: number, y: number, radius: number) => void;
    clearRingTarget: () => void;
}

const PARTICLE_COUNT = 100;
const CONNECTION_DISTANCE = 150;
const MOUSE_RADIUS = 180;
const DRIFT_SPEED = 0.3;

// Theme-aware colors
const COLORS = {
    dark: {
        particle: "200, 230, 255",      // Light blue
        connection: "180, 220, 255",    // Light blue
        glow: "100, 180, 255",          // Blue glow
    },
    light: {
        particle: "30, 50, 80",         // Much darker blue-gray
        connection: "40, 60, 100",      // Darker blue
        glow: "30, 70, 140",            // Darker blue glow
    },
};

export const ParticleNetwork = forwardRef<ParticleNetworkRef, {}>(function ParticleNetwork(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const ringTargetRef = useRef<{ x: number; y: number; radius: number } | null>(null);
    const animationFrameRef = useRef<number>(0);
    const { resolvedTheme } = useTheme();
    const themeRef = useRef<"light" | "dark">("dark");

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            particles.push({
                x,
                y,
                originX: x,
                originY: y,
                vx: (Math.random() - 0.5) * DRIFT_SPEED,
                vy: (Math.random() - 0.5) * DRIFT_SPEED,
                size: Math.random() * 2 + 1,
                brightness: 0.3,
                angle: Math.random() * Math.PI * 2,
                phase: Math.random() * Math.PI * 2, // Random starting phase
                floatSpeed: 0.003 + Math.random() * 0.004, // 0.003-0.007
            });
        }
        particlesRef.current = particles;
    }, []);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        setRingTarget: (x: number, y: number, radius: number) => {
            ringTargetRef.current = { x, y, radius };
        },
        clearRingTarget: () => {
            ringTargetRef.current = null;
        },
    }));

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (particlesRef.current.length === 0) {
                initParticles(canvas.width, canvas.height);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            // Update theme ref
            themeRef.current = resolvedTheme === "light" ? "light" : "dark";
            const colors = COLORS[themeRef.current];

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;
            const ringTarget = ringTargetRef.current;

            // Update particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse proximity brightness
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const targetBrightness = dist < MOUSE_RADIUS ? 0.7 + (1 - dist / MOUSE_RADIUS) * 0.5 : 0.25;
                p.brightness += (targetBrightness - p.brightness) * 0.08;

                if (ringTarget) {
                    // Smooth transition to ring formation
                    // Slower angle rotation for calmer orbit
                    p.angle += 0.003 + (i % 5) * 0.001;

                    const targetX = ringTarget.x + Math.cos(p.angle + (i * Math.PI * 2) / particles.length) * ringTarget.radius;
                    const targetY = ringTarget.y + Math.sin(p.angle + (i * Math.PI * 2) / particles.length) * ringTarget.radius;

                    const toTargetX = targetX - p.x;
                    const toTargetY = targetY - p.y;
                    const distToRing = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);

                    // Distance-based easing: slower when far, faster when close
                    const easeFactor = Math.min(0.015, 0.005 + distToRing * 0.00002);

                    p.vx += toTargetX * easeFactor;
                    p.vy += toTargetY * easeFactor;
                    // High damping for smooth, floaty movement
                    p.vx *= 0.94;
                    p.vy *= 0.94;

                    // Gentle brightness increase
                    p.brightness += (0.8 - p.brightness) * 0.03;
                } else {
                    // Gentle floating motion - always moving softly
                    p.phase += p.floatSpeed;

                    // Float target = origin + gentle sine wave offset
                    const floatRadius = 15; // How far particles float from origin
                    const floatTargetX = p.originX + Math.sin(p.phase) * floatRadius;
                    const floatTargetY = p.originY + Math.cos(p.phase * 0.7) * floatRadius;

                    const toFloatX = floatTargetX - p.x;
                    const toFloatY = floatTargetY - p.y;

                    // Very gentle movement toward float target
                    p.vx += toFloatX * 0.003;
                    p.vy += toFloatY * 0.003;
                    // Smooth damping
                    p.vx *= 0.95;
                    p.vy *= 0.95;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Soft bounds
                if (p.x < -50) p.x = canvas.width + 50;
                if (p.x > canvas.width + 50) p.x = -50;
                if (p.y < -50) p.y = canvas.height + 50;
                if (p.y > canvas.height + 50) p.y = -50;
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.25 * Math.max(p1.brightness, p2.brightness);
                        ctx.strokeStyle = `rgba(${colors.connection}, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            for (const p of particles) {
                ctx.fillStyle = `rgba(${colors.particle}, ${p.brightness})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Glow effect for bright particles
                if (p.brightness > 0.5) {
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
                    gradient.addColorStop(0, `rgba(${colors.glow}, ${(p.brightness - 0.5) * 0.4})`);
                    gradient.addColorStop(1, `rgba(${colors.glow}, 0)`);
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [initParticles]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
});
