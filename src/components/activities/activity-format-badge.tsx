import { Badge } from "@/components/ui/badge";

interface ActivityFormatBadgeProps {
	name: string;
	color: string;
	className?: string;
}

/** Renders a badge with dynamic color from the activity_formats table */
export function ActivityFormatBadge({ name, color, className }: ActivityFormatBadgeProps) {
	return (
		<Badge hex={color} className={className}>
			{name}
		</Badge>
	);
}
