/*
 * cHints — красивые и удобные всплывающие окна для вывода уведомлений на чистом JavaScript.
 * Скрипт создан Ильей Черемушкиным в 2012, http://cheremushkin.com.
 * Версия 1.0. Последнее обновление: 10.10.2012.
 * Распространяется в соответствии с лицензией GNU GPL.
 */
 
cHints = {
    // опции
    options: {
        max: 5, // максимальное кол-во открытых подсказок
        top: 10, // отступ для первой подсказки
        between: 5, // промежуток между подсказками
        
        timers: {
            fade: 250, // время на появление
            position: 250, // время на позиционирование
            life: 5000 // время существования
        }
    },
    
    
    
    // очереди
    queues: {
        all: [], // все подсказки
        open: [], // для открытия
        close: [] // для закрытия
    },
    
    
    
    // состояния открытия и закрытия
    is: {
        opening: false,
        closing: false,
        recursion: false
    },
    
    
    
    // открытие подсказки
    open: function(message, name) {
        // создание подсказки и добавление на страницу
        var hint = document.createElement('div');
        
        // настройки
        this.customize(hint, message, name);
 
        // добавление в массив подсказок
        this.queues.all.push(hint);
        
        // пополнение очереди, если страница перегружена или идет процесс закрытия подсказок
        // иначе вывод подсказки
        if (this.queues.all.length > this.options.max || this.is.recursion) {
            this.queues.open.push(hint);
            return false;
        } else {
            this.view(hint);
        };
    },
    
    
     
    // придание стилей и наполнение подсказки
    customize: function(hint, message, name) {
        hint.className = 'cHints ' + name;
        hint.innerHTML = message;
        hint.style.opacity = 0; // для fade эффекта
        
        hint.style.position = 'absolute';
        hint.style.right = 10 + 'px';
    },
    
    
    
    // вывод подсказок
    view: function(hint) {
        // позиционирование
        hint.style.top = this.options.top + 'px';
        
        // помещение на страницу и изменение отступа для след. окна
        document.body.appendChild(hint);
        this.options.top += hint.offsetHeight + this.options.between;
        
        // анимированный вывод
        Utils.animation.make({
            object: hint,
            styles: [
                {
                    name: 'opacity',
                    from: 0,
                    to: 1
                }
            ],
            
            properties: [
                {
                    duration: this.options.timers.fade,
                    callback: function() {
                        // выключение по таймауту или добавление в очередь
                        setTimeout(function() {
                            if (cHints.is.recursion) {
                                cHints.queues.close.push(hint);
                                return false;
                            } else {
                                cHints.close(hint);
                            };
                        }, cHints.options.timers.life);
                    }
                }
            ]
        });
    },
    
    
    
    // закрытие
    close: function(hint) {
        // запрет на параллельные процессы
        this.is.recursion = true;
        
        // анимированнованное удаление
        Utils.animation.make({
            object: hint,
            styles: [
                {
                    name: 'opacity',
                    from: 1,
                    to: 0
                }
            ],
            
            properties: [
                {
                    duration: cHints.options.timers.fade,
                    callback: function() {
                        var height = hint.offsetHeight, // константа, на которую сдвигаются подсказки
                            top = parseInt(hint.style.top, 10) + height + cHints.options.between; // отступ следующей подсказки
                        
                        // удаление элемента со страницы
                        document.body.removeChild(hint);
                        
                        // смещение всех элементов на высоту закрытой подсказки
                        // идентификатор закрываемой подсказки всегда 0 в силу постоянного сдвига массива
                        var size = cHints.queues.all.length - cHints.queues.open.length; // кол-во подсказок на странице
                        for (var i = 1; i < size; i++) {
                            // анимационный сдвиг
                            Utils.animation.make({
                                object: cHints.queues.all[i],
                                styles: [
                                    {
                                        name: 'top',
                                        from: top,
                                        to: top - height - cHints.options.between,
                                        suffix: 'px'
                                    }
                                ],
            
                                properties: [
                                    {
                                        duration: cHints.options.timers.position,
                                    }
                                ]
                            });
                                
                            top += parseInt(cHints.queues.all[i].offsetHeight, 10) + cHints.options.between;
                        };
                        
                        
                        
                        // операции, выполняемые после всех сдвигов
                        setTimeout(function() {
                            // изменение отступ для новой подсказки
                            cHints.options.top -= (height + 5);
                
                            // сдвиг и удаление закрывшейся подсказки из общего массива
                            cHints.queues.all.shift();
                            
                            if (!cHints.queues.close.length) cHints.is.recursion = false;
                            
                            // вывод новой подсказки и сдвиг очереди на появление
                            if (cHints.queues.open.length) {
                                cHints.view(cHints.queues.open.shift());
                            };
                            
                            if (cHints.queues.close.length) {
                                // задержка на время вывода подсказки
                                setTimeout(function() {
                                    // закрытие подсказки и сдвиг очереди на закрытие
                                    cHints.close(cHints.queues.close.shift());
                                }, cHints.options.timers.fade);
                            };
                        }, cHints.options.timers.position);
                    }
                }
            ]
        });
    }
};

Utils = {
    // универсальная анимация
    animation: {
        // массив объектов с информацией о запущенных анимациях
        queue: [],
        
        // выполнение функции
        make: function(params) {
            // обработка циклом каждого стиля
            for (var i = 0, size = params.styles.length; i < size; i++) {
                var style = params.styles[i],
                    properties = params.properties[i];
                
                // правка префиксов и суффиксов
                style.prefix = style.prefix || '';
                style.suffix = style.suffix || '';
                
                // создается новый объект в очереди
                var index = this.queue.length;
                this.queue[index] = {
                    object: params.object,
                    from: style.from,
                    to: style.to,
                    start: new Date().getTime(),
                    timeout: setTimeout(function() {
                        var now = new Date().getTime() - Utils.animation.queue[index].start,
                            progress = now / properties.duration,
                            result = (style.to - style.from) * progress + style.from;
                        
                        params.object.style[style.name] = style.prefix + result + style.suffix;
                        
                        if (progress < 1) {
                            Utils.animation.queue[index].timeout = setTimeout(arguments.callee, 0);
                        } else {
                            // фикс левых округлений
                            params.object.style[style.name] = style.prefix + style.to + style.suffix;
                        
                            // вызов callback
                            properties.callback && properties.callback();
                        };
                    }, 0)
                };
            };    
        }
    }
};