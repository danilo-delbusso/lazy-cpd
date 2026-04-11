import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	hover?: boolean;
}

export function Card({ className, hover = false, children, ...props }: Readonly<CardProps>) {
	return (
		<div
			className={cn(
				"rounded-xl border border-slate-200 bg-white shadow-sm",
				hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function CardHeader({
	className,
	children,
	...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
	return (
		<div className={cn("border-b border-slate-100 px-6 py-4", className)} {...props}>
			{children}
		</div>
	);
}

export function CardBody({
	className,
	children,
	...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
	return (
		<div className={cn("px-6 py-4", className)} {...props}>
			{children}
		</div>
	);
}

export function CardFooter({
	className,
	children,
	...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
	return (
		<div className={cn("border-t border-slate-100 px-6 py-4", className)} {...props}>
			{children}
		</div>
	);
}
