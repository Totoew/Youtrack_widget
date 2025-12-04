import { fetchProjects, fetchTasks } from "./api.js";

async function makeProjectsList() {
    const projects = await fetchProjects();
    const names = projects.map(task => task.name);
    const shortNames = projects.map(task => task.shortName);
    return names, shortNames;
}

async function makeTaskFieldsList(shortName) {
    const tasks = await fetchTasks(shortName);
    const tasksLength = tasks.length;
    
    const subsystems = new Set();
    const executors = new Set();
    const types = new Set();
    const priorities = new Set();
    const statuses = new Set();
    const timeSpent = new Set();

    for (let i = 0; i < tasksLength; i++) {
        const task = tasks[i];

        subsystems.add(task.subsystem);
        executors.add(task.executor);
        types.add(task.type);
        priorities.add(task.priority);
        statuses.add(task.status);
        timeSpent.add(task.timeSpent);
    }

    const taskFieldsList = {
        subsystems: [...subsystems],
        executors: [...executors],
        types: [...types],
        priorities: [...priorities],
        statuses: [...statuses],
        timeSpent: [...timeSpent]
    };

    return taskFieldsList;
}

export { makeProjectsList, makeTaskFieldsList };
