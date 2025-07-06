import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HandingerApi implements ICredentialType {
	name = 'HandingerApi';
	displayName = 'Handinger API';
	documentationUrl = 'https://handinger.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
		},
	];
	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}'
			}
		},
	} as IAuthenticateGeneric;
}