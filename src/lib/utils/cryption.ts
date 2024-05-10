const algorithm = {
	/**
	 * GCM is an authenticated encryption mode that
	 * not only provides confidentiality but also
	 * provides integrity in a secured way
	 */
	blockCipher: 'aes-gcm',
	blockCipherLeng: 256,
	/**
	 * 128 bit auth tag is recommended for GCM
	 */
	authTagByteLeng: 128,
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

const encrypt = async (text: string) => {
	const key = crypto.getRandomValues(new Uint8Array(algorithm.keyByteLeng));
	const iv = crypto.getRandomValues(new Uint8Array(algorithm.ivByteLeng));
	const encrypted = await crypto.subtle.encrypt(
		{ name: algorithm.blockCipher, iv },
		await crypto.subtle.importKey(
			'raw',
			key,
			{ name: algorithm.blockCipher, length: algorithm.blockCipherLeng },
			false,
			['encrypt']
		),
		new TextEncoder().encode(text)
	);
	return Buffer.concat([key, iv, new Uint8Array(encrypted)]).toString('hex');
};

const decrypt = async (text: string) => {
	const data = Buffer.from(text, 'hex');
	const key = data.subarray(0, algorithm.keyByteLeng);
	const iv = data.subarray(algorithm.keyByteLeng, algorithm.keyByteLeng + algorithm.ivByteLeng);
	const encryptedText = data.subarray(algorithm.keyByteLeng + algorithm.ivByteLeng);

	return new TextDecoder().decode(
		await crypto.subtle.decrypt(
			{ name: algorithm.blockCipher, iv },
			await crypto.subtle.importKey(
				'raw',
				key,
				{ name: algorithm.blockCipher, length: algorithm.blockCipherLeng },
				false,
				['decrypt']
			),
			encryptedText
		)
	);
};

export { encrypt, decrypt };
