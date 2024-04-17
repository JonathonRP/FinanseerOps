import { default as Root } from './score.svelte';
import Header from './score-header.svelte';
import Content from './score-content.svelte';
import Label from './score-label.svelte';
import Metric from './score-metric.svelte';

export type { DefaultPropsType } from '$/lib/components';

export const Score = {
	Root,
	Header,
	Content,
	Label,
	Metric,
};
