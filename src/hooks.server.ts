import { BUXFER_EMAIL as email, BUXFER_PASS as password } from '$env/static/private';
import Buxfer from './Buxfer';

export const handleFetch = Buxfer(email, password);