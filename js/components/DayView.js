class DayView {
    constructor() {
        this.dayGrid = document.getElementById('dayGrid');
    }

    render(date) {
        this.dayGrid.innerHTML = '';
        
        const today = new Date();
        const isToday = this.isSameDay(date, today);
        
        this.createDayCell(date, isToday);
    }

    createDayCell(date, isToday) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell-single';
        
        if (isToday) {
            dayCell.classList.add('today');
        }

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header-single';
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name-single';
        
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
        
        dayName.textContent = `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        
        const timeSlots = document.createElement('div');
        timeSlots.className = 'time-slots';
        
        // Создаем временные слоты с 00:00 до 23:00
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
            
            const eventContainer = document.createElement('div');
            eventContainer.className = 'event-container';
            
            // Добавляем пример события
            if (hour === 10) {
                const event = document.createElement('div');
                event.className = 'event';
                event.textContent = 'Ежедневная планерка';
                eventContainer.appendChild(event);
            }
            
            if (hour === 14) {
                const event = document.createElement('div');
                event.className = 'event';
                event.textContent = 'Встреча с клиентом';
                eventContainer.appendChild(event);
            }
            
            if (hour === 16) {
                const event = document.createElement('div');
                event.className = 'event';
                event.textContent = 'Код-ревью';
                eventContainer.appendChild(event);
            }
            
            timeSlot.appendChild(timeLabel);
            timeSlot.appendChild(eventContainer);
            timeSlots.appendChild(timeSlot);
        }

        dayHeader.appendChild(dayName);
        dayCell.appendChild(dayHeader);
        dayCell.appendChild(timeSlots);
        this.dayGrid.appendChild(dayCell);
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
}