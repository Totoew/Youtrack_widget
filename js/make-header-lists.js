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
    const tasks = await fetchTasks(shortName);
    const tasksLength = tasks.length;

    const subsystems = new Set();
    const executors = new Set();
    const types = new Set();
    const priorities = new Set();
    const statuses = new Set();

    for (let i = 0; i < tasksLength; i++) {
        const task = tasks[i];

        if (task.subsystem != null) subsystems.add(task.subsystem);
        if (task.executor != null) executors.add(task.executor);
        if (task.type != null) types.add(task.type);
        if (task.priority != null) priorities.add(task.priority);
        if (task.status != null) statuses.add(task.status);
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
