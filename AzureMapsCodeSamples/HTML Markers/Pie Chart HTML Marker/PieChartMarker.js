/*
 * Copyright(c) 2018 Microsoft Corporation. All rights reserved.
 *
 * This code is licensed under the MIT License (MIT).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/
/// <reference path="../../Common/typings/azure-maps-control.d.ts"/>
/**
 * A class for creating Pie Charts as Markers on a map.
 * In addition to the options, there is also two CSS classes that can be customized:
 *  - pieChartTooltip - Styles the tooltip div.
 *  - pieChartText - Styles the text that renders in the center of the pie chart when the 'text' option is set.
 */
class PieChartMarker extends atlas.HtmlMarker {
    /********************
    * Constructor
    ********************/
    /**
     * Creates an HTML Marker in the shape of a pie chart.
     * @param options Options for rendering the Pie Chart marker.
     * @param tooltipCallback A callback handler which defines the value of a tooltip for a slice of the pie.
     */
    constructor(options, tooltipCallback) {
        super(options);
        /********************
        * Private Properties
        ********************/
        this.chartOptions = {
            values: [],
            radius: 40,
            colors: ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099'],
            strokeThickness: 0,
            strokeColor: '#666666',
            innerRadius: 0,
            color: 'white'
        };
        this.totalValue = 0;
        /********************
        * Public Methods
        ********************/
        /** Any additional properties that you want to store with the marker. */
        this.properties = {};
        super.setOptions({
            htmlContent: document.createElement('div'),
            pixelOffset: [0, 0]
        });
        this.tooltipCallback = tooltipCallback;
        this.addCssClassIfDoesntExist('pieChartTooltip', '{background: white;border: 1px solid black;border-radius: 5px;padding: 5px;}');
        this.addCssClassIfDoesntExist('pieChartText', '{font-size:16px;font-family:arial;fill:#00000;font-weight:bold;}');
        this.tooltip = document.getElementById('pieChartTooltip');
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.id = 'pieChartTooltip';
            this.tooltip.style.position = 'absolute';
            this.tooltip.style.display = 'none';
            this.tooltip.className = 'pieChartTooltip';
        }
        document.body.appendChild(this.tooltip);
        this.setOptions(options);
    }
    /**
     * Gets the total value of all slices summed togehter.
     * @returns The total value of all slices summed togehter.
     */
    getTotalValue() {
        return this.totalValue;
    }
    /**
     * Gets the value of a slice of the pie based on it's index.
     * @param idx The index of the slice.
     * @returns The value of a slice of the pie based on it's index.
     */
    getSliceValue(idx) {
        return (idx >= 0 && idx < this.chartOptions.values.length) ? this.chartOptions.values[idx] : 0;
    }
    /**
     * Gets the percentage value of a slice of the pie based on it's index.
     * @param idx The index of the slice.
     * @returns The percentage value of a slice of the pie based on it's index.
     */
    getSlicePercentage(idx) {
        return (this.totalValue > 0) ? Math.round(this.getSliceValue(idx) / this.totalValue * 10000) / 100 : 0;
    }
    /**
     * Gets the options of the pie chart marker.
     * @returns The options of the pie chart marker.
     */
    getOptions() {
        return this.merge_options(super.getOptions(), this.chartOptions);
    }
    /**
     * Sets the options of the pie chart marker.
     * @param options The options to set on the marker.
     */
    setOptions(options) {
        var rerender = false;
        if (options.radius && options.radius > 0 && options.radius != this.chartOptions.radius) {
            this.chartOptions.radius = options.radius;
            rerender = true;
        }
        if (options.innerRadius && options.innerRadius > 0 && options.innerRadius != this.chartOptions.innerRadius) {
            this.chartOptions.innerRadius = options.innerRadius;
            rerender = true;
        }
        if (options.strokeThickness && options.strokeThickness > 0 && options.strokeThickness != this.chartOptions.strokeThickness) {
            this.chartOptions.strokeThickness = options.strokeThickness;
            rerender = true;
        }
        if (options.colors && JSON.stringify(options.colors) !== JSON.stringify(this.chartOptions.colors)) {
            this.chartOptions.colors = options.colors;
            rerender = true;
        }
        if (options.color && JSON.stringify(options.color) !== JSON.stringify(this.chartOptions.color)) {
            this.chartOptions.color = options.color;
            rerender = true;
        }
        if (options.strokeColor && options.strokeColor !== this.chartOptions.strokeColor) {
            this.chartOptions.strokeColor = options.strokeColor;
            rerender = true;
        }
        if (options.tooltipCallback !== undefined && this.tooltipCallback != options.tooltipCallback) {
            this.tooltipCallback = options.tooltipCallback;
            rerender = true;
        }
        if (options.values && JSON.stringify(options.values) !== JSON.stringify(this.chartOptions.values)) {
            this.chartOptions.values = options.values;
            rerender = true;
        }
        if (options.metadata !== undefined) {
            this.chartOptions.metadata = options.metadata;
            rerender = true;
        }
        if (options.text && options.text !== this.chartOptions.text) {
            rerender = true;
        }
        if (options.htmlContent !== undefined) {
            options.htmlContent = null;
        }
        if (rerender) {
            this.render();
        }
        super.setOptions(options);
    }
    /********************
    * Private Methods
    ********************/
    render() {
        var startAngle = 0, angle = 0;
        var data = this.chartOptions.values;
        var radius = this.chartOptions.radius;
        if (data) {
            this.totalValue = data.reduce(function (a, b) {
                return a + b;
            }, 0);
            //Ensure that there are enough colors defined.
            while (data.length > this.chartOptions.colors.length) {
                this.chartOptions.colors.push('rgb(' + Math.round(Math.random() * 150 + 150) + ',' + Math.round(Math.random() * 150 + 150) + ',' + Math.round(Math.random() * 150 + 150) + ')');
            }
            var diameter = 2 * (radius + this.chartOptions.strokeThickness);
            var svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="', diameter, 'px" height="', diameter, 'px" style="cursor:pointer">'];
            var cx = radius + this.chartOptions.strokeThickness, cy = radius + this.chartOptions.strokeThickness;
            var tooltip = '';
            if (this.totalValue > 0) {
                for (var i = 0; i < data.length; i++) {
                    angle = (Math.PI * 2 * (data[i] / this.totalValue));
                    if (this.tooltipCallback) {
                        tooltip = this.tooltipCallback(this, i);
                    }
                    svg.push(this.createArc(cx, cy, radius, startAngle, angle, this.chartOptions.colors[i], tooltip));
                    startAngle += angle;
                }
            }
            if (this.chartOptions.innerRadius > 0) {
                svg.push('<circle r="', this.chartOptions.innerRadius, '" cx="', cx, '" cy="', cy, '" fill="', this.chartOptions.color, '" />');
            }
            var text = this.getOptions().text;
            if (text) {
                svg.push('<text x="', cx, '" y="', (cy + 7), '" class="pieChartText" text-anchor="middle">', text, '</text>');
            }
            svg.push('</svg>');
            super.getOptions().htmlContent.innerHTML = svg.join('');
        }
    }
    createArc(cx, cy, r, startAngle, angle, fillColor, tooltip) {
        if (angle > 2 * Math.PI * 0.99) {
            //If the shape is nearly a complete circle, create a circle instead of an arc.
            var path = [
                '<circle r="', r, '" cx="', cx, '" cy="', cy, '" ',
                'style="fill:', fillColor,
                ';stroke:', this.chartOptions.strokeColor,
                ';stroke-width:', this.chartOptions.strokeThickness,
                'px;" onmousemove="PieChartMarker.__showTooltip(evt, \'', tooltip,
                '\');" onmouseout="PieChartMarker.__hideTooltip();" /> '
            ];
            return path.join('');
        }
        else {
            var x1 = cx + r * Math.sin(startAngle);
            var y1 = cy - r * Math.cos(startAngle);
            var x2 = cx + r * Math.sin(startAngle + angle);
            var y2 = cy - r * Math.cos(startAngle + angle);
            //Flag for when arcs are larger than 180 degrees in radians.
            var big = 0;
            if (angle > Math.PI) {
                big = 1;
            }
            var path = [
                '<path d="M ', cx, ' ', cy, ' L ', x1, ' ', y1, ' A ', r, ',', r, ' 0 ', big, ' 1 ', x2, ' ', y2,
                ' Z" style="fill:', fillColor,
                ';stroke:', this.chartOptions.strokeColor,
                ';stroke-width:', this.chartOptions.strokeThickness,
                'px;" onmousemove="PieChartMarker.__showTooltip(evt, \'', tooltip,
                '\');" onmouseout="PieChartMarker.__hideTooltip();" /> '
            ];
            return path.join('');
        }
    }
    /**
     * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
     * @param obj1
     * @param obj2
     * @returns obj3 a new object based on obj1 and obj2
     */
    merge_options(obj1, obj2) {
        var obj3 = {};
        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }
        for (var attrname in obj2) {
            obj3[attrname] = obj2[attrname];
        }
        return obj3;
    }
    addCssClassIfDoesntExist(className, style) {
        if (!document.getElementsByClassName(className).length) {
            var cssClass = document.createElement('style');
            cssClass.innerHTML = '.' + className + style;
            document.body.appendChild(cssClass);
        }
    }
    static __showTooltip(evt, text) {
        if (text) {
            if (PieChartMarker.__timeoutHandler !== 0) {
                clearTimeout(PieChartMarker.__timeoutHandler);
                PieChartMarker.__timeoutHandler = 0;
            }
            var tooltip = document.getElementById('pieChartTooltip');
            tooltip.innerHTML = text;
            tooltip.style.display = 'block';
            tooltip.style.left = evt.pageX + 10 + 'px';
            tooltip.style.top = evt.pageY + 10 + 'px';
            PieChartMarker.__timeoutHandler = setTimeout(() => {
                PieChartMarker.__hideTooltip();
            }, 5000);
        }
    }
    static __hideTooltip() {
        var tooltip = document.getElementById('pieChartTooltip');
        tooltip.style.display = 'none';
        PieChartMarker.__timeoutHandler = 0;
    }
}
/********************
 * Static Methods
 ********************/
PieChartMarker.__timeoutHandler = 0;
//# sourceMappingURL=PieChartMarker.js.map