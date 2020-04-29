export default class Signal<T = any> {
	protected listeners: Array<(data?: any) => void>;

	constructor() {
		this.listeners = [];
	}

	public add(callback: (data: T) => void) {
		this.listeners.push(callback);
	}

	public dispatch(data?: T) {
		this.listeners.map((listener) => listener(data));
	}
}
