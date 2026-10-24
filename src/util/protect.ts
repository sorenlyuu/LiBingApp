import "dotenv/config"
import {existsSync, readFileSync, writeFileSync} from "fs"
import {randomBytes} from "node:crypto"
import Logger from "./log"
import {appendFileSync} from "node:fs"

// this is the part where i edit this and pretended it was from mihoyo
export default class Protector {
	private static readonly logger: Logger = new Logger(`PROT`)
	private static SEED: number
	public static PROTECT: boolean

	public static async init() {
		let seed = process.env.SEED
		if (!seed) {
			seed = String(randomBytes(4).readUInt32BE(0))
			appendFileSync(`.env`, `\nSEED=${seed}`, `utf-8`)
			process.env.SEED = seed
		}
		this.SEED = Number(seed)
		this.PROTECT = process.env.PROTECT === `true`
		this.logger.log(`Initialized`)
	}

	public static decode(data: Uint8Array) {
		if (!this.PROTECT) return JSON.parse(Buffer.from(data).toString())
		const input = Buffer.from(data)
		const output = Buffer.alloc(input.length)
		for (let i = 0; i < input.length; i++) {
			const key = (this.SEED >>> ((i % 4) * 8)) & 0xff
			output[i] = input[i]! ^ key
		}
		const decoded = output.toString()
		return JSON.parse(decoded)
	}

	public static encode(data: Object) {
		const buffer = Buffer.from(JSON.stringify(data))
		if (!this.PROTECT) return Buffer.from(buffer)
		const out = Buffer.alloc(buffer.length)
		for (let i = 0; i < buffer.length; i++) {
			const key = (this.SEED >>> ((i % 4) * 8)) & 0xff
			out[i] = buffer[i]! ^ key
		}

		return out
	}
}
