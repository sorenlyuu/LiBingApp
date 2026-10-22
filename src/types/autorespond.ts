export enum RespondType {
	RESPOND_OTHER = 0,
	RESPOND_REPLY = 1,
	RESPOND_REACT = 2,
}

export interface RespondData {
	name: string
	triggers: string[]
	respondType: RespondType,
    response: string
}
