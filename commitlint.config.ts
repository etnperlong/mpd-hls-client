import type { ParserPreset, UserConfig } from "@commitlint/types";
import createPreset from "conventional-changelog-conventionalcommits";
import { merge } from "lodash-es";

const emojiMap: Record<string, { emoji: string }> = {
	feat: { emoji: "✨" },
	fix: { emoji: "🐛" },
	docs: { emoji: "📚" },
	style: { emoji: "🎨" },
	refactor: { emoji: "🔨" },
	perf: { emoji: "📈" },
	test: { emoji: "🧪" },
	build: { emoji: "📦" },
	ci: { emoji: "👷" },
	chore: { emoji: "🔧" },
	revert: { emoji: "⏪" },
};

const allEmojis = Object.values(emojiMap)
	.map((v) => v.emoji.trim())
	.join("|");

async function createEmojiParser(): Promise<ParserPreset> {
	const parserOpts = {
		breakingHeaderPattern: new RegExp(
			`^(?:${allEmojis})\\s+(\\w*)(?:\\((.*)\\))?!:\\s+(.*)$`,
		),
		headerPattern: new RegExp(
			`^(?:${allEmojis})\\s+(\\w*)(?:\\((.*)\\))?!?:\\s+(.*)$`,
		),
	};

	const emojiParser = merge({}, await createPreset(), {
		conventionalChangelog: { parserOpts },
		parserOpts,
		recommendedBumpOpts: { parserOpts },
	});

	return emojiParser;
}

const emojiParser = await createEmojiParser();

export default {
	extends: ["@commitlint/config-conventional"],
	parserPreset: emojiParser,
	rules: {
		"header-max-length": [2, "always", 100],
	},
	prompt: {
		questions: {
			type: {
				enum: emojiMap,
				emojiInHeader: true,
			},
		},
	},
	plugins: [
		{
			rules: {
				"emoji-required": (parsed: { header: string | null }) => {
					const header = parsed.header ?? "";
					const emojiPattern = new RegExp(`^(?:${allEmojis})\\s`);
					const dependabotPattern = /^deps(-dev)?:\s/;
					if (!emojiPattern.test(header) && !dependabotPattern.test(header)) {
						return [
							false,
							"commit message must start with an emoji (e.g. ✨ feat: ...) or use Dependabot format (e.g. deps: ...)",
						];
					}
					return [true];
				},
			},
		},
	],
} satisfies UserConfig;
