declare module "spring-animator" {
	interface Spring {
		setDestination(dest: number[]): void;
		tick(stiffness: number, damping: number): void;
		getCurrentValue(defaultValue?: number[]): number | number[];
	}

	export function createSpring(stiffness: number, damping: number, initialValue?: number[]): Spring;
}
