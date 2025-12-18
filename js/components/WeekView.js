export default class WeekView {
    constructor() {
        this.weekGrid = document.getElementById('weekGrid');
        this.weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    }

    render(date, tasks) {
        this.weekGrid.innerHTML = '';
        
        const weekDates = this.getWeekDates(date);
        const weekDatesLocale = weekDates.map(item => item.toLocaleDateString());

        const weekTasks = {};
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            const deadline = task.deadline.toLocaleDateString();

            if (weekDatesLocale.includes(deadline)) {
                if (!weekTasks[deadline]) {
                    weekTasks[deadline] = [];
                }

                weekTasks[deadline].push(task);
            }
        }

        const today = new Date();
        
        weekDates.forEach((weekDate, index) => {
            const isCurrentDay = this.isSameDay(weekDate, today);
            this.createWeekDayCell(weekDate, isCurrentDay, weekTasks);
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

    createWeekDayCell(date, isCurrentDay, weekTasks) {
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
        
        const dayTasks = weekTasks[date.toLocaleDateString()];
        const tasksCount = dayTasks ? dayTasks.length : 0;
        
        const dayTasksCount = document.createElement('div');
        dayTasksCount.className = 'day-tasks-count';
        dayTasksCount.textContent = this.getTaskCountText(tasksCount);
        
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';
        
        // Если одна задача - НЕ добавляем специальные классы
        // Карточка будет обычной высоты
        
        if (dayTasks && dayTasks.length > 0) {
            for (let i = 0; i < dayTasks.length; i++) {
                const task = dayTasks[i];
                const event = document.createElement('div');
                event.className = 'event';
                event.textContent = task.summary;

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
                
                // Добавляем тултип с информацией
                event.title = this.createTaskTooltip(task);
                
                dayEvents.appendChild(event);
            }
            
            // Если задач много - добавляем индикатор скролла
            if (dayTasks.length > 5) {
                dayEvents.classList.add('has-scroll');
            }
        } else {
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
}