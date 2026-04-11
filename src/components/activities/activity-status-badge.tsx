import { Badge } from "@/components/ui/badge";
import { activityStatusColors, activityStatusLabels } from "@/lib/utils/format-labels";
import type { ActivityStatusValue } from "@/lib/validations/activity";

interface ActivityStatusBadgeProps {
	status: ActivityStatusValue;
	className?: string;
}

export function ActivityStatusBadge({ status, className }: Readonly<ActivityStatusBadgeProps>) {
	return (
		<Badge colorClasses={activityStatusColors[status]} className={className}>
			{activityStatusLabels[status]}
		</Badge>
	);
}
