import { fetchProjects, fetchTasks } from "./api.js";

const deadlines = [
        "Сегодня",
        "Завтра",
        "На этой неделе",
        "На следующей неделе",
        "В этом месяце",
        "Вышел"
    ];

const timeSpent = [
    "Не указано",
    "Меньше суток",
    "От 1 до 3 дней",
    "От 3 до 10 дней",
    "От 10 дней до месяца",
    "Больше месяца"
];

// Функция для создания списка проектов
async function makeProjectsList() {
    const projects = await fetchProjects();
    const names = projects.map(task => task.name);
    const shortNames = projects.map(task => task.shortName);
    return [names, shortNames];
}


// Функция для создания списков фильтров
async function makeTaskFieldsList(shortName) {
    const subsystems = new Set();
    const executors = new Set();
    const types = new Set();
    const priorities = new Set();
    const statuses = new Set();

    const tasks = await fetchTasks(shortName);

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        task.subsystem === null ? subsystems.add('Не указано') : subsystems.add(task.subsystem);
        task.executor === null ? executors.add('Не указано') : executors.add(task.executor);
        task.type === null ? types.add('Не указано') : types.add(task.type);
        task.priority === null ? priorities.add('Не указано') : priorities.add(task.priority);
        task.status === null ? statuses.add('Не указано') : statuses.add(task.status);
    }

    const taskFieldsList = {
        subsystems: [...subsystems],
        executors: [...executors],
        types: [...types],
        priorities: [...priorities],
        statuses: [...statuses],
        timeSpent: timeSpent,
        deadlines: deadlines
    };

    return [tasks, taskFieldsList];
}

export { makeProjectsList, makeTaskFieldsList };
