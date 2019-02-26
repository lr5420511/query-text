import 'babel-polyfill';
import Query from './query-text';

(win => {

    win.queryTexts = function () {
        return [].map.call(arguments, cur =>
            new Query(document.getElementById(cur[0]), cur[1])
        );
    };

})(window)