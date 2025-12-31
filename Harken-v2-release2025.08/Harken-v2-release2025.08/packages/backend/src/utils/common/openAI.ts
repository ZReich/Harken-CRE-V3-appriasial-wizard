import { OPENAI_API_KEY, GPT_MODEL } from '../../env';
import axios from 'axios';

export class OpenAIService {
	constructor() {}

	/**
	 * Generate chat completion using GPT model
	 */
	async generateChatCompletion(prompt: string) {
		try {
			const completion = await axios.post(
				'https://api.openai.com/v1/chat/completions',
				{
					model: GPT_MODEL,
					messages: [
						{
							role: 'system',
							content:
								'You are an AI that strictly provides JSON responses based only on the given prompt.',
						},
						{ role: 'user', content: prompt },
					],
					temperature: 0, // Low for accurate outputs
				},
				{
					headers: {
						Authorization: `Bearer ${OPENAI_API_KEY}`,
						'Content-Type': 'application/json',
					},
				},
			);

			let extractedData = [];
			const rawContent = completion.data.choices[0]?.message?.content?.trim();

			if (rawContent) {
				try {
					// Remove Markdown-style JSON code block markers
					const cleanJson = rawContent.replace(/^```json|```$/g, '').trim();

					// Attempt to parse as JSON
					extractedData = JSON.parse(cleanJson);
				} catch (error) {
					console.error('Failed to parse OpenAI response as JSON:', rawContent);
					extractedData = []; // Handle fallback logic
				}
			}
			return extractedData;
		} catch (error) {
			console.error('Error generating chat completion:', error);
			throw error;
		}
	}
}
