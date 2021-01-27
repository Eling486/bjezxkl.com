$(function () {
    if ($('.input-wrap :text, .input-wrap :password').val() == "") {
        $(this).parent().parent().removeClass('input-filled')
    } else {
        $(this).parent().parent().addClass('input-filled')
    }
})

$(".input-wrap :text, .input-wrap :password").focus(function () {
    $(this).parent().parent().addClass('input-filled')
});

$(".input-wrap :text, .input-wrap :password").blur(function () {
    if ($(this).val() == "") {
        $(this).parent().parent().removeClass('input-filled')
    } else {
        $(this).parent().parent().addClass('input-filled')
    }
});

$('.clear-span').click(function () {
    $(this).parent().find('input').val('')
    $(this).parent().find('input').blur()
    $(this).parent().find('input').change()
})