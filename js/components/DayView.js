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
        
        // Добавляем класс today только если это сегодняшний день
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
        
        // Декоративный элемент
        const decoration = document.createElement('div');
        decoration.className = 'day-decoration';
        if (isToday) {
            decoration.textContent = 'Сегодня';
        } else {
            decoration.textContent = 'Календарь дня';
        }

        // Отрисовка событий
        // Добавить классы для событий, создать div, добавить классы и добавить в контейнер
        if (dayTasks) {

        }

        dayHeader.appendChild(dayNumber);
        dayHeader.appendChild(dayWeekday);
        dayCell.appendChild(dayHeader);
        dayCell.appendChild(decoration);
        this.dayGrid.appendChild(dayCell);
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
}