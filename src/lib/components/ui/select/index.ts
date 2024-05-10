import { Select as SelectPrimitive } from 'bits-ui';

import Label from './select-label.svelte';
import Item from './select-item.svelte';
import Content from './select-content.svelte';
import Trigger from './select-trigger.svelte';
import Separator from './select-separator.svelte';

const { Root } = SelectPrimitive;
const { Group } = SelectPrimitive;
const { Input } = SelectPrimitive;
const { Value } = SelectPrimitive;

export const Select = {
	Root,
	Item,
	Group,
	Input,
	Label,
	Value,
	Content,
	Trigger,
	Separator,
};
