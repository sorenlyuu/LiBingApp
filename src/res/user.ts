import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs"
import path from "path"
import Protector from "../util/protect"
import Logger from "../util/log"
import app from ".."
import {Collection} from "mongodb"
import { UserItem } from "../types/userdata"

export default class UserData {
	private static readonly directory: string = `resources/users/`
	private static readonly template: string = `src/res/template/userdata.json`
	private static readonly logger: Logger = new Logger(`USERDATA`)
	private static collection: Collection | undefined
	private static readonly USE_MONGO: boolean = process.env.USE_MONGO === "true"

	public static async mk(userId: string) {
		if (!this.USE_MONGO && !existsSync(this.directory)) {
			mkdirSync(this.directory, {recursive: true})
		}
		if (!existsSync(this.template)) {
			throw new Error(`Missing template file in ${this.template}`)
		}
		const template = JSON.parse(readFileSync(this.template, `utf-8`))
		if (!this.USE_MONGO) {
			const way = path.join(this.directory, userId)
			if (!existsSync(way)) {
				writeFileSync(way, Protector.encode(template))
				this.logger.log(`Made ${template}'s data using template`)
			}
		} else if (this.USE_MONGO) {
			if (!app.database) return this.logger.err(`MongoDB is not connected`)
			this.collection = app.database.collection(`userdata`)
			const data = await this.collection.findOne({id: userId})
			if (!data) {
				await this.collection.insertOne({id: userId, data: Protector.encode(template)})
				this.logger.log(`Made ${userId}'s data using template`)
			}
		}
	}

	public static async get(userId: string): Promise<UserItem | undefined> {
		await this.mk(userId)
		let rawData
		if (!this.USE_MONGO) {
			const way = path.join(this.directory, userId)
			if (!existsSync(way)) {
				this.logger.warn(`no such user ${userId}`)
				return
			}
			rawData = readFileSync(way)
		} else {
			if (!app.database) {
				this.logger.warn(`MongoDB is not connected`)
				return
			}
			const document = await this.collection!.findOne({id: userId})
			if (!document) {
				this.logger.warn(`no such user ${userId}`)
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
	public static async save(data: Object, userId: string)  {
		await this.mk(userId)
		const s = Protector.encode(data)
		if (!this.USE_MONGO) {
			const way = path.join(this.directory, userId)
			writeFileSync(way, s)
		} else {
			if (!app.database) {
				this.logger.warn(`MongoDB is not connected`)
				return
			}
			await this.collection!.updateOne({id: userId}, {$set: {data: s}}, {upsert: true})
		}
		this.logger.log(`Updated ${userId}`)
		return s
	}
}
