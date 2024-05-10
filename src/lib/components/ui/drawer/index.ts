import { Drawer as DrawerPrimitive } from 'vaul-svelte';

import Root from './drawer.svelte';
import Content from './drawer-content.svelte';
import Description from './drawer-description.svelte';
import Overlay from './drawer-overlay.svelte';
import Footer from './drawer-footer.svelte';
import Header from './drawer-header.svelte';
import Title from './drawer-title.svelte';
import NestedRoot from './drawer-nested.svelte';

const { Trigger } = DrawerPrimitive;
const { Portal } = DrawerPrimitive;
const { Close } = DrawerPrimitive;

export const Drawer = {
	Root,
	NestedRoot,
	Content,
	Description,
	Overlay,
	Footer,
	Header,
	Title,
	Trigger,
	Portal,
	Close,
};
