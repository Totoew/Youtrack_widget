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
        this.render();
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
                    isFiltersMatching = task[key] === value;
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