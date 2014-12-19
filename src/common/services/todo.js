let lastTs = 0;

class Todo {
    constructor(text, done = false, timestamp = Todo.createTimestamp()) {
        this.text = text;
        this.done = done;
        this.timestamp = timestamp;
    }

    static createTimestamp() {
        let now = Date.now();

        // Adjust if now is the same millisecond as lastTs.
        lastTs = now === lastTs ? lastTs + 1 : now;

        return lastTs;
    }
}

export default Todo;
