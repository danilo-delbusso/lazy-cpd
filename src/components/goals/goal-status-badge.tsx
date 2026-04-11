import { Badge } from "@/components/ui/badge";
import { goalStatusColors, goalStatusLabels } from "@/lib/utils/format-labels";
import type { GoalStatus } from "@/lib/validations/goal";

interface GoalStatusBadgeProps {
	status: GoalStatus;
	className?: string;
}

export function GoalStatusBadge({ status, className }: Readonly<GoalStatusBadgeProps>) {
	return (
		<Badge colorClasses={goalStatusColors[status]} className={className}>
			{goalStatusLabels[status]}
		</Badge>
	);
}
