import * as crypto from 'node:crypto';

const algorithm = {
	/**
	 * GCM is an authenticated encryption mode that
	 * not only provides confidentiality but also
	 * provides integrity in a secured way
	 */
	blockCipher: 'aes-256-gcm',
	/**
	 * 128 bit auth tag is recommended for GCM
	 */
	authTagByteLeng: 16,
	/**
	 * NIST recommends 96 bits or 12 bytes IV for GCM
	 * to promote interoperability, efficiency, and
	 * simplicity of design
	 */
	ivByteLeng: 12,
	/**
	 * Note: 256 (in algorithm name) is key size.
	 * Block size for AES is always 128
	 */
	keyByteLeng: 32,
	/**
	 * To prevent rainbow table attacks
	 * */
	saltByteLeng: 16,
} as const;
const salt = crypto.randomBytes(algorithm.saltByteLeng);

const encrypt = (text: string) => {
	const key = crypto.randomBytes(algorithm.keyByteLeng);
	const iv = crypto.randomBytes(algorithm.ivByteLeng);
	const cipher = crypto.createCipheriv(algorithm.blockCipher, key, iv);
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
	return Buffer.concat([key, iv, encrypted, cipher.getAuthTag()]).toString('hex');
};

const decrypt = (text: string) => {
	const data = Buffer.from(text, 'hex');
	const key = data.subarray(0, algorithm.keyByteLeng);
	const iv = data.subarray(algorithm.keyByteLeng, algorithm.keyByteLeng + algorithm.ivByteLeng);
	const encryptedText = data.subarray(algorithm.keyByteLeng + algorithm.ivByteLeng, -algorithm.authTagByteLeng);
	const authTag = data.subarray(-algorithm.authTagByteLeng);
	const decipher = crypto.createDecipheriv(algorithm.blockCipher, key, iv);
	decipher.setAuthTag(authTag);
	const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
	return decrypted.toString('utf-8');
};

export { encrypt, decrypt };
