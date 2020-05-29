import { RawPlayer } from './RawPlayer';

export class Player {
    private _id: string;
    private _name: string;
    private _active: boolean;
    private _ready: boolean;
    private _admin: boolean;

    get id(): string {
        return this._id;
    }

    get isReady(): boolean {
        return this._ready;
    }

    get isAdmin(): boolean {
        return this._admin;
    }

    get isActive(): boolean {
        return this._active;
    }

    constructor(player: RawPlayer) {
        this._id = player.id;
        this._name = player.name;
        this._active = player.active;
        this._ready = player.ready;
        this._admin = player.isAdmin;
    }
}