export const listToString = (list: string[], conjunction = '\n') => list.join(conjunction);

export function formatNumber(number: number): string {
	return number.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function formatMs(ms: number) {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	return `${hours} hours, ${minutes % 60} minutes, ${seconds % 60} seconds`;
}