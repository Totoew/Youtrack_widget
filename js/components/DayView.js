export default class DayView {
    constructor() {
        this.dayGrid = document.getElementById('dayGrid');
    }

    render(date, tasks) {
        this.dayGrid.innerHTML = '';
        
        const today = new Date();
        const isToday = this.isSameDay(date, today);

        const dayTasks = [];
        const dateString = date.toLocaleDateString();
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].deadline.toLocaleDateString() === dateString) {
                dayTasks.push(tasks[i]);
            }
        }
        
        this.createDayCell(date, isToday, dayTasks);
    }

    createDayCell(date, isToday, dayTasks) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell-single';
        
        if (isToday) {
            dayCell.classList.add('today');
        }

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header-single';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-name-single';
        dayNumber.textContent = date.getDate();
        
        const dayWeekday = document.createElement('div');
        dayWeekday.className = 'day-weekday';
        
        const days = ['ВОСКРЕСЕНЬЕ', 'ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
        dayWeekday.textContent = days[date.getDay()];
        
        // Правильное склонение слова "задача"
        const tasksCount = document.createElement('div');
        tasksCount.className = 'day-tasks-count';
        tasksCount.textContent = this.getTaskCountText(dayTasks.length);
        
        // Контейнер для задач
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'day-tasks-container';
        
        // Отрисовка задач
        if (dayTasks && dayTasks.length > 0) {
            dayTasks.forEach((task, index) => {
                const taskElement = this.createTaskElement(task, index);
                tasksContainer.appendChild(taskElement);
            });
        } else {
            const noTasksMessage = document.createElement('div');
            noTasksMessage.className = 'no-tasks-message';
            noTasksMessage.textContent = 'Нет задач на этот день';
            tasksContainer.appendChild(noTasksMessage);
        }

        dayHeader.appendChild(dayNumber);
        dayHeader.appendChild(dayWeekday);
        dayHeader.appendChild(tasksCount);
        dayCell.appendChild(dayHeader);
        dayCell.appendChild(tasksContainer);
        this.dayGrid.appendChild(dayCell);
    }

    // Метод для правильного склонения слова "задача"
    getTaskCountText(count) {
        if (count === 0) return 'нет задач';
        
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return `${count} задач`;
        }
        
        switch (lastDigit) {
            case 1:
                return `${count} задача`;
            case 2:
            case 3:
            case 4:
                return `${count} задачи`;
            default:
                return `${count} задач`;
        }
    }

    createTaskElement(task, index) {
        const taskElement = document.createElement('div');
        taskElement.className = 'day-task';
        taskElement.dataset.index = index;
        
        // Основная информация задачи
        const taskHeader = document.createElement('div');
        taskHeader.className = 'task-header';
        
        const taskId = document.createElement('div');
        taskId.className = 'task-id';
        taskId.textContent = task.id;
        
        const taskSummary = document.createElement('div');
        taskSummary.className = 'task-summary';
        taskSummary.textContent = task.summary;
        
        taskHeader.appendChild(taskId);
        taskHeader.appendChild(taskSummary);
        
        // Детали задачи
        const taskDetails = document.createElement('div');
        taskDetails.className = 'task-details';
        
        // Приоритет с цветовой кодировкой
        if (task.priority) {
            const priorityElement = document.createElement('div');
            priorityElement.className = `task-priority priority-${this.getPriorityClass(task.priority)}`;
            priorityElement.textContent = task.priority;
            taskDetails.appendChild(priorityElement);
        }
        
        // Тип задачи
        if (task.type) {
            const typeElement = document.createElement('div');
            typeElement.className = 'task-type';
            typeElement.textContent = task.type;
            taskDetails.appendChild(typeElement);
        }
        
        // Исполнитель
        if (task.executor) {
            const executorElement = document.createElement('div');
            executorElement.className = 'task-executor';
            executorElement.innerHTML = `<span class="label">Исполнитель:</span> ${task.executor}`;
            taskDetails.appendChild(executorElement);
        }
        
        // Подсистема
        if (task.subsystem) {
            const subsystemElement = document.createElement('div');
            subsystemElement.className = 'task-subsystem';
            subsystemElement.innerHTML = `<span class="label">Подсистема:</span> ${task.subsystem}`;
            taskDetails.appendChild(subsystemElement);
        }
        
        // Статус
        if (task.status) {
            const statusElement = document.createElement('div');
            statusElement.className = `task-status status-${this.getStatusClass(task.status)}`;
            statusElement.innerHTML = `<span class="label">Статус:</span> ${task.status}`;
            taskDetails.appendChild(statusElement);
        }
        
        // Затраченное время
        if (task.timeSpent) {
            const timeElement = document.createElement('div');
            timeElement.className = 'task-time';
            timeElement.innerHTML = `<span class="label">Затрачено:</span> ${task.timeSpent}`;
            taskDetails.appendChild(timeElement);
        }

        taskElement.appendChild(taskHeader);
        taskElement.appendChild(taskDetails);
        
        return taskElement;
    }

    getPriorityClass(priority) {
        const priorityMap = {
            'Critical': 'critical',
            'Show-stopper': 'show-stopper',
            'Major': 'major',
            'Normal': 'normal'
        };
        return priorityMap[priority] || 'default';
    }

    getStatusClass(status) {
        const statusMap = {
            'Новая': 'new',
            'В работе': 'in-progress',
            'На проверке': 'review',
            'Завершена': 'completed',
            'Отложена': 'postponed'
        };
        return statusMap[status] || 'default';
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
}
