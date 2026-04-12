"use client";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { createSpring } from "spring-animator";

interface Dot {
	cx: number;
	cy: number;
	spring: ReturnType<typeof createSpring>;
	pushTime: number;
}

export interface DotGridProps {
	dotSize?: number;
	gap?: number;
	baseColor?: string;
	activeColor?: string;
	proximity?: number;
	speedTrigger?: number;
	shockRadius?: number;
	shockStrength?: number;
	maxSpeed?: number;
	/** Spring stiffness — lower is softer (default 0.003) */
	stiffness?: number;
	/** Spring dampening — higher settles faster (default 0.08) */
	dampening?: number;
	className?: string;
	style?: React.CSSProperties;
}

function hexToRgb(hex: string) {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!m) return { r: 0, g: 0, b: 0 };
	return {
		r: Number.parseInt(m[1], 16),
		g: Number.parseInt(m[2], 16),
		b: Number.parseInt(m[3], 16),
	};
}

export const DotGrid: React.FC<DotGridProps> = ({
	dotSize = 16,
	gap = 32,
	baseColor = "#5227FF",
	activeColor = "#5227FF",
	proximity = 150,
	speedTrigger = 100,
	shockRadius = 250,
	shockStrength = 5,
	maxSpeed = 5000,
	stiffness = 0.003,
	dampening = 0.08,
	className = "",
	style,
}) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const dotsRef = useRef<Dot[]>([]);
	const pointerRef = useRef({
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		speed: 0,
		lastTime: 0,
		lastX: 0,
		lastY: 0,
	});

	const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
	const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

	const circlePath = useMemo(() => {
		if (globalThis.window === undefined || !globalThis.Path2D) return null;
		const p = new Path2D();
		p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
		return p;
	}, [dotSize]);

	const buildGrid = useCallback(() => {
		const wrap = wrapperRef.current;
		const canvas = canvasRef.current;
		if (!wrap || !canvas) return;

		const { width, height } = wrap.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;

		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		const ctx = canvas.getContext("2d");
		if (ctx) ctx.scale(dpr, dpr);

		const cols = Math.floor((width + gap) / (dotSize + gap));
		const rows = Math.floor((height + gap) / (dotSize + gap));
		const cell = dotSize + gap;
		const gridW = cell * cols - gap;
		const gridH = cell * rows - gap;
		const startX = (width - gridW) / 2 + dotSize / 2;
		const startY = (height - gridH) / 2 + dotSize / 2;

		const dots: Dot[] = [];
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				dots.push({
					cx: startX + x * cell,
					cy: startY + y * cell,
					spring: createSpring(stiffness, dampening, [0, 0]),
					pushTime: 0,
				});
			}
		}
		dotsRef.current = dots;
	}, [dotSize, gap, stiffness, dampening]);

	// Single rAF loop: tick all springs + draw
	useEffect(() => {
		if (!circlePath) return;
		let rafId: number;
		const proxSq = proximity * proximity;

		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: canvas animation loop with physics
		const draw = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const now = performance.now();
			const { x: px, y: py } = pointerRef.current;
			for (const dot of dotsRef.current) {
				// After the outward phase, redirect spring back to origin
				if (dot.pushTime > 0 && now - dot.pushTime > 400) {
					dot.spring.setDestination([0, 0]);
					dot.pushTime = 0;
				}
				// Gentle spring outward, soft slow spring for return
				if (dot.pushTime > 0) {
					dot.spring.tick(0.004, 0.12);
				} else {
					dot.spring.tick(stiffness, dampening);
				}
				const offset = dot.spring.getCurrentValue([0, 0]) as number[];
				const ox = dot.cx + offset[0];
				const oy = dot.cy + offset[1];

				const dx = dot.cx - px;
				const dy = dot.cy - py;
				const dsq = dx * dx + dy * dy;

				let fillStyle = baseColor;
				if (dsq <= proxSq) {
					const t = 1 - Math.sqrt(dsq) / proximity;
					const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
					const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
					const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
					fillStyle = `rgb(${r},${g},${b})`;
				}

				ctx.save();
				ctx.translate(ox, oy);
				ctx.fillStyle = fillStyle;
				ctx.fill(circlePath);
				ctx.restore();
			}
			rafId = requestAnimationFrame(draw);
		};

		draw();
		return () => cancelAnimationFrame(rafId);
	}, [proximity, baseColor, activeRgb, baseRgb, circlePath, stiffness, dampening]);

	useEffect(() => {
		buildGrid();
		const ro = new ResizeObserver(buildGrid);
		if (wrapperRef.current) ro.observe(wrapperRef.current);
		return () => ro.disconnect();
	}, [buildGrid]);

	// Push a dot: animate outward, then the rAF loop redirects back to origin
	const pushDot = useCallback((dot: Dot, pushX: number, pushY: number) => {
		dot.spring.setDestination([pushX, pushY]);
		dot.pushTime = performance.now();
	}, []);

	useEffect(() => {
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: mouse interaction with shock wave physics
		const onMove = (e: MouseEvent) => {
			const now = performance.now();
			const pr = pointerRef.current;
			const dt = pr.lastTime ? now - pr.lastTime : 16;
			let vx = ((e.clientX - pr.lastX) / dt) * 1000;
			let vy = ((e.clientY - pr.lastY) / dt) * 1000;
			let speed = Math.hypot(vx, vy);
			if (speed > maxSpeed) {
				const scale = maxSpeed / speed;
				vx *= scale;
				vy *= scale;
				speed = maxSpeed;
			}
			pr.lastTime = now;
			pr.lastX = e.clientX;
			pr.lastY = e.clientY;
			pr.vx = vx;
			pr.vy = vy;
			pr.speed = speed;

			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;
			pr.x = e.clientX - rect.left;
			pr.y = e.clientY - rect.top;

			for (const dot of dotsRef.current) {
				const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
				if (speed > speedTrigger && dist < proximity) {
					const pushX = (dot.cx - pr.x + vx * 0.005) * 0.3;
					const pushY = (dot.cy - pr.y + vy * 0.005) * 0.3;
					pushDot(dot, pushX, pushY);
				}
			}
		};

		const onClick = (e: MouseEvent) => {
			const rect = canvasRef.current?.getBoundingClientRect();
			if (!rect) return;
			const cx = e.clientX - rect.left;
			const cy = e.clientY - rect.top;
			for (const dot of dotsRef.current) {
				const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
				if (dist < shockRadius) {
					const falloff = Math.max(0, 1 - dist / shockRadius);
					// Base direction away from click + random scatter angle
					const angle = Math.atan2(dot.cy - cy, dot.cx - cx) + (Math.random() - 0.5) * 1.8;
					const magnitude = shockStrength * falloff * (0.6 + Math.random() * 0.8);
					const pushX = Math.cos(angle) * magnitude * 15;
					const pushY = Math.sin(angle) * magnitude * 15;
					pushDot(dot, pushX, pushY);
				}
			}
		};

		const throttledMove = (() => {
			let lastCall = 0;
			return (e: MouseEvent) => {
				const now = performance.now();
				if (now - lastCall >= 50) {
					lastCall = now;
					onMove(e);
				}
			};
		})();

		globalThis.addEventListener("mousemove", throttledMove, { passive: true });
		globalThis.addEventListener("click", onClick);
		return () => {
			globalThis.removeEventListener("mousemove", throttledMove);
			globalThis.removeEventListener("click", onClick);
		};
	}, [maxSpeed, speedTrigger, proximity, shockRadius, shockStrength, pushDot]);

	return (
		<section
			className={`flex items-center justify-center h-full w-full relative ${className}`}
			style={style}
		>
			<div ref={wrapperRef} className="w-full h-full relative">
				<canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
			</div>
		</section>
	);
};
