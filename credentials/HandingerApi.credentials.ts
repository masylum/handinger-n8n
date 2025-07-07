import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class HandingerApi implements ICredentialType {
	name = 'handingerApi';
	displayName = 'Handinger API';
	documentationUrl = 'https://handinger.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};
}
