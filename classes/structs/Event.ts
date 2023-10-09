import {ExtendedClient, ExtendedClientEvents} from "../../types";


export default class Event {
    public name: any;
    public run: any;
    public once: boolean;
    constructor() {
    }
    setData<K extends keyof ExtendedClientEvents>(name: K, run: (client: ExtendedClient,...args: ExtendedClientEvents[K]) => unknown, once?: boolean): this
    setData<S extends string | symbol>(name: S, run: (client: ExtendedClient,...args: any[]) => unknown, once?: boolean): this
    setData(name: string, run: Function, once = false) {
        this.name = name
        this.run = run
        this.once = once
        return this
    }
}