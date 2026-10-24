import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs"
import {RespondData} from "../types/autorespond"
import path from "path"
import Protector from "../util/protect"
import Logger from "../util/log"
import app from ".."

export default class AppResources {
	private static readonly directory: string = `resources/app/`
	private static readonly templates: string = `src/res/template`
	private static readonly logger: Logger = new Logger(`APPRESOURCE`)
	private static readonly definedDataFile: string[] = ["autorespond", "servercfg"]
	private static readonly USE_MONGO: boolean = process.env.USE_MONGO === "true"

	public static async mk() {
		if (!this.USE_MONGO && !existsSync(this.directory)) {
			mkdirSync(this.directory, {recursive: true})
		}
		for (const defined of this.definedDataFile) {
			const templatePath = `${this.templates}/${defined}.json`
			if (!existsSync(templatePath)) {
				this.logger.warn(`${defined} is missing template file in ${this.templates}`)
				continue
			}
			const template = JSON.parse(readFileSync(templatePath, `utf-8`))
			if (!this.USE_MONGO) {
				const way = path.join(this.directory, defined)
				if (!existsSync(way)) {
					writeFileSync(way, Protector.encode(template))
					this.logger.log(`Made ${defined} data using template`)
				}
			} else if (this.USE_MONGO) {
				if (!app.database) return this.logger.err(`MongoDB is not connected`)
				const collection = app.database.collection(`app`)
				const data = await collection.findOne({name: defined})
				if (!data) {
					await collection.insertOne({name: defined, data: Protector.encode(template)})
					this.logger.log(`Made ${defined} data using template`)
				}
			}
		}
	}

	public static async get(queryData: string) {
		await this.mk()
		let rawData
		if (!this.USE_MONGO) {
			const way = path.join(this.directory, queryData)
			if (!existsSync(way)) {
				this.logger.warn(`no such query ${queryData}`)
				return
			}
			rawData = readFileSync(way)
		} else {
			if (!app.database) {
				this.logger.warn(`MongoDB is not connected`)
				return
			}
			const document = await app.database.collection(`app`).findOne({name: queryData})
			if (!document) {
				this.logger.warn(`no such query ${queryData}`)
				return
			}
			rawData = Buffer.from(document.data.buffer)
		}
		return Protector.decode(rawData)
	}

	/**
	 *
	 * @param data The unencoded data to save
	 * @param query
	 * @returns
	 */
	public static async save(data: Object, query: string) {
		await this.mk()
		const s = Protector.encode(data)
		if (!this.USE_MONGO) {
			const way = path.join(this.directory, query)
			writeFileSync(way, s)
		} else {
			if (!app.database) {
				this.logger.warn(`MongoDB is not connected`)
				return
			}
			await app.database.collection(`app`).updateOne({name: query}, {$set: {data: s}}, {upsert: true})
		}
		this.logger.log(`Updated ${query}`)
		return s
	}
}
