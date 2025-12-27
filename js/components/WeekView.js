export default class WeekView {
    constructor() {
        this.weekGrid = document.getElementById('weekGrid');
        this.weekEvents = document.getElementById('weekEvents');
        this.weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    }

    render(date, tasks) {
        this.weekGrid.innerHTML = '';
        this.weekEvents.innerHTML = '';
        
        const weekDates = this.getWeekDates(date);
        const weekDatesLocale = weekDates.map(item => item.toLocaleDateString());

        const weekTasks = [];

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            task.startDate = task.startDate || task.deadline;

            const deadline = task.deadline.toLocaleDateString();
            const startDate = task.startDate.toLocaleDateString();

            if (weekDatesLocale.includes(startDate) || 
                weekDatesLocale.includes(deadline) ||
                task.startDate < weekDates[0] && weekDates[6] < task.deadline) {
                weekTasks.push(task);
            }
        }

        this.createEvents(weekDates, weekTasks);

        const today = new Date();
        
        weekDates.forEach((weekDate, index) => {
            const isCurrentDay = this.isSameDay(weekDate, today);
            this.createWeekDayCell(weekDate, isCurrentDay, weekDates);
        });
    }

    getWeekDates(date) {
        const dates = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);
            dates.push(currentDate);
        }
        
        return dates;
    }

    createWeekDayCell(date, isCurrentDay, weekDates) {
        const dayCell = document.createElement('div');
        dayCell.className = 'week-day';
        
        if (isCurrentDay) {
            dayCell.classList.add('current-day');
        }

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = this.weekDays[date.getDay() - 1];
        
        const dayDate = document.createElement('div');
        dayDate.className = 'day-date';
        dayDate.textContent = date.getDate();

        const tasksCount = this.countElementsInColumn(weekDates.indexOf(date) + 1);
        const dayTasksCount = document.createElement('div');
        dayTasksCount.className = 'day-tasks-count';
        dayTasksCount.textContent = this.getTaskCountText(tasksCount);
        
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';

        if (tasksCount === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'day-content';
            placeholder.textContent = 'Нет задач на этот день';
            dayEvents.appendChild(placeholder);
        }

        dayHeader.appendChild(dayName);
        dayHeader.appendChild(dayDate);
        dayCell.appendChild(dayHeader);
        dayCell.appendChild(dayTasksCount);
        dayCell.appendChild(dayEvents);
        this.weekGrid.appendChild(dayCell);
    }

    createEvents(weekDates, tasks) {
        weekDates = weekDates.map(weekDate => weekDate.toLocaleDateString());
        tasks.sort((a, b) => a.startDate - b.startDate);

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const event = document.createElement('div');
            event.className = 'grid-event';
            event.textContent = task.summary;
            
            if (task.status === 'Готово') {
                event.style.textDecoration = 'line-through';
                event.style.textDecorationColor = '#807e7eff';
            }

            const [startIndex, width] = this.getCellIndex(weekDates, task);
            event.style.gridColumn = `${startIndex} / span ${width}`;

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

            event.title = this.createTaskTooltip(task);

            this.weekEvents.appendChild(event);
        }
    }

    getCellIndex(weekDates, task) {
        const startDate = task.startDate.toLocaleDateString();
        const deadline = task.deadline.toLocaleDateString();
        const startIndex = weekDates.indexOf(startDate) === -1 ? 1 : weekDates.indexOf(startDate) + 1;
        const endIndex = weekDates.indexOf(deadline) === -1 ? 7 : weekDates.indexOf(deadline) + 1;
        return [startIndex, endIndex - startIndex + 1];
    }

    createTaskTooltip(task) {
        return `Задача: ${task.id}\n` +
               `Описание: ${task.summary}\n` +
               `Приоритет: ${task.priority || 'не указан'}\n` +
               `Исполнитель: ${task.executor || 'не назначен'}\n` +
               `Статус: ${task.status || 'не указан'}\n` +
               `Тип: ${task.type || 'не указан'}`;
    }

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

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }


    countElementsInColumn(columnNumber) {
        const events = document.querySelectorAll('.grid-event');
        let count = 0;
        
        events.forEach(event => {
            const gridColumn = event.style.gridColumn;
            if (gridColumn) {
                const [start, width] = gridColumn.split(' / span ').map(item => parseInt(item));
                if (columnNumber >= start && columnNumber <= start + width - 1) {
                    count++;
                }
            }
        });
        
        return count;
    }
}