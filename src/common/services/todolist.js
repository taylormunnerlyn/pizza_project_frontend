import Todo from 'todo';
import {values} from 'generators';

class TodoList {
    constructor() {
        this.todos = {}; // Map of Todo objects by timestamp.
        this.length = 0;
    }

    add(text, done = false) {
        let todo = new Todo(text, done);
        this.todos[String(todo.timestamp)] = todo;
        this.length++;
    }

    archiveCompleted() {
        for (let todo of values(this.todos)) {
            if (todo.done) {
                this.remove(todo);
            }
        }
    }

    remove(todo) {
        delete this.todos[String(todo.timestamp)];
        this.length--;
    }

    getUncompletedCount() {
        let count = 0;
        for (let todo of values(this.todos)) {
            if (!todo.done) {
                count++;
            }
        }
        return count;
    }
}

export default TodoList;
