export default class Logger {

    public readonly name: string

    constructor (name: string) {
        this.name = name
    }

    public log(text: string) {
        console.log(`[${this.name}] ${text}`)
    }

    public err(error: string) {
        throw new Error(`[${this.name}] ERROR\n${error}`)
    }

    public warn(warning: string) {
        console.log(`[${this.name}] WARNING\n${warning}`)
    }

}