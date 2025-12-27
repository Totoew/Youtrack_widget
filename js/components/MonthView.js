export default class MonthView {
    constructor() {
        this.daysGrid = document.getElementById('daysGrid');
        this.monthEvents = document.querySelector('.month-events');
    }

    render(date, tasks) {
        this.daysGrid.innerHTML = '';
        this.monthEvents.innerHTML = '';

        this.eventsInRow = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []};

        this.createMonthCells(date);

        // Собираем задачи по дням
        const startCalendarDate = this.parseDate(this.daysGrid.children[0].dataset.date);
        const endCalendarDate = this.parseDate(this.daysGrid.children[41].dataset.date);

        const monthTasks = [];
        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            task.startDate = task.startDate || task.deadline;
            const startDate = task.startDate;
            const deadline = task.deadline;

            if (deadline >= startCalendarDate && deadline <= endCalendarDate ||
                startDate >= startCalendarDate && startDate <= endCalendarDate ) {
                monthTasks.push(task);
            }
        }

        monthTasks.sort((a, b) => a.deadline - b.startDate);

        this.renderTasks(monthTasks);
    }

    // Создаёт ячейки месяца
    createMonthCells(date) {
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

    // Создаёт ячейку одного дня
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

    // Отображает все события
    renderTasks(events) {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            this.createEventElement(event);
        }

        this.changeDayCells();
    }

    // Создаёт элемент события
    createEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = 'month-event';
        eventElement.textContent = event.summary || 'Без названия';
        
        switch (event.priority) {
            case 'Неотложная':
                eventElement.classList.add('show-stopper');
                break;
            case 'Критическая':
                eventElement.classList.add('critical');
                break;
            case 'Серьезная':
                eventElement.classList.add('major');
                break;
            case 'Обычная':
                eventElement.classList.add('normal');
                break;
        }

        // Добавляем тултип с полной информацией
        eventElement.title = this.createTaskTooltip(event);

        const [startRowIndex, startColumnIndex, endRowIndex, endColumnIndex] = this.createPositionIndex(event);

        eventElement.dataset.eventId = event.id;
        const border = eventElement.style.borderRight;

        for (let i = 0; i < endRowIndex - startRowIndex + 1; i++) {
            const startColumn = i === 0 ? startColumnIndex : 1;
            const endColumn = i === endRowIndex - startRowIndex ? endColumnIndex : 7;

            if (i > 0) {
                eventElement.style.borderLeft = 'none';
            }
            if (i !== endRowIndex - startRowIndex) {
                eventElement.style.borderRight = 'none';
            } else {
                eventElement.style.borderRight = border;
            }

            this.appendEvent(eventElement.cloneNode(true), startRowIndex + i, startColumn, endColumn);
        }
    }

    // Добавляет событие на страницу
    appendEvent(eventElement, row, startColumn, endColumn) {
        eventElement.style.gridRow = `${row}`;
        eventElement.style.gridColumn = `${startColumn} / span ${endColumn - startColumn + 1}`;
        eventElement.style.marginTop = `${45 + this.eventsInRow[row].length * 40}px`;

        eventElement.addEventListener('mouseenter', function() {
            const id = this.dataset.eventId;
            document.querySelectorAll(`[data-event-id="${id}"]`)
                .forEach(p => p.classList.add('hover'));
        });
        
        eventElement.addEventListener('mouseleave', function() {
            const id = this.dataset.eventId;
            document.querySelectorAll(`[data-event-id="${id}"]`)
                .forEach(p => p.classList.remove('hover'));
        });

        this.eventsInRow[row].push(eventElement);
        this.monthEvents.appendChild(eventElement);
    }

    // Создаёт всплывающую информацию
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

    // Находит позиции события
    createPositionIndex(event) {
        const {startDate, deadline} = event;

        let startRowIndex = 1;
        let startColumnIndex = 1;

        let endRowIndex = 6;
        let endColumnIndex = 7;

        const cellStart = document.querySelector(`[data-date="${startDate.toLocaleDateString()}"]`);
        if (cellStart) {
            const cellIndex = Array.from(this.daysGrid.children).indexOf(cellStart);
            startRowIndex = Math.ceil((cellIndex + 1) / 7);
            startColumnIndex = cellIndex % 7 + 1;
        }

        const cellEnd = document.querySelector(`[data-date="${deadline.toLocaleDateString()}"]`);
        if (cellEnd) {
            const cellIndex = Array.from(this.daysGrid.children).indexOf(cellEnd);
            endRowIndex = Math.ceil((cellIndex + 1) / 7);
            endColumnIndex = cellIndex % 7 + 1;
        }

        return [startRowIndex, startColumnIndex, endRowIndex, endColumnIndex];
    }

    // Меняет размеры дней под события 
    changeDayCells() {
        const computed = getComputedStyle(this.monthEvents);
        const rowValues = computed.gridTemplateRows.split(' ');
        const cells = this.daysGrid.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.style.height = rowValues[Math.floor(i / 7)];
        }
    }

    parseDate(dateString) {
        const [d, m, y] = dateString.split('.');
        const date = `${m}.${d}.${y}`;
        return new Date(date);
    }
}