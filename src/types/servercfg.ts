import {RespondData} from "./autorespond"

export interface Birthday {
    name: string,
    date: string
}

export interface Config {
	chnl_birthday_annc: string
	autoresponds: RespondData[]
    birthdays: Birthday[]
}
export interface ServerConfig {
	[guildId: string]: Config
}
