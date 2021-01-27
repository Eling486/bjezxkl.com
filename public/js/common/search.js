jQuery.expr[':'].Contains = function (a, i, m) {
    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

/*搜索*/
function filterList(list) {
    $(".list-year-wrap").show()
    var keyword_filter = $('input#search-keyword').val();
    var month_filter = $('input#search-month').val();
    if (keyword_filter || month_filter) {
        $matches_keyword = $(list).find('li.key-obj:Contains(' + keyword_filter + ')').parent();//选择ul标签
        $matches_month = $(list).find('li.date-obj:Contains(' + month_filter + ')').parent();
        if (keyword_filter && month_filter) {
            var result = $matches_month.filter($matches_keyword)//取交集
            $(".list-year-wrap").show()
            $('ul', list).not(result).parent().parent().hide();
            result.parent().parent().show();
            console.log(result)
            if(result.length==0){
                $('.list-tips-wrap#error').show();
            }else{
                $('.list-tips-wrap#error').hide();
            }
            YearCheck()
        }
        if (keyword_filter && !month_filter) {
            $(".list-year-wrap").show()
            $('ul', list).not($matches_keyword).parent().parent().hide();
            $matches_keyword.parent().parent().show();
            if($matches_keyword.prevObject.length==0){
                $('.list-tips-wrap#error').show();
            }else{
                $('.list-tips-wrap#error').hide();
            }
            YearCheck()

        }
        if (month_filter && !keyword_filter) {
            $(".list-year-wrap").show()
            $('ul', list).not($matches_month).parent().parent().hide();
            $matches_month.parent().parent().show();
            if($matches_month.prevObject.length==0){
                $('.list-tips-wrap#error').show();
            }else{
                $('.list-tips-wrap#error').hide();
            }
            YearCheck()
        }
    } else {
        $(list).find("ul").parent().parent().show();
        $(".list-year-wrap").show()
        $('.list-tips-wrap#error').hide();
    }

}

$('.clear-span').click(filterList($(".list-content")));

$('input#search-keyword, input#search-month').bind('input propertychange', filterList($(".list-content")));

$('input#search-keyword, input#search-month').off('input propertychange').on('input propertychange', filterList($(".list-content")));

function YearCheck() {
    $(".list-year-wrap").each(function () {
        var if_value = "false"
        $(this).children(".list-item").each(function () {
            if ($(this).css('display') !== 'none') {
                if_value = "true"
                return false;
            } else {
                if_value = "false"
            }

        });
        if (if_value == "false") {
            $(this).hide();
        } else if (if_value == "true") {
            $(this).show();
        }
    })
}

$('input#search-month').focus(function () {
    $('.clear-span.search-month-clear').trigger("click");
    $('input#search-month').change()
    $(".list-year-wrap").show()
})
$(document).on('click','.month-selector span',function(){
    $(".list-year-wrap").show()
    filterList($(".list-content"))
    //YearCheck()
})


$(function () {
    filterList($(".list-content"));
    $('input#search-month').change(filterList($(".list-content")));
    $('input#search-keyword').change(filterList($(".list-content")));
    //YearCheck()
})