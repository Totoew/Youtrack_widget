export default  class WeekView {
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
        
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';
        
        const dayTasks = weekTasks[date.toLocaleDateString()];
        if (dayTasks) {
            for (let i = 0; i < dayTasks.length; i++) {
                const event = document.createElement('div');
                event.className = 'event';
                event.textContent = dayTasks[i].summary;
                dayEvents.appendChild(event);
            }
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'day-content';
            placeholder.textContent = 'События дня';
            dayEvents.appendChild(placeholder);
        }

        dayHeader.appendChild(dayName);
        dayHeader.appendChild(dayDate);
        dayCell.appendChild(dayHeader);
        dayCell.appendChild(dayEvents);
        this.weekGrid.appendChild(dayCell);
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
}