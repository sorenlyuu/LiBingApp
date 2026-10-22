import "dotenv/config"
import {existsSync, readFileSync, writeFileSync} from "fs"
import {randomBytes} from "node:crypto"
import Logger from "./log"

// this is the part where i edit this and pretended it was from mihoyo
export default class Protector {

	private static readonly logger: Logger = new Logger(`PROT`)
	private static SEED: number
	private static PROTECT: boolean

	public static init() {
		if (!existsSync(`resources/seed`)) {
			const seed = randomBytes(4).readUInt32BE(0)
			writeFileSync("resources/seed", seed.toString(), "utf-8")
		}
		this.SEED = Number(readFileSync(`resources/seed`, "utf-8"))
		this.PROTECT = Boolean(process.env.PROTECT)
		this.logger.log(`Initialized`)
	}

	public static decode(data: string) {
		if (!this.PROTECT) return JSON.parse(data)
		const input = Buffer.from(data, "base64")
		const output = Buffer.alloc(input.length)

		for (let i = 0; i < input.length; i++) {
			const key = (this.SEED >>> ((i % 4) * 8)) & 0xff
			output[i] = input[i]! ^ key
		}

		try {
			return JSON.parse(output.toString("utf8"))
		} catch {
			return
		}
	}

	public static encode(data: Object) {
		if (!this.PROTECT) return data
		const encoded = Buffer.from(JSON.stringify(data))
		const out = Buffer.alloc(encoded.length)

		for (let i = 0; i < encoded.length; i++) {
			const key = (this.SEED >>> ((i % 4) * 8)) & 0xff
			out[i] = encoded[i]! ^ key
		}

		return out.toString("base64")
	}
}
