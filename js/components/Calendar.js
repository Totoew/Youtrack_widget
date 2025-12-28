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
        
        this.monthView = new MonthView();
        this.weekView = new WeekView();
        this.dayView = new DayView();

        this.projects = {};
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
        
        await this.findTasks(this.projectShortNames);
        this.populateSelects(false);
        this.addListeners();

        this.filterTasks();
    }

    async findTasks(shortNames) {
        for (let i = 0; i < shortNames.length; i++) {
            const [allTasks, projectTasksFields] = await makeTaskFieldsList(shortNames[i]);
            this.projects[shortNames[i]] = {
                'allTasks': allTasks,
                'projectsTasksFields': projectTasksFields
            };
        }
        
        const [allTasks, projectTasksFields] = this.mergeProjectFields(shortNames);
        this.allTasks = allTasks;
        this.projectTasksFields = projectTasksFields;
    }

    async changeProject(shortNames) {
        const [allTasks, projectTasksFields] = this.mergeProjectFields(shortNames);
        this.allTasks = allTasks;
        this.projectTasksFields = projectTasksFields;
        
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
            'subsystem': this.projectTasksFields.subsystems,
            'executor': this.projectTasksFields.executors,
            'type': this.projectTasksFields.types,
            'priority': this.projectTasksFields.priorities,
            'status': this.projectTasksFields.statuses,
            'deadline': this.projectTasksFields.deadlines,
            'timeSpent': this.projectTasksFields.timeSpent
        };
        if (!isProjectChanging) {
            selects['project'] = this.projectNames;
        }

        for (const [filterId, options] of Object.entries(selects)) {
            const container = document.getElementById(`${filterId}Options`);
            if (!container) continue;
            if (!options) continue;
            
            container.innerHTML = options.map(option => `
                <div class="option-item">
                    <input type="checkbox" 
                        id="${filterId}_${option}" 
                        value="${filterId === 'project' ? this.projectShortNames[this.projectNames.indexOf(option)] : option}"
                        data-filter="${filterId}">
                    <label for="${filterId}_${option}">${option}</label>
                </div>
            `).join('');
        }
    }

    addListeners() {
        // Открытие/закрытие фильтров
        document.querySelectorAll('.filter-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const group = header.parentElement;
                group.classList.toggle('active');
                
                // Закрываем другие открытые фильтры
                document.querySelectorAll('.filter-group').forEach(otherGroup => {
                    if (otherGroup !== group && otherGroup.classList.contains('active')) {
                        otherGroup.classList.remove('active');
                    }
                });
            });
        });

        // Закрытие фильтров при клике вне их
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-group')) {
                document.querySelectorAll('.filter-group').forEach(group => {
                    group.classList.remove('active');
                });
            }
        });

        let debounceTimer;
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const filterName = e.target.closest('.filter-options').id.replace('Options', '');

                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {}, 300);

                const checkedValues = Array.from(
                    document.querySelectorAll(`#${filterName}Options input:checked`)
                ).map(cb => cb.value);
                    
                if (filterName !== 'project') {
                    this.filterTasks(filterName, checkedValues);
                } else {
                    this.changeProject(checkedValues);
                }
            }
        });
    }

    filterTasks(filterName = '', checkedValues = []) {
        this.filteredTasks = [];

        if (filterName) {
            for (let i = 0; i < this.allTasks.length; i++) {
                let isFiltersMatching = false;
                const task = this.allTasks[i];
                if (filterName === 'deadline') {
                    isFiltersMatching = this.filterDeadline(task.deadline, checkedValues);
                } else if (filterName === 'timeSpent') {
                    isFiltersMatching = this.filterTimeSpent(task.timeSpent, checkedValues);
                } else {
                    isFiltersMatching = task[filterName] === null ? checkedValues.includes('Не указано') : checkedValues.includes(task[filterName]);
                }
                if (isFiltersMatching) this.filteredTasks.push(task);
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

    filterDeadline(deadline, values) {
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

        for (let i = 0; i < values.length; i++) {
            const value = values[i];
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
        }

        return isFilterMatching;
    }

    filterTimeSpent(timeSpent, values) {
        let isFilterMatching = false;

        for (let i = 0; i < values.length; i++) {
            const value = values[i];

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
        } 

        return isFilterMatching;
    }

    mergeProjectFields(shortNames) {
        const mergeAsSet = (obj1, obj2) => {
            const result = {};
            Object.keys(obj2).forEach(key => {
                if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
                    result[key] = [...new Set([...obj1[key], ...obj2[key]])];
                } 
            });
            return result;
        };

        let allTasks = [];
        let projectsTasksFields = {};

        if (shortNames.length > 0) {
            allTasks = this.projects[shortNames[0]].allTasks;
            projectsTasksFields = this.projects[shortNames[0]].projectsTasksFields;

            if (shortNames.length > 1) {
                for (let i = 1; i < shortNames.length; i++) {
                    allTasks = [...allTasks, ...this.projects[shortNames[i]].allTasks];
                    projectsTasksFields = mergeAsSet(projectsTasksFields, this.projects[shortNames[i]].projectsTasksFields);
                }
            }
        } 

        return [allTasks, projectsTasksFields];
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