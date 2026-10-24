export interface CommandInfo {
	command: string
	description: string
    wlrequire: boolean
	usage: string
	permissionrequire?: bigint,
	triggers: string[]
	minimumArgs: number,
    func: Function
}
