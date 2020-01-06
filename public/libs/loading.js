(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
    define([], factory);
    } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    } else {
    root.loading = factory();
    }
    }(this, function () {
    return function (opts) {
    for (var name in opts) { this[name] = opts[name]; }
    var __mxOutput = {};
    
    
    var loading = (function() {
    
        loading = function (container, text) {
            //define a element for show loading 
            var mark = document.createElement('div');
            mark.style['width'] = '100%';
            mark.style['height'] = '100%';
            mark.style['background-color'] = '#000';
            mark.style['filter'] = 'alpha(opacity=50)';
            mark.style['-moz-opacity'] = '0.6';
            mark.style['opacity'] = '0.6';
            mark.style['position'] = 'absolute';
            mark.style['left'] = '0px';
            mark.style['top'] = '0px';
            mark.style['display'] = 'none';
            mark.style['z-index'] = '1000';
            mark.id = 'loading';
            container.appendChild(mark);
    
            var icon = document.createElement('p');
            icon.style['border'] = '5px solid #f3f3f3';
            icon.style['-webkit-animation'] = 'spin 1s linear infinite';
            icon.style['animation'] = 'spin 1s linear infinite';
            icon.style['border-top'] = '5px solid #555';
            icon.style['border-radius'] = '50%';
            icon.style['width'] = '25px';
            icon.style['height'] = '25px';
            icon.style['top'] = '40.3%';
            icon.style['left'] = '45%';
            icon.style['position'] = 'absolute';
            icon.id = 'icon';
            mark.appendChild(icon);

            var desc = document.createElement('span');
            desc.innerHTML = text;
            desc.style['font-family'] = 'SegoeUI-Semibold';
            desc.style['font-size'] = '20px';
            desc.style['color'] = '#ffffff';
            desc.style['top'] = '40%';
            desc.style['left'] = '47%';
            desc.style['position'] = 'absolute';
            desc.style['text-align'] = 'left';
            desc.id = 'desc';
            mark.appendChild(desc);

            
        }
    
        loading.prototype.show = function() {
            document.getElementById('loading').style.display = 'block';
        }
    
        loading.prototype.hide = function() {
            document.getElementById('loading').style.display = 'none';
        }
    
        return loading;
    }());
    
    
    __mxOutput.loading = typeof loading !== 'undefined' ? loading : undefined;
    return __mxOutput;
    };
    }));