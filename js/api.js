// Приватный токен пользователя
const USER_TOKEN = 'perm:bmxvdm5hcw==.NTAtMzI=.R0zsXvnYAnNGruuHBmtvVz0CJUxbKv';

// Адрес сайта
const YOUTRACK_URL = 'https://youtrack.66bit.ru';

// Словарь для кастомных полей события
const customField = {
    'Priority': 'priority',
    'Type': 'type',
    'State': 'status',
    'Отдыхающий': 'executor',
    'Subsystem': 'subsystem',
    'Затраченное время': 'timeSpent',
    'Дата начала': 'startDate',
    'Due Date': 'deadline'
};

// Функция для поиска проектов текущего пользователя
async function fetchProjects() {
    const response = await fetch(`${YOUTRACK_URL}/api/admin/projects?fields=name,shortName`, {
        headers: {
            'Authorization': `Bearer ${USER_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (response.ok) {
        const projects = await response.json();   
        const projectsNumber = projects.length;

        for (let i = 0; i < projectsNumber; i++) {
            delete projects[i].$type;
        }
        return projects;

    } else {
        console.error('Ошибка:', response.status);
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }
}

// Функция для поиска всех задач по проекту пользователя
async function fetchTasks(shortName) {
    const response = await fetch(`${YOUTRACK_URL}/api/issues?query=project:${shortName}&fields=summary,idReadable,customFields(projectCustomField(field(name)),value(name,minutes,presentation))`, {
        headers: {
            'Authorization': `Bearer ${USER_TOKEN}`,
            'Accept': 'application/json'
        }
    });
    
    if (response.ok) {
        const tasks = await response.json(); 
        const parsedTasks = parseTasks(tasks);
        return parsedTasks;

    } else {
        console.error('Ошибка:', response.status);
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }
}


function parseTasks(tasks) {
    const tasksLength = tasks.length;
    const tasksFields = [];
    let fields = ['summary', 'id'];
    const customFieldsNames = [];

    for (let i = 0; i < tasksLength; i++) {
        const task = tasks[i];
        let taskFields = {};
        const customFieldsLength = tasks[i].customFields.length;

        for (let j = 0; j < customFieldsLength; j++) {
            const customFields = task.customFields[j];
            let name = customFields.projectCustomField.field.name;
            let value = customFields.value?.name || customFields.value;

            if (name == 'Затраченное время' && value != null) {
                value = value.presentation;
            } else if (name == 'Due Date') {
                value = new Date(value);
            }

            if (customFieldsNames.length < customFieldsLength) {
                customFieldsNames.push(customField[name]);
            }
            taskFields[name] = value;
        }
        taskFields['summary'] = task.summary;
        taskFields['id'] = task.idReadable;

        if (fields.length === 2) {
            fields = [...customFieldsNames, ...fields];
        }

        taskFields = Object.fromEntries(
            Object.values(taskFields).map((value, i) => [fields[i], value])
        );

        tasksFields.push(taskFields);
    }

    return tasksFields;
}

export { fetchProjects, fetchTasks };