function dateSelector(param) {
    var now = new Date()
    var now_year = now.getFullYear()
    var now_date = now.getDate()
    var now_month = now.getMonth() + 1
    var now_weekday = now.getDay()
    if (param.type === "month") {
        addMonthSelector(param)
    } else if (param.type === "date") {
        addDateSelector(param)
    }
}
function timeFormat(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + "-" + m + "-" + d;
}
function addMonthSelector(param) {
    var years = []
    var selector = ""
	/*selector += "<div class='month-selector' style='display: none;'><p class='option-label'>年份</p><div class='year-option'>"
	selector += "<span class='year-option-span' id='2019'>2019</span>"
	selector += "<span class='year-option-span' id='2020'>2020</span>"
	selector += "</div><div class='split-line'></div><p class='option-label'>月份</p><div class='month-option'>"
	for (var m = 0; m < 12; m++) {
		var month = m + 1
		selector += "<span class='month-option-span' id=" + month + ">" + month + "月</span>"
	}
	selector += "</div></div>"
    $(param.container).html(selector)*/
    if (param.allow_year === "byData") {
        $.get("/music/history", function (data, err) {
            if (data.code === 0) {
                data = data.data;
                for (var i = 0; i < data.length; i++) {
                    var date = data[i].date.split('-')
                    if ($.inArray(date[0], years) == -1) {
                        years.push(date[0])
                    }
                }
                selector += "<div class='month-selector' style='display: none;'><p class='option-label'>年份</p><div class='year-option'>"
                for (var a = 0; a < years.length; a++) {
                    selector += "<span class='year-option-span' id=" + years[a] + ">" + years[a] + "</span>"
                }
                selector += "</div><div class='split-line'></div><p class='option-label'>月份</p><div class='month-option'>"
                if (param.allow_month === "all") {
                    for (var m = 0; m < 12; m++) {
                        var month = m + 1
                        selector += "<span class='month-option-span' id=" + month + ">" + month + "月</span>"
                    }
                }
                selector += "</div></div>"
                $(param.container).html(selector)
            };
        });
    }
}

function PrefixInteger(num, length) {
    return (Array(length).join('0') + num).slice(-length);
}

function addDateSelector(param) {
    var now = new Date()
    var now_year = now.getFullYear()
    var now_date = now.getDate()
    var now_month = now.getMonth() + 1
    var now_weekday = now.getDay()
    if (now_weekday == 0) {
        now_weekday = 7
    }
    var container = param.container
    var selector = "<div class='date-selector date future' style='display: none;'><div class='param' style='display: none;'>" + JSON.stringify(param) + "</div><div class='year-and-month'><span class='btn' id='prev-year'>«</span><span class='btn' id='prev-month'>‹</span><span class='text' id='year-month'></span><span class='btn active' id='next-month'>›</span><span class='btn active' id='next-year'>»</span></div><div class='calendar-content'><p class='calendar-row' id='title'><span class='calendar-row-title' id='1'>一</span><span class='calendar-row-title' id='2'>二</span><span class='calendar-row-title' id='3'>三</span><span class='calendar-row-title' id='4'>四</span><span class='calendar-row-title' id='5'>五</span><span class='calendar-row-title' id='6'>六</span><span class='calendar-row-title' id='7'>日</span></p><p class='calendar-row' id='1'><span class='calendar-row-1 calendar-item' id='1'></span><span class='calendar-row-1 calendar-item' id='2'></span><span class='calendar-row-1 calendar-item' id='3'></span><span class='calendar-row-1 calendar-item' id='4'></span><span class='calendar-row-1 calendar-item' id='5'></span><span class='calendar-row-1 calendar-item' id='6'></span><span class='calendar-row-1 calendar-item' id='7'></span></p><p class='calendar-row' id='2'><span class='calendar-row-2 calendar-item' id='1'></span><span class='calendar-row-2 calendar-item' id='2'></span><span class='calendar-row-2 calendar-item' id='3'></span><span class='calendar-row-2 calendar-item' id='4'></span><span class='calendar-row-2 calendar-item' id='5'></span><span class='calendar-row-2 calendar-item' id='6'></span><span class='calendar-row-2 calendar-item' id='7'></span></p><p class='calendar-row' id='3'><span class='calendar-row-3 calendar-item' id='1'></span><span class='calendar-row-3 calendar-item' id='2'></span><span class='calendar-row-3 calendar-item' id='3'></span><span class='calendar-row-3 calendar-item' id='4'></span><span class='calendar-row-3 calendar-item' id='5'></span><span class='calendar-row-3 calendar-item' id='6'></span><span class='calendar-row-3 calendar-item' id='7'></span></p><p class='calendar-row' id='4'><span class='calendar-row-4 calendar-item' id='1'></span><span class='calendar-row-4 calendar-item' id='2'></span><span class='calendar-row-4 calendar-item' id='3'></span><span class='calendar-row-4 calendar-item' id='4'></span><span class='calendar-row-4 calendar-item' id='5'></span><span class='calendar-row-4 calendar-item' id='6'></span><span class='calendar-row-4 calendar-item' id='7'></span></p><p class='calendar-row' id='5'><span class='calendar-row-5 calendar-item' id='1'></span><span class='calendar-row-5 calendar-item' id='2'></span><span class='calendar-row-5 calendar-item' id='3'></span><span class='calendar-row-5 calendar-item' id='4'></span><span class='calendar-row-5 calendar-item today selected' id='5'></span><span class='calendar-row-5 calendar-item' id='6'></span><span class='calendar-row-5 calendar-item' id='7'></span></p><p class='calendar-row' id='6'><span class='calendar-row-6 calendar-item' id='1'></span><span class='calendar-row-6 calendar-item' id='2'></span><span class='calendar-row-6 calendar-item' id='3'></span><span class='calendar-row-6 calendar-item' id='4'></span><span class='calendar-row-6 calendar-item' id='5'></span><span class='calendar-row-6 calendar-item' id='6'></span><span class='calendar-row-6 calendar-item' id='7'></span></p></div></div>"
    $(container).html(selector)

    var now_year_month = now_year + "-" + PrefixInteger(now_month, 2)
    $(container).find('.date-selector.date.future .year-and-month .text#year-month').html(now_year_month)
    changeCalendarFuture(param, now_year, now_month, now)
}
function changeCalendarFuture(param, year, month, now) {
    var firstday = new Date(year, month - 1, 1)
    var first_weekday = firstday.getDay()
    if (first_weekday == 0) {
        first_weekday = 7
    }

    var lastday = new Date(year, month, 0)
    var count_day = lastday.getDate() //所选月总天数

    var prev_lastday = new Date(year, month - 1, 0)
    var prev_count_day = lastday.getDate() //所选月前一月总天数

    var dates = []
    var dates_class = []


    var now_year = now.getFullYear()
    var now_month = now.getMonth()
    var now_firstday = new Date(now_year, now_month, 1)
    var need_firstday = new Date(year, month - 1, 1)

    if (now_firstday - need_firstday == 0) { //判断是否为当月

        for (var i = 0; i < first_weekday - 1; i++) { //月前补齐
            dates.push(prev_count_day - (first_weekday - 1 - i))
            dates_class.push('prev not-allow')
        }
        var now_date = now.getDate()
        for (var i = 0; i < now_date - 1; i++) { //当天之前不可选的日期
            dates.push(1 + i)
            dates_class.push('this')
        }

        dates.push(now_date) //设置当天标签
        dates_class.push('this today selected optional')

        for (var i = 0; i < count_day - now_date; i++) { //当天之后可选的日期
            dates.push(now_date + 1 + i)
            dates_class.push('this optional')
        }
        var prev_date = 42 - dates.length
        for (var i = 0; i < prev_date; i++) { //月后补齐
            dates.push(i + 1)
            dates_class.push('next')

        }
    } else {
        for (var i = 0; i < first_weekday - 1; i++) { //月前补齐
            dates.push(prev_count_day - (first_weekday - 1 - i))
            dates_class.push('prev')
        }
        var now_date = now.getDate()
        for (var i = 0; i < count_day; i++) { //所选月日期
            dates.push(1 + i)
            dates_class.push('this optional')
        }
        var prev_date = 42 - dates.length
        for (var i = 0; i < prev_date; i++) { //月后补齐
            dates.push(i + 1)
            dates_class.push('next')
        }
    }
    var container = param.container
    var num = 0
    $(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('prev')
    $(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('this')
    $(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('next')
    $(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('today')
    $(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('not-allow')
    $(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('optional')
    $(container).find('.date-selector.date.future .calendar-content .calendar-item').removeClass('selected')
    
    for (var w = 0; w < 6; w++) {
        var row = w + 1
        for (var d = 0; d < 7; d++) {
            var id = d + 1
            $(container).find('.date-selector.date.future .calendar-content .calendar-item.calendar-row-' + row + '#' + id).html(dates[num])
            $(container).find('.date-selector.date.future .calendar-content .calendar-item.calendar-row-' + row + '#' + id).addClass(dates_class[num])
            num++
        }
    }

}
$(document).on('click', '.date-selector.date.future .year-and-month .btn#prev-year.active', function () {
    var now = new Date()
    var now_year = now.getFullYear()
    var now_month = now.getMonth() + 1
    var this_calender = $(this).siblings('#year-month').html()
    var param = JSON.parse($(this).parent().siblings('.param').html())
    var this_year = parseInt(this_calender.split('-')[0])
    var this_month = parseInt(this_calender.split('-')[1])
    var target_year = this_year - 1
    var target_month = this_month
    if (target_year == now_year) {
        $(this).removeClass('active')
    }
    if (target_year == now_year && target_month <= now_month) {
        target_month = now_month
        $(this).removeClass('active')
        $(this).siblings('.btn#prev-month').removeClass('active')
    }
    changeCalendarFuture(param, target_year, target_month, now)
    $(this).siblings('.text#year-month').html(target_year + "-" + PrefixInteger(target_month, 2))
})

$(document).on('click', '.date-selector.date.future .year-and-month .btn#prev-month.active', function () {
    var now = new Date()
    var now_year = now.getFullYear()
    var now_month = now.getMonth() + 1
    var this_calender = $(this).siblings('#year-month').html()
    var param = JSON.parse($(this).parent().siblings('.param').html())
    var this_year = parseInt(this_calender.split('-')[0])
    var this_month = parseInt(this_calender.split('-')[1])
    var target_year = this_year
    var target_month = this_month - 1
    if (target_month == 0) {
        target_month = 12
        target_year = target_year - 1
    }
    if (target_year == now_year && target_month <= now_month) {
        target_year = now_year
        target_month = now_month
        $(this).removeClass('active')
        $(this).siblings('.btn#prev-year').removeClass('active')
    }
    changeCalendarFuture(param, target_year, target_month, now)
    $(this).siblings('.text#year-month').html(target_year + "-" + PrefixInteger(target_month, 2))
})

$(document).on('click', '.date-selector.date.future .year-and-month .btn#next-month.active', function () {
    var now = new Date()
    var now_year = now.getFullYear()
    var now_month = now.getMonth() + 1
    var this_calender = $(this).siblings('#year-month').html()
    var param = JSON.parse($(this).parent().siblings('.param').html())
    var this_year = parseInt(this_calender.split('-')[0])
    var this_month = parseInt(this_calender.split('-')[1])
    var target_year = this_year
    var target_month = this_month + 1
    if (target_month == 13) {
        target_month = 1
        target_year = target_year + 1
    }
    if (target_year !== now_year) {
        $(this).siblings('.btn#prev-month').addClass('active')
        $(this).siblings('.btn#prev-year').addClass('active')
    }
    if (target_year == now_year && target_month !== now_month) {
        $(this).siblings('.btn#prev-month').addClass('active')
        $(this).siblings('.btn#prev-year').removeClass('active')
    }
    changeCalendarFuture(param, target_year, target_month, now)
    $(this).siblings('.text#year-month').html(target_year + "-" + PrefixInteger(target_month, 2))
})

$(document).on('click', '.date-selector.date.future .year-and-month .btn#next-year.active', function () {
    var now = new Date()
    var now_year = now.getFullYear()
    var now_month = now.getMonth() + 1
    var this_calender = $(this).siblings('#year-month').html()
    var param = JSON.parse($(this).parent().siblings('.param').html())
    var this_year = parseInt(this_calender.split('-')[0])
    var this_month = parseInt(this_calender.split('-')[1])
    var target_year = this_year + 1
    var target_month = this_month
    if (target_year !== now_year) {
        $(this).siblings('.btn#prev-month').addClass('active')
        $(this).siblings('.btn#prev-year').addClass('active')
    }
    changeCalendarFuture(param, target_year, target_month, now)
    $(this).siblings('.text#year-month').html(target_year + "-" + PrefixInteger(target_month, 2))
})

$(document).on('click', '.date-selector.date.future .calendar-content span.calendar-item.this.optional', function () {
    var param = JSON.parse($(this).parent().parent().siblings('.param').html())
    var fill_in = param.fill_in
    var date = $(this).html()
    var this_calender = $(this).parent().parent().siblings('.year-and-month').children('#year-month').html()
    $(this).parent().parent().find('.calendar-item').removeClass('selected')
    $(fill_in).val(this_calender + '-' + PrefixInteger(date, 2))
    $(this).addClass('selected')
})

$(document).on('click', '.date-selector.date.future .calendar-content span.calendar-item.next', function () {
    $(this).parent().parent().siblings('.year-and-month').children('.btn#next-month').trigger("click");
})
$(document).on('click', '.date-selector.date.future .calendar-content span.calendar-item.prev', function () {
    if($(this).is('.not-allow')){

    }else{
        $(this).parent().parent().siblings('.year-and-month').children('.btn#prev-month').trigger("click");
    }
})

$(function () {
    $('input').focus(function () {
        this.getAttribute("fillBy")
    })
})