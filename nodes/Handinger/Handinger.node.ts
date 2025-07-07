import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

export class Handinger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Handinger',
		name: 'handinger',
		icon: 'file:Handinger.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["action"]}}',
		description: 'Scrape data from the internet using the Handinger API',
		defaults: {
			name: 'Handinger',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'HandingerApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'LLM',
						value: 'llm',
						description: 'Fetch the content from the internet and use the LLM to process it',
						action: 'Fetch the content from the internet and use the LLM to process it',
					},
					{
						name: 'Content',
						value: 'content',
						description: 'Fetch the content from the internet',
						action: 'Fetch the content from the internet',
					},
					{
						name: 'Metadata',
						value: 'metadata',
						description: 'Fetch the metadata from the internet',
						action: 'Fetch the metadata from the internet',
					},
					{
						name: 'Screenshot',
						value: 'screenshot',
						description: 'Take a screenshot of the website',
						action: 'Take a screenshot of the website',
					},
				],
				default: 'llm',
			},
			// Everybody
			{
				displayName: 'Website URL',
				description: 'The URL of the website to fetch content from',
				required: true,
				name: 'url',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Fresh',
				name: 'fresh',
				type: 'boolean',
				default: false,
			},
			// LLM options
			{
				displayName: 'Prompt',
				description: 'The prompt to use for the LLM',
				required: true,
				name: 'prompt',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['llm'] } },
			},
			{
				displayName: 'JSON Schema',
				description: 'The JSON schema to use for the LLM',
				required: true,
				name: 'jsonSchema',
				type: 'string',
				default: '',
				displayOptions: { show: { action: ['llm'] } },
			},
			// Content options
			{
				displayName: 'Content Type',
				name: 'contentType',
				type: 'options',
				options: [
					{
						name: 'Markdown',
						value: 'markdown',
						description: 'Return the content as Markdown, a plain text format',
					},
					{
						name: 'HTML',
						value: 'html',
						description:
							'Return the content as HTML, a rich text format that can be rendered in a browser or an email',
					},
				],
				default: 'markdown',
				displayOptions: { show: { action: ['content'] } },
			},
			{
				displayName: 'Link Style',
				name: 'linkStyle',
				type: 'options',
				options: [
					{
						name: 'Inline',
						value: 'inline',
						description: 'Links embedded directly within the text',
					},
					{
						name: 'Citations',
						value: 'citations',
						description: 'Links listed at the end, referenced by numbers in the text',
					},
					{
						name: 'None',
						value: 'none',
						description: 'Remove links from the content',
					},
				],
				default: 'inline',
				displayOptions: { show: { action: ['content'] } },
			},
			{
				displayName: 'Clean Content',
				name: 'cleanContent',
				type: 'boolean',
				default: true,
				displayOptions: { show: { action: ['content'] } },
			},
			{
				displayName: 'Inline Images',
				name: 'inline_images',
				type: 'boolean',
				default: false,
				displayOptions: { show: { action: ['content'] } },
			},
			{
				displayName: 'Advanced Scraping',
				name: 'advanced_scraping',
				type: 'boolean',
				default: true,
				displayOptions: { show: { action: ['content', 'metadata'] } },
			},
			// Screenshot options
			{
				displayName: 'Image Type',
				name: 'imageType',
				type: 'options',
				options: [
					{
						name: 'PNG',
						value: 'png',
						description: 'Return the screenshot as a PNG image',
					},
					{
						name: 'JPEG',
						value: 'jpeg',
						description: 'Return the screenshot as a JPEG image',
					},
				],
				default: 'png',
				displayOptions: { show: { action: ['screenshot'] } },
			},
			{
				displayName: 'Viewport Width',
				name: 'viewportWidth',
				type: 'number',
				default: 1280,
				displayOptions: { show: { action: ['screenshot'] } },
			},
			{
				displayName: 'Viewport Height',
				name: 'viewportHeight',
				type: 'number',
				default: 1024,
				displayOptions: { show: { action: ['screenshot'] } },
			},
			{
				displayName: 'Timeout',
				name: 'timeout',
				type: 'number',
				default: 30_000,
				displayOptions: { show: { action: ['screenshot'] } },
			},
			{
				displayName: 'Delay',
				name: 'delay',
				type: 'number',
				default: 500,
				displayOptions: { show: { action: ['screenshot'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const action = this.getNodeParameter('action', i);
				const url = this.getNodeParameter('url', i);
				const fresh = this.getNodeParameter('fresh', i);

				const qs: Record<string, any> = { url, fresh };

				let endpoint = '';
				let responseFormat: 'json' | 'text' = 'json';

				switch (action) {
					case 'llm':
						endpoint = '/llm';
						qs.prompt = this.getNodeParameter('prompt', i);
						qs.json_schema = this.getNodeParameter('jsonSchema', i);
						break;

					case 'content':
						const contentType = this.getNodeParameter('contentType', i);

						qs.link_style = this.getNodeParameter('linkStyle', i);
						qs.clean_content = this.getNodeParameter('cleanContent', i);
						qs.inline_images = this.getNodeParameter('inline_images', i);
						qs.advanced_scraping = this.getNodeParameter('advanced_scraping', i);
						responseFormat = 'text';

						endpoint =
							contentType === 'markdown' ? '/markdown' : contentType === 'html' ? '/html' : '';
						break;

					case 'metadata':
						endpoint = '/meta';
						qs.advanced_scraping = this.getNodeParameter('advanced_scraping', i);
						break;

					case 'screenshot':
						endpoint = '/image';

						qs.image_type = this.getNodeParameter('imageType', i);
						qs.viewport_width = this.getNodeParameter('viewportWidth', i);
						qs.viewport_height = this.getNodeParameter('viewportHeight', i);
						qs.timeout = this.getNodeParameter('timeout', i);
						qs.delay = this.getNodeParameter('delay', i);
						qs.response_type = 'link';
						responseFormat = 'text';

						break;
				}

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'HandingerApi',
					{
						method: 'GET',
						url: `https://api.handinger.com${endpoint}`,
						qs,
						json: responseFormat === 'json',
						headers: {
							Accept: responseFormat === 'json' ? 'application/json' : 'text/plain',
							'Content-Type': 'application/json',
						},
					},
				);

				returnData.push({
					json: {
						success: true,
						response,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: error.message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
