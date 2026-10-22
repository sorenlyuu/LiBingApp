export interface CommandInfo {
	command: string
	description: string
    wlrequire: boolean
	usage: string
	triggers: string[]
	minimumArgs: number,
    func: Function
}
