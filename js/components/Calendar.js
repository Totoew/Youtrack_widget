class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'week';
        this.periodDisplay = document.querySelector('.period-display');
        this.prevButton = document.querySelector('.prev-button');
        this.nextButton = document.querySelector('.next-button');
        this.todayButton = document.querySelector('.today-button');
        this.viewButtons = document.querySelectorAll('.view-button');
        this.viewContainers = {
            month: document.getElementById('monthView'),
            week: document.getElementById('weekView'),
            day: document.getElementById('dayView')
        };
        
        this.monthView = new MonthView();
        this.weekView = new WeekView();
        this.dayView = new DayView();
        
        this.init();
    }

    init() {
        this.prevButton.addEventListener('click', () => this.navigate(-1));
        this.nextButton.addEventListener('click', () => this.navigate(1));
        this.todayButton.addEventListener('click', () => this.goToToday());
        
        this.viewButtons.forEach(button => {
            button.addEventListener('click', (e) => this.changeView(e.target.dataset.view));
        });

        this.populateSelects();
        this.render();
    }

    navigate(direction) {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + direction);
        }
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    changeView(view) {
        this.currentView = view;
        
        this.viewButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.view === view);
        });
        
        Object.keys(this.viewContainers).forEach(key => {
            this.viewContainers[key].style.display = key === view ? 'block' : 'none';
        });
        
        this.render();
    }

    populateSelects() {
        const selects = {
            'projectSelect': mockData.projects,
            'subsystemSelect': mockData.subsystems,
            'executorSelect': mockData.executors,
            'typeSelect': mockData.types,
            'prioritySelect': mockData.priorities,
            'statusSelect': mockData.statuses,
            'deadlineSelect': mockData.deadlines,
            'timeSpentSelect': mockData.timeSpent
        };

        Object.keys(selects).forEach(selectId => {
            const select = document.querySelector(`#${selectId}`) || document.querySelector(`.${selectId}`);
            if (select) {
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                
                selects[selectId].forEach(item => {
                    const option = document.createElement('option');
                    option.value = item;
                    option.textContent = item;
                    select.appendChild(option);
                });
            }
        });
    }

    render() {
        this.updatePeriodDisplay();
        
        if (this.currentView === 'month') {
            this.monthView.render(this.currentDate);
        } else if (this.currentView === 'week') {
            this.weekView.render(this.currentDate);
        } else if (this.currentView === 'day') {
            this.dayView.render(this.currentDate);
        }
    }

    updatePeriodDisplay() {
        if (this.currentView === 'month') {
            const months = [
                'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
            ];
            const month = months[this.currentDate.getMonth()];
            const year = this.currentDate.getFullYear();
            this.periodDisplay.textContent = `${month} ${year}`;
        } else if (this.currentView === 'week') {
            const weekRange = this.getWeekRange(this.currentDate);
            this.periodDisplay.textContent = `${weekRange.month} ${weekRange.start}-${weekRange.end}`;
        } else if (this.currentView === 'day') {
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
            const dayName = days[this.currentDate.getDay()];
            const day = this.currentDate.getDate();
            const month = months[this.currentDate.getMonth()];
            const year = this.currentDate.getFullYear();
            this.periodDisplay.textContent = `${dayName}, ${day} ${month} ${year}`;
        }
    }

    getWeekRange(date) {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        const month = months[startOfWeek.getMonth()];
        
        return {
            start: startOfWeek.getDate(),
            end: endOfWeek.getDate(),
            month: month
        };
    }
}