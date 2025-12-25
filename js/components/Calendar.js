import { makeProjectsList, makeTaskFieldsList } from "../make-header-lists.js";
import DayView from './DayView.js';
import MonthView from './MonthView.js';
import WeekView from './WeekView.js';

export default class Calendar {
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
        this.projectSelect = document.querySelector('.project-select');
        this.filterSelects = document.querySelectorAll('.filter-select');
        this.selectsHeaders = ['Подсистема', 'Исполнитель', 'Тип', 'Приоритет', 'Состояние', 'Срок', 'Затраченное время'];
        
        this.monthView = new MonthView();
        this.weekView = new WeekView();
        this.dayView = new DayView();

        this.projectNames = null;
        this.projectShortNames = null;
        this.projectTasksFields = null;
        this.allTasks = [];
        this.filteredTasks = [];
        
        this.init();
    }

    async init() {
        this.prevButton.addEventListener('click', () => this.navigate(-1));
        this.nextButton.addEventListener('click', () => this.navigate(1));
        this.todayButton.addEventListener('click', () => this.goToToday());
        
        this.viewButtons.forEach(button => {
            button.addEventListener('click', (e) => this.changeView(e.target.dataset.view));
        });

        const [projectNames, projectShortNames] = await makeProjectsList();
        this.projectNames = projectNames;
        this.projectShortNames = projectShortNames;
        
        await this.findTasks(this.projectShortNames[0]);
        this.populateSelects(false);

        this.filterSelects.forEach(select => {
            select.addEventListener('change', () => this.filterTasks());
        });

        this.projectSelect.addEventListener('change', async () => await this.changeProject());

        this.filterTasks();
    }

    async findTasks(shortName) {
        const [tasks, projectTasksFields] = await makeTaskFieldsList(shortName);
        this.projectTasksFields = projectTasksFields;
        this.allTasks = tasks;
    }

    async changeProject() {
        const value = this.projectSelect.value;
        await this.findTasks(value);
        this.populateSelects(true);
        this.filterTasks();
        this.render();
    }

    navigate(direction) {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else {
            // Для дневного вида перемещаемся по одному дню
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

    populateSelects(isProjectChanging) {
        const selects = {
            'subsystemSelect': this.projectTasksFields.subsystems,
            'executorSelect': this.projectTasksFields.executors,
            'typeSelect': this.projectTasksFields.types,
            'prioritySelect': this.projectTasksFields.priorities,
            'statusSelect': this.projectTasksFields.statuses,
            'deadlineSelect': this.projectTasksFields.deadlines,
            'timeSpentSelect': this.projectTasksFields.timeSpent
        };
        if (!isProjectChanging) {
            selects['projectSelect'] = this.projectNames;
        }

        Object.keys(selects).forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const childrenCount = selectId === 'projectSelect' ? 0 : 1;
                while (select.children.length > childrenCount) {
                    select.removeChild(select.lastChild);
                }
                
                selects[selectId].forEach(item => {
                    const option = document.createElement('option');
                    if (selectId === 'projectSelect') {
                        option.value = this.projectShortNames[this.projectNames.indexOf(item)];
                    }
                    option.textContent = item;
                    select.appendChild(option);
                });
            }
        });
    }

    filterTasks() {
        const filteredFields = {};
        this.filteredTasks = [];

        this.filterSelects.forEach(select => {
            if (!this.selectsHeaders.includes(select.value)) {
                filteredFields[select.id.replace('Select', '')] = select.value;
            }
        });

        if (Object.keys(filteredFields).length !== 0) {
            for (let i = 0; i < this.allTasks.length; i++) {
                let isFiltersMatching = false;
                const task = this.allTasks[i];
                for (const [key, value] of Object.entries(filteredFields)) {
                    if (key === 'deadline') {
                        const deadline = task.deadline;
                        isFiltersMatching = this.filterDeadline(deadline, value);
                    } else if (key === 'timeSpent') {
                        const timeSpent = task.timeSpent;
                        isFiltersMatching = this.filterTimeSpent(timeSpent, value);
                    }
                    else {
                        isFiltersMatching = task[key] === value;
                    }
                    if (!isFiltersMatching) break;
                }
                if (!isFiltersMatching) continue; 
                this.filteredTasks.push(task);
            }
        } else {
            this.filteredTasks = this.allTasks;
        }
        this.render();
    }

    render() {
        this.updatePeriodDisplay();
        if (this.currentView === 'month') {
            this.monthView.render(this.currentDate, this.filteredTasks);
        } else if (this.currentView === 'week') {
            this.weekView.render(this.currentDate, this.filteredTasks);
        } else if (this.currentView === 'day') {
            this.dayView.render(this.currentDate, this.filteredTasks);
        }
    }

    filterDeadline(deadline, value) {
        const currentDate = new Date();

        const getWeek = (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7)); 
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            return `${d.getFullYear()}-W${weekNo}`;
        };

        let isFilterMatching = false;

        switch (value) {
            case 'Вышел':
                isFilterMatching = currentDate.setHours(0, 0, 0, 0) > deadline.setHours(0, 0, 0, 0);
                break;
            case 'Сегодня':
                isFilterMatching = deadline.toLocaleDateString() === currentDate.toLocaleDateString();
                break;
            case 'Завтра':
                isFilterMatching = (Math.abs(currentDate.setHours(0, 0, 0, 0) - deadline.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)) === 1;
                break;
            case 'На этой неделе':
                isFilterMatching = getWeek(deadline) === getWeek(currentDate);
                break;
            case 'На следующей неделе':
                const deadlineResult = getWeek(deadline).split('W');
                const currentResult = getWeek(currentDate).split('W');
                isFilterMatching = deadlineResult[0] === currentResult[0] && Number(currentResult[1]) === Number(deadlineResult[1]) - 1;
                break;
            case 'В этом месяце':
                isFilterMatching = deadline.toLocaleDateString().slice(3) === currentDate.toLocaleDateString().slice(3);
                break
            default:
                break;
        }

        return isFilterMatching;
    }

    filterTimeSpent(timeSpent, value) {
        let isFilterMatching = false;
        if (value === 'Не указано') {
            isFilterMatching = timeSpent === null;
        }
        else if (timeSpent !== null) {
            const times = timeSpent.split(' ');
            let hours = 0;
            for (let i = 0; i < times.length; i++) {
                const time = times[i];
                if (time.includes('н')) hours += Number(time.replace('н', '')) * 40;
                else if (time.includes('д')) hours += Number(time.replace('д', '')) * 8;
                else if (time.includes('ч')) hours += Number(time.replace('ч', ''));
            }

            if (value === 'Меньше суток') isFilterMatching = hours <= 8;
            else if (value === 'От 1 до 3 дней') isFilterMatching = 8 < hours && hours <= 24;
            else if (value === 'От 3 до 10 дней') isFilterMatching = 24 < hours && hours < 64;
            else if (value === 'От 10 дней до месяца') isFilterMatching = 64 < hours && hours <= 160;
            else if (value === 'Больше месяца') isFilterMatching = 160 < hours;
        } 
        return isFilterMatching;
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