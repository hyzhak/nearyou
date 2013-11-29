define([
    'app/utils/getElementAbsolutePosition',
    'app/utils/requestAnimationFrame',
], function(getElementAbsolutePosition, requestAnimationFrame) {
    'use strict';
    var directive = function() {
        return function(scope, element, attrs) {
            var eventName = attrs['scrollToOnEvent'],
                lastSetScrollY,
                previousScroll = {},
                target = element.parent()[0];

            scope.$on(eventName, function() {
                var elementPosition = getElementAbsolutePosition(element[0]),
                    targetPosition = getElementAbsolutePosition(target);
                scrollToAnimation(elementPosition.y + target.scrollTop - targetPosition.y - target.clientHeight / 2);
//                scrollToAnimation(elementPosition.y - targetPosition.y - target.clientHeight / 2);
//                scrollToAnimation(position.y - window.innerHeight / 2);
            });

            function scrollToAnimation(pos) {
                var scrollIteration = buildScrollIteration(pos);
                requestAnimationFrame(scrollIteration);
                previousScroll.inProgress = false;
                previousScroll = scrollIteration;
            }

            function buildScrollIteration(pos) {
                pos = clamp(pos, 0, target.scrollHeight - target.clientHeight);
//                pos = clamp(pos, 0, document.body.scrollHeight - window.innerHeight);

                var iteration = function() {
//                    var currentPos = window.scrollY,
                    var currentPos = target.scrollTop,
                        delta = currentPos - pos,
                        step = 10;

                    if (-step < delta && delta < step || !iteration.inProgress) {
                        lastSetScrollY = Math.round(pos);
                    } else {
                        lastSetScrollY = Math.round(currentPos - delta/step);
                        if (Math.abs(delta/step)>1) {
                            requestAnimationFrame(iteration);
                        }
                    }
                    //window.scrollTo(0, lastSetScrollY);
                    target.scrollTop = lastSetScrollY;
                };

                iteration.inProgress = true;

                return iteration;
            }

            function clamp(value, min, max) {
                if (max < min) {
                    max = min;
                }

                return Math.max(min, Math.min(max, value));
            }
        }
    };

    directive.$inject = [];

    return directive;
});