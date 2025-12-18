export default class MonthView {
    constructor() {
        this.daysGrid = document.getElementById('daysGrid');
    }

    render(date, tasks) {
        this.daysGrid.innerHTML = '';
        
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const startDay = firstDayOfMonth.getDay();
        const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

        // Добавляем дни из предыдущего месяца
        const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        for (let i = adjustedStartDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            this.createDayCell(day, true, date);
        }

        // Добавляем дни текущего месяца
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            this.createDayCell(day, false, date);
        }

        // Добавляем дни следующего месяца
        const totalCells = 42;
        const daysSoFar = adjustedStartDay + lastDayOfMonth.getDate();
        const nextMonthDays = totalCells - daysSoFar;
        for (let day = 1; day <= nextMonthDays; day++) {
            this.createDayCell(day, true, date);
        }

        this.renderTasks(tasks);
    }

    createDayCell(day, isOtherMonth, currentMonthDate) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        
        if (isOtherMonth) {
            dayCell.classList.add('other-month');
        }

        const today = new Date();
        const currentMonth = currentMonthDate.getMonth();
        const currentYear = currentMonthDate.getFullYear();

        // Создаем дату для этой ячейки
        let cellDate;
        if (isOtherMonth) {
            if (day > 20) {
                cellDate = new Date(currentYear, currentMonth - 1, day);
            } else {
                cellDate = new Date(currentYear, currentMonth + 1, day);
            }
        } else {
            cellDate = new Date(currentYear, currentMonth, day);
        }

        // Проверяем, является ли эта дата сегодняшним днем
        if (cellDate.getDate() === today.getDate() &&
            cellDate.getMonth() === today.getMonth() &&
            cellDate.getFullYear() === today.getFullYear()) {
            dayCell.classList.add('today');
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';

        dayCell.appendChild(dayNumber);
        dayCell.appendChild(dayEvents);
        dayCell.dataset.date = cellDate.toLocaleDateString();
        this.daysGrid.appendChild(dayCell);
    }

    renderTasks(tasks) {
        const startDate = this.parseDate(this.daysGrid.children[0].dataset.date);
        const endDate = this.parseDate(this.daysGrid.children[41].dataset.date);

        // Собираем задачи по дням
        const tasksByDay = {};
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const deadline = task.deadline;
            if (deadline >= startDate && deadline <= endDate) {
                const dateKey = deadline.toLocaleDateString();
                if (!tasksByDay[dateKey]) {
                    tasksByDay[dateKey] = [];
                }
                tasksByDay[dateKey].push(task);
            }
        }

        // Отображаем ВСЕ задачи
        for (const [dateKey, dayTasks] of Object.entries(tasksByDay)) {
            const cell = document.querySelector(`[data-date="${dateKey}"]`);
            if (cell) {
                const cellEvents = cell.querySelector('.day-events');
                
                // Если есть задачи - добавляем счетчик
                if (dayTasks.length > 0) {
                    const taskCount = document.createElement('div');
                    taskCount.className = 'task-count';
                    taskCount.textContent = this.getTaskCountText(dayTasks.length);
                    cellEvents.appendChild(taskCount);
                }
                
                // Добавляем ВСЕ задачи
                dayTasks.forEach(task => {
                    const event = this.createTaskElement(task);
                    cellEvents.appendChild(event);
                });
                
                // Если много задач - добавляем индикатор
                if (dayTasks.length > 5) {
                    cell.classList.add('many-tasks');
                }
            }
        }
    }

    createTaskElement(task) {
        const event = document.createElement('div');
        event.className = 'month-event';
        event.textContent = task.summary || 'Без названия';
        
        switch (task.priority) {
            case 'Неотложная':
                event.classList.add('show-stopper');
                break;
            case 'Критическая':
                event.classList.add('critical');
                break;
            case 'Серьезная':
                event.classList.add('major');
                break;
            case 'Обычная':
                event.classList.add('normal');
                break;
        }

        // Добавляем тултип с полной информацией
        event.title = this.createTaskTooltip(task);
        
        return event;
    }

    createTaskTooltip(task) {
        return `Задача: ${task.id || 'Без ID'}\n` +
               `Описание: ${task.summary || 'Без названия'}\n` +
               `Приоритет: ${task.priority || 'не указан'}\n` +
               `Исполнитель: ${task.executor || 'не назначен'}\n` +
               `Статус: ${task.status || 'не указан'}\n` +
               `Тип: ${task.type || 'не указан'}\n` +
               `Подсистема: ${task.subsystem || 'не указана'}\n` +
               `Затрачено: ${task.timeSpent || 'не указано'}`;
    }

    getTaskCountText(count) {
        if (count === 0) return '';
        
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

    parseDate(dateString) {
        const [d, m, y] = dateString.split('.');
        const date = `${m}.${d}.${y}`;
        return new Date(date);
    }
}