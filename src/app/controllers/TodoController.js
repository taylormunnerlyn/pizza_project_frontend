import TodoList from 'common/services/todolist';

let todoList = new TodoList();
todoList.add('learn AngularJS', true);
todoList.add('build an AngularJS app');

function TodoController () {
    var vm = this;

    vm.todoText = '';

    vm.todoList = todoList;
    vm.addTodo = addTodo;

    function addTodo () {
        todoList.add(vm.todoText);
        vm.todoText = '';
    }
}

export default TodoController;
