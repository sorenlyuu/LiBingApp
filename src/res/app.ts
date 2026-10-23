import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs"
import {RespondData} from "../types/autorespond"
import path from "path"
import Protector from "../util/protect"
import Logger from "../util/log"

export default class AppResources {
	private static readonly directory: string = `resources/app/`
	private static readonly templates: string = `src/res/template`
	private static readonly logger: Logger = new Logger(`APPRESOURCE`)
	private static readonly definedDataFile: string[] = ["autorespond"]

	public static mk() {
		if (!existsSync(this.directory)) {
			mkdirSync(this.directory)
		}
		this.definedDataFile.forEach((defined) => {
			if (!existsSync(`${this.templates}/${defined}.json`)) {
				return this.logger.warn(`${defined} is missing template file in ${this.templates}`)
			}
			if (!existsSync(`${this.directory}/${defined}`)) {
				const template = JSON.parse(readFileSync(`${this.templates}/${defined}.json`, `utf-8`))
				writeFileSync(`${this.directory}/${defined}`, Protector.encode(template))
				this.logger.log(`Made ${defined} data using template`)
			}
		})
	}

	public static get(queryData: string) {
		this.mk()
		const way = path.join(this.directory, queryData)
		if (!existsSync(way)) return
		const data = Protector.decode(readFileSync(way))
		return data
	}

	/**
	 *
	 * @param data The unencoded data to save
	 * @param query
	 * @returns
	 */
	public static save(data: Object, query: string) {
		this.mk()
		const way = path.join(this.directory, query)
		const s = Protector.encode(data)
		writeFileSync(way, s)
		return s
	}
}
