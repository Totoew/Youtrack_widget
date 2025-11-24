class MonthView {
    constructor() {
        this.daysGrid = document.getElementById('daysGrid');
    }

    render(date) {
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
        
        // Пример события только для текущего месяца
        if (day === 15 && !isOtherMonth) {
            const event = document.createElement('div');
            event.className = 'event';
            event.textContent = 'Встреча';
            dayEvents.appendChild(event);
        }

        dayCell.appendChild(dayNumber);
        dayCell.appendChild(dayEvents);
        this.daysGrid.appendChild(dayCell);
    }
}