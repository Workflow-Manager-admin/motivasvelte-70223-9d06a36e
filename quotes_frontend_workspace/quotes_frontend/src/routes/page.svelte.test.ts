import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('renders a quote and author', () => {
		render(Page);
		const blockquote = screen.getByText((content) => !!content && content.length > 10);
		const author = screen.getByText((content) => content.startsWith('— '));
		expect(blockquote).toBeInTheDocument();
		expect(author).toBeInTheDocument();
	});
});
