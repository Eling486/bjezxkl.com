function showQuickLogin() {
	if($('body iframe.quicklogin-wrap').length == 0){
		$('body').append("<iframe class='quicklogin-wrap' src='/user/quicklogin' frameborder='0' width='100%' height='100%' style='display: none; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 99999;'></iframe>");
		$('.quicklogin-wrap').fadeIn('fast')
	}
}

function isExitsFunction(funcName) {
    try {
        if (typeof(eval(funcName)) == "function") {
            return true;
        }
    } catch(e) {}
    return false;
}

function quitQuickLogin() {
    window.parent.$(".international-header").load("/templates/header");
	if(window.parent.isExitsFunction("loginFailed")){
		window.parent.loginFailed()
	}
    window.parent.$('.quicklogin-wrap').fadeOut('fast')
    window.parent.$(".quicklogin-wrap").remove();
}

function hideQuickLogin() {
    window.parent.$(".international-header").load("/templates/header");
	if(window.parent.isExitsFunction("loginSucceeded")){
		window.parent.loginSucceeded()
	}
    window.parent.$('.quicklogin-wrap').fadeOut('fast')
    window.parent.$(".quicklogin-wrap").remove();
}

function showPopup() {
    $('body').append("<div class='wrapper-popup' style='display: none;'><div class='content'><div class='close' onclick='hidePopup()'>×</div><div class='infos'></div><div class='btn-wrap'><button class='btn active' id='cancel' onclick='hidePopup()'>取消</button><button class='btn active' id='ok'>确定</button></div></div></div>");
    $('.wrapper-popup').fadeIn('fast')
}
function hidePopup() {
    $('.wrapper-popup').fadeOut('fast')
    $('.wrapper-popup').remove()
}
