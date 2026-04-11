"use client";

import { CountUp } from "@/components/effects/count-up";
import { cn } from "@/lib/utils/cn";

export function StatChip({ label, value, cls }: { label: string; value: number; cls: string }) {
	return (
		<div className={cn("rounded-lg px-3 py-2 text-center", cls)}>
			<p className="text-lg font-bold">
				<CountUp to={value} from={0} duration={1.2} />
			</p>
			<p className="text-xs opacity-70">{label}</p>
		</div>
	);
}
