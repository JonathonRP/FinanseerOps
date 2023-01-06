import { BUXFER_EMAIL as email, BUXFER_PASS as password } from '$env/static/private';
import Buxfer from '$lib/Buxfer';

export const handleFetch = Buxfer(email, password);