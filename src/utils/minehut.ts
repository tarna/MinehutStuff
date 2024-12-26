import type { MinehutRank } from 'minehut/dist/player/CosmeticResponse';

export function ansiRank(rank: MinehutRank, name: string) {
	switch (rank) {
		case 'VIP':
		case 'VIP_PLUS':
			return `[2;32m${rank}[0m ${name}`;
		case 'PRO':
			return `[2;36m${rank}[0m ${name}`;
		case 'LEGEND':
			return `[2;33m${rank}[0m ${name}`;
		case 'PATRON':
			return `[2;35m${rank}[0m ${name}`;
		case 'YOUTUBE':
		case 'ARTIST':
			return `[2;35m${rank}[0m ${name}`;
		case 'EVENTS':
			return `[2;33m${rank}[0m ${name}`;
		case 'HELPER':
		case 'SUPER_HELPER':
			return `[2;34mHELPER[0m ${name}`;
		case 'ADMIN':
			return `[2;31m${rank}[0m ${name}`;
		default:
			return `[2;37m${rank}[0m ${name}`;
	}
}

export function cleanMOTD(motd: string): string {
	return motd
		.replace(/```/g, '') // Clean off code blocks
		.replace(/\n /g, '\n') // Fix newline spacing
		.replace(/^\s+/g, '') // Get rid of leading whitespace
		.replace(/[§&][0-9a-frmno]/g, '')
		.replace(
			/<\/?(black|dark_blue|dark_green|dark_aqua|dark_red|dark_purple|gold|gray|dark_gray|blue|green|aqua|red|light_purple|yellow|white|rainbow)>/gi,
			''
		) // Remove all color tags
		.replace(/<\/?((?:color:)?#[0-9A-F]{6})>/gi, '') // Remove all hex color tags
		.replace(/<\/?((?:gradient|transition)(?::#?[a-z0-9]+)+)>/gi, '') // Remove all gradient tags
		.replace(
			/<\/?(bold|b|italic|em|i|underlined|u|strikethrough|st|obfuscated|obf|reset|color|transition|rainbow|newline)>/gi,
			''
		); // Remove all other tags
}