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
    queues:{all:[],open:[],close:[]},is:{opening:false,closing:false,recursion:false},open:function(a,b){var c=document.createElement('div');this.customize(c,a,b);this.queues.all.push(c);if(this.queues.all.length>this.options.max||this.is.recursion){this.queues.open.push(c);return false}else{this.view(c)}},customize:function(a,b,c){a.className='cHints '+c;a.innerHTML=b;a.style.opacity=0;a.style.position='absolute';a.style.right=10+'px'},view:function(a){a.style.top=this.options.top+'px';document.body.appendChild(a);this.options.top+=a.offsetHeight+this.options.between;Utils.animation.make({object:a,styles:[{name:'opacity',from:0,to:1}],properties:[{duration:this.options.timers.fade,callback:function(){setTimeout(function(){if(cHints.is.recursion){cHints.queues.close.push(a);return false}else{cHints.close(a)}},cHints.options.timers.life)}}]})},close:function(c){this.is.recursion=true;Utils.animation.make({object:c,styles:[{name:'opacity',from:1,to:0}],properties:[{duration:cHints.options.timers.fade,callback:function(){var a=c.offsetHeight,top=parseInt(c.style.top,10)+a+cHints.options.between;document.body.removeChild(c);var b=cHints.queues.all.length-cHints.queues.open.length;for(var i=1;i<b;i++){Utils.animation.make({object:cHints.queues.all[i],styles:[{name:'top',from:top,to:top-a-cHints.options.between,suffix:'px'}],properties:[{duration:cHints.options.timers.position,}]});top+=parseInt(cHints.queues.all[i].offsetHeight,10)+cHints.options.between};setTimeout(function(){cHints.options.top-=(a+5);cHints.queues.all.shift();if(!cHints.queues.close.length)cHints.is.recursion=false;if(cHints.queues.open.length){cHints.view(cHints.queues.open.shift())};if(cHints.queues.close.length){setTimeout(function(){cHints.close(cHints.queues.close.shift())},cHints.options.timers.fade)}},cHints.options.timers.position)}}]})}
};

Utils={animation:{queue:[],make:function(b){for(var i=0,size=b.styles.length;i<size;i++){var c=b.styles[i],properties=b.properties[i];c.prefix=c.prefix||'';c.suffix=c.suffix||'';var d=this.queue.length;this.queue[d]={object:b.object,from:c.from,to:c.to,start:new Date().getTime(),timeout:setTimeout(function(){var a=new Date().getTime()-Utils.animation.queue[d].start,progress=a/properties.duration,result=(c.to-c.from)*progress+c.from;b.object.style[c.name]=c.prefix+result+c.suffix;if(progress<1){Utils.animation.queue[d].timeout=setTimeout(arguments.callee,0)}else{b.object.style[c.name]=c.prefix+c.to+c.suffix;properties.callback&&properties.callback()}},0)}}}}};