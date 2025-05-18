document.addEventListener('DOMContentLoaded', function() {
    // Обновление текущего времени
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', {hour12: false});
        document.getElementById('current-time').textContent = timeString;
    }
    
    setInterval(updateTime, 1000);
    updateTime();

    // Обработка кнопок экспирации
    const expiryButtons = document.querySelectorAll('.expiry-btn');
    expiryButtons.forEach(button => {
        button.addEventListener('click', function() {
            expiryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Инициализация адаптивного графика
    let chart = initResponsiveChart();
    
    // Обработчики для ресайза
    window.addEventListener('resize', function() {
        if (chart) {
            chart.resize();
        }
    });

    // Элементы управления
    const getSignalBtn = document.getElementById('get-signal-btn');
    const analyzingContainer = document.getElementById('analyzing-container');
    const signalResult = document.getElementById('signal-result');
    
    // Генерация сигнала
    getSignalBtn.addEventListener('click', function() {
        // Начало процесса
        this.classList.add('hidden');
        analyzingContainer.classList.remove('hidden');
        signalResult.classList.add('hidden');
        
        // Имитация анализа (3 секунды)
        setTimeout(() => {
            analyzingContainer.classList.add('hidden');
            generateSignal();
            startExpiryCountdown();
        }, 3000);
    });
    
    // Генерация сигнала
    function generateSignal() {
        const activeExpiryBtn = document.querySelector('.expiry-btn.active');
        const expiryTime = parseInt(activeExpiryBtn.dataset.time);
        const isUp = Math.random() > 0.5;
        const percent = Math.floor(Math.random() * 35) + 80; // 75-95%
        
        // Обновление данных
        document.getElementById('traders-percent').textContent = `${percent}%`;
        document.getElementById('traders-direction').textContent = 
            `на ${isUp ? 'повышение' : 'понижение'}`;
        document.getElementById('expiry-time').textContent = 
            `через ${expiryTime} сек`;
        
        // Направление
        const directionBlock = document.getElementById('final-direction');
        directionBlock.className = 'final-direction ' + (isUp ? 'up' : 'down');
        document.getElementById('direction-text').textContent = 
            isUp ? 'ПОВЫШЕНИЕ' : 'ПОНИЖЕНИЕ';
        
        // Иконка
        const icon = directionBlock.querySelector('i');
        icon.className = isUp ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        
        // Обновление графика
        updateChartDirection(chart, isUp);
        
        // Показ результата
        signalResult.classList.remove('hidden');
    }
    
    // Таймер экспирации
    function startExpiryCountdown() {
        const activeExpiryBtn = document.querySelector('.expiry-btn.active');
        const expiryTime = parseInt(activeExpiryBtn.dataset.time);
        const timeLeftElement = document.getElementById('time-left');
        const getSignalBtn = document.getElementById('get-signal-btn');
        let remaining = expiryTime;
        
        updateTimeDisplay();
        
        const countdown = setInterval(() => {
            remaining--;
            updateTimeDisplay();
            
            if (remaining <= 0) {
                clearInterval(countdown);
                setTimeout(() => {
                    signalResult.classList.add('hidden');
                    getSignalBtn.classList.remove('hidden');
                }, 500);
            }
        }, 1000);
        
        function updateTimeDisplay() {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            timeLeftElement.textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    // Инициализация графика
    function initResponsiveChart() {
        const ctx = document.getElementById('price-chart').getContext('2d');
    
    // Генерация данных без привязки к реальным ценам
    const labels = Array.from({length: 85}, (_, i) => '');
    let lastValue = 50 + Math.random() * 10; // Стартовое значение
    
    const data = labels.map(() => {
        lastValue += Math.random() * 3 - 1; // Случайные колебания
        return lastValue;
    });

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: '#6c5ce7',
                borderWidth: 2,
                tension: 0.1,
                fill: false,
                pointRadius: 0,
                borderJoinStyle: 'round'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false // Отключаем подсказки
                }
            },
            scales: {
                x: {
                    display: false, // Скрываем ось X
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: false, // Скрываем ось Y
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });

    }
    
    // Обновление направления графика
    function updateChartDirection(chart, isUp) {
    const steps = 30; // Количество шагов анимации
    const duration = 2000; // Продолжительность анимации в ms
    const stepTime = duration / steps;
    let step = 0;
    
    // Остановить обычное обновление графика
    clearInterval(chartUpdateInterval);
    
    const animate = () => {
        if (step >= steps) {
            // Возобновить обычное обновление после анимации
            chartUpdateInterval = setInterval(updateChartRandomly, 2000);
            return;
        }
        
        const currentData = chart.data.datasets[0].data;
        const change = isUp ? Math.random() * 3 : -Math.random() * 3;
        const newValue = currentData[currentData.length - 1] + change;
        
        chart.data.labels.push('');
        chart.data.labels.shift();
        currentData.push(newValue);
        currentData.shift();
        
        chart.update();
        step++;
        setTimeout(animate, stepTime);
    };
    
    animate();
}

// Замените ваш setInterval в конце кода на:
let chartUpdateInterval;
function updateChartRandomly() {
    if (!chart) return;
    
    const currentData = chart.data.datasets[0].data;
    const newValue = currentData[currentData.length - 1] + (Math.random() * 0.4 - 0.2);
    
    chart.data.labels.push('');
    chart.data.labels.shift();
    currentData.push(newValue);
    currentData.shift();
    
    chart.update();
}

chartUpdateInterval = setInterval(updateChartRandomly, 2000);
