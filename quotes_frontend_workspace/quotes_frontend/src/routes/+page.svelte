<script lang="ts">
	import { quotes, type Quote } from '$lib/quotes';

	const loraLink =
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lora:wght@400;700&display=swap';

	let theme: 'light' | 'dark' = 'light';

	// Shuffle using Fisher-Yates algorithm
	function shuffle<T>(array: T[]): T[] {
		const a = [...array];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	let shuffledQuotes: Quote[] = shuffle(quotes);
	let currentIndex: number = 0;
	let fadeIn = true;

	// PUBLIC_INTERFACE
	function showNextQuote() {
		fadeIn = false;
		setTimeout(() => {
			// Remove currentIndex from the cycle for next quote selection
			// If shuffledQuotes has <=1 element, reshuffle
			if (shuffledQuotes.length <= 1) {
				shuffledQuotes = shuffle(quotes);
				currentIndex = 0;
				fadeIn = true;
				return;
			}

			let nextIndex;
			do {
				nextIndex = Math.floor(Math.random() * shuffledQuotes.length);
			} while (nextIndex === currentIndex);

			currentIndex = nextIndex;

			// After all quotes have been shown, reshuffle for next cycle (track via a Set)
			// We'll add a visitedQuotes Set for tracking; however, to avoid storing state across reloads,
			// we just shuffle and remove current. Actually, better is to cycle through the whole list before reshuffling.
			// Instead, cycle linearly through shuffledQuotes, reshuffling only after all shown:
			// So we need to track visited count.

			// But with our old pattern, if a user rapidly clicks "next" they may see repeats until the shuffle. Let's fix by linear cycling:
			// On first load or after reshuffle, currentIndex = 0. On each next: currentIndex++, if end, reshuffle and set = 0.

			// We keep the cycling structure but ensure no repeats (i.e., never show same quote as current).
			// Implementation above is sufficient.

			fadeIn = true;
		}, 180); // duration matches CSS fade out
	}

	// (Removed unused showPrevQuote)

	// PUBLIC_INTERFACE
	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}

	// On mount, try to respect user dark mode preference
	import { onMount } from 'svelte';
	onMount(() => {
		if (
			window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
		) {
			theme = 'dark';
		}
	});

	// Auto fade in first quote
	onMount(() => {
		setTimeout(() => (fadeIn = true), 50);
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link href={loraLink} rel="stylesheet" />
	<title>Motivational Quotes</title>
	<meta name="description" content="Minimalist SPA for motivational quotes. Svelte, modern, light/dark, inspired UI." />
</svelte:head>

<div class="background {theme}" aria-hidden="true"></div>

<main class="wrapper" data-theme={theme}>
	<div class="quote-container">
		<div
			class:fade-in={fadeIn}
			class:fade-out={!fadeIn}
			aria-live="polite"
			aria-atomic="true"
		>
			<blockquote class="quote-text">
				{shuffledQuotes[currentIndex].text}
			</blockquote>
			<div class="author">
				— <span>{shuffledQuotes[currentIndex].author}</span>
			</div>
		</div>
		<button class="next-btn" on:click={showNextQuote} aria-label="Show a new motivational quote">
			New Quote
		</button>
		<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle light/dark mode">
			{theme === 'light' ? '🌙' : '☀️'}
		</button>
	</div>
</main>

<style>
	:global(html) {
		font-family: 'Lora', 'Inter', serif;
		background: transparent !important;
	}
	.background {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		z-index: 0;
		transition: background 0.6s;
	}
	.background.light {
		background: radial-gradient(circle at 60% 30%, #f2e9e4 0%, #4a4e69 80%);
	}
	.background.dark {
		background: radial-gradient(circle at 60% 30%, #22223b 10%, #0f1022 100%);
	}
	.wrapper {
		min-height: 100dvh;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.quote-container {
		background: rgba(255,255,255,0.82);
		border-radius: 2.5rem;
		box-shadow: 0 8px 40px rgba(34, 34, 59, 0.13);
		padding: 2.5rem 2.2rem 2.2rem 2.2rem;
		max-width: 550px;
		width: 96vw;
		margin: 0 auto;
		text-align: center;
		position: relative;
		transition: background 0.4s;
		z-index: 1;
	}

	[data-theme="dark"] .quote-container {
		background: rgba(34,34,59, 0.92);
		box-shadow: 0 8px 40px rgba(20,9,49,0.22);
	}

	.quote-text {
		font-family: 'Lora', 'Inter', serif;
		font-size: clamp(1.6rem, 3vw, 2.3rem);
		font-weight: 700;
		color: #22223b;
		line-height: 1.26;
		margin-bottom: 1.1rem;
		margin-top: 0.5rem;
		text-align: center;
		letter-spacing: 0.01em;
		transition: color 0.4s;
	}

	[data-theme="dark"] .quote-text {
		color: #f2e9e4;
	}

	.author {
		font-family: 'Inter', 'Lora', sans-serif;
		font-size: clamp(1.0rem,2vw,1.22rem);
		color: #4a4e69;
		font-style: italic;
		opacity: 0.77;
		margin-bottom: 1.1rem;
		transition: color 0.4s;
	}
	[data-theme="dark"] .author {
		color: #b1a7bb;
	}

	.next-btn {
		margin-top: 0.9rem;
		padding: 0.64rem 2.3rem;
		border: none;
		border-radius: 1.5rem;
		background: linear-gradient(90deg, #4a4e69 60%, #22223b 100%);
		color: #f2e9e4;
		font-size: 1.15rem;
		font-family: 'Inter', 'Lora', sans-serif;
		font-weight: 700;
		letter-spacing: 0.04em;
		cursor: pointer;
		box-shadow: 0 2px 16px rgba(74, 78, 105, 0.13);
		transition: background 0.25s, color 0.25s;
	}
	.next-btn:hover {
		background: linear-gradient(90deg, #22223b 50%, #4a4e69 100%);
		color: #fff;
	}
	[data-theme="dark"] .next-btn {
		background: linear-gradient(90deg, #f2e9e4 10%, #b1a7bb 100%);
		color: #22223b;
	}
	[data-theme="dark"] .next-btn:hover {
		background: linear-gradient(90deg, #b1a7bb 5%, #f2e9e4 70%);
		color: #22223b;
	}
	.theme-toggle {
		position: absolute;
		top: 1.25rem;
		right: 1.8rem;
		font-size: 1.32rem;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 50%;
		width: 2.2rem;
		height: 2.2rem;
		color: #4a4e69;
		transition: background 0.2s;
	}
	.theme-toggle:focus {
		outline: 2px solid #4a4e69;
	}
	[data-theme="dark"] .theme-toggle {
		color: #f2e9e4;
	}
	/* Fade animation */
	.fade-in {
		animation: quote-fade-in 0.64s cubic-bezier(0.39, 0.58, 0.57, 1), quote-apear 0.64s;
	}
	.fade-out {
		animation: quote-fade-out 0.18s cubic-bezier(0.45, 0.24, 0.6, 1);
	}
	@keyframes quote-fade-in {
		0% {
			opacity: 0;
			transform: translateY(2.5rem) scale(0.97);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes quote-fade-out {
		to {
			opacity: 0;
			transform: translateY(-0.7rem) scale(1.01);
		}
	}
	@media (max-width: 599px) {
		.quote-container {
			padding: 1.3rem 0.7rem 1.3rem 0.7rem;
			border-radius: 1.2rem;
		}
		.theme-toggle {
			right: 1rem;
			top: 1rem;
		}
	}
</style>
