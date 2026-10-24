export enum RespondType {
	RESPOND_OTHER = 0,
	RESPOND_REPLY = 1,
	RESPOND_REACT = 2,
	RESPOND_URL = 3,
}

export interface RespondData {
	name: string
	triggers: string[]
	respond_type: RespondType,
    response: string,
}
