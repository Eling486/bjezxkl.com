
//登录/注册标签栏
$('.wrapper-quicklogin').on('click', '.tab', function () {
    $('.wrapper-quicklogin .nav-quicklogin .tab').removeClass('active')
    $('.wrapper-quicklogin .content .panel').removeClass('active')
    if ($(this).attr('id') == "login") {
        $('.wrapper-quicklogin .nav-quicklogin .tab#login').addClass('active')
        $('.wrapper-quicklogin .content .panel#login').addClass('active')
    } else if ($(this).attr('id') == "register") {
        $('.wrapper-quicklogin .nav-quicklogin .tab#register').addClass('active')
        $('.wrapper-quicklogin .content .panel#register').addClass('active')
    }
})
//切换至登录
$('.wrapper-quicklogin').on('click', '.link-tologin', function () {
    $('.wrapper-quicklogin .nav-quicklogin .tab#login').trigger("click");
})
//关闭弹窗
$('.wrapper-quicklogin').on('click', '.close', function () {
    quitQuickLogin()
})
$('body').on('click', '.wrapper-quicklogin', function () {
    $('.wrapper-quicklogin .content .close').trigger("click");
})
$('.wrapper-quicklogin').on('click', '.content', function (e) {
    e.stopPropagation();
})

//用户名格式检查
function usernameCheck() {
    var maxLen = 15
    var re_uname = new RegExp("^[\u4E00-\u9FA5A-Za-z0-9_]+$")
    if ($('.panel.active#register input#username-reg').val() == "") {
        $('.panel.active#register p.message#username').html('请输入用户名')
    } else if ($(".panel.active#register input#username-reg").val().length > maxLen) {
        $('.panel.active#register p.message#username').html('用户名过长')
    } else if ($(".panel.active#register input#username-reg").val().replace(RegExp("^[_]+$"), '') == "") {
        $('.panel.active#register p.message#username').html('不能只包含特殊符号')
    } else if (!re_uname.test($(".panel.active#register input#username-reg").val())) {
        $('.panel.active#register p.message#username').html('只能包含中文、英文、数字和下划线')
    } else {
        $('.panel.active#register p.message#username').html('')
        return "ok";
    }
}
//密码格式检查
function pwdCheck() {
    var minLen = 6
    var maxLen = 20
    var re_pwd = new RegExp("^[A-Za-z0-9_!@$%]+$")
    if ($('.panel.active#register input#pwd-reg').val() == "") {
        $('.panel.active#register p.message#pwd').html('请输入密码')
    } else if ($(".panel.active#register input#pwd-reg").val().length > maxLen) {
        $('.panel.active#register p.message#pwd').html('密码过长')
    } else if ($(".panel.active#register input#pwd-reg").val().length < minLen) {
        $('.panel.active#register p.message#pwd').html('密码过短')
    } else if ($(".panel.active#register input#pwd-reg").val().replace(RegExp("^[_!@$%]+$"), '') == "") {
        $('.panel.active#register p.message#pwd').html('不能只包含特殊符号')
    } else if (!re_pwd.test($(".panel.active#register input#pwd-reg").val())) {
        $('.panel.active#register p.message#pwd').html('只能包含英文、数字、下划线及部分特殊符号')
    } else {
        $('.panel.active#register p.message#pwd').html('')
        return "ok";
    }
}
//重复输入密码一致性检查
function rePwdCheck() {
    if ($('.panel.active#register input#re-pwd-reg').val() == "") {
        $('.panel.active#register p.message#re-pwd').html('请重复输入密码')
    } else if ($(".panel.active#register input#re-pwd-reg").val() !== $(".panel.active#register input#pwd-reg").val()) {
        $('.panel.active#register p.message#re-pwd').html('两次输入密码不一致')
    } else if ($(".panel.active#register input#re-pwd-reg").val() === $(".panel.active#register input#pwd-reg").val()) {
        $('.panel.active#register p.message#re-pwd').html('')
        return "ok";
    }
}
//邮箱格式检查
function emailCheck() {
    var re_email = /^\w+@[a-z0-9]+\.[a-z]{2,4}$/
    if ($('.panel.active#register input#email-reg').val() == "") {
        $('.panel.active#register p.message#email').html('请输入邮箱')
    } else if (re_email.test($(".panel.active#register input#email-reg").val())) {
        $('.panel.active#register p.message#email').html('')
        return "ok";
    } else {
        $('.panel.active#register p.message#email').html('邮箱格式不正确')
    }
}

//注册
$('.input-wrap-btn').on('click', '.btn-register', function () {
    if ($('.panel.active#register input#username-reg').val() == "" || $('.panel.active#register input#pwd-reg').val() == "" || $('.panel.active#register input#re-pwd-reg').val() == "" || $('.panel.active#register input#email-reg').val() == "") {
        usernameCheck()
        pwdCheck()
        rePwdCheck()
        emailCheck()
    } else {
        if ($('.wrapper-quicklogin .panel#register .message#username').html() == "" && $('.wrapper-quicklogin .panel#register .message#pwd').html() == "" && $('.wrapper-quicklogin .panel#register .message#re-pwd').html() == "" && $('.wrapper-quicklogin .panel#register .message#email').html() == "") {
            var username = $('.panel.active#register input#username-reg').val()
            var pwd = $('.panel.active#register input#pwd-reg').val()
            var email = $('.panel.active#register input#email-reg').val()
            var data = {
                username: username,
                password: md5(pwd),
                email: email
            }
            $.ajax({
                url: '/user/register',
                type: 'post',
                data: data,
                success: function (data, status) {
                    if (data.code !== 0) {
                        if (data.code == -501) {
                            alert('注册失败')
                            return console.log(data)
                        }
                        if (data.code == -502) {
                            return $('.panel.active#register p.message#username').html('用户名已被占用')
                        }
                        if (data.code == -503) {
                            return $('.panel.active#register p.message#email').html('该邮箱已被注册')
                        }
                    } else {
                        alert('注册成功')
                        $('.panel.active#register input#username-reg').val('')
                        $('.panel.active#register input#pwd-reg').val('')
                        $('.panel.active#register input#re-pwd-reg').val('')
                        $('.panel.active#register input#email-reg').val('')
                        $('.wrapper-quicklogin .nav-quicklogin .tab#login').trigger("click");
                    }
                },
                error: function (data, err) {
                    return console.log(err);
                }
            })
        } else {
            return console.log('请修改后重试')

        }
    }
})
//用户名非空检查
function usernameCheckLogin() {
    if ($('.panel.active#login input#username').val() == "") {
        $('.panel.active#login p.message#username').html('请输入用户名')
    } else {
        $('.panel.active#login p.message#username').html('')
        return "ok";
    }
}
//密码非空检查
function pwdCheckLogin() {
    if ($('.panel.active#login input#pwd').val() == "") {
        $('.panel.active#login p.message#pwd').html('请输入密码')
    } else {
        $('.panel.active#login p.message#pwd').html('')
        return "ok";
    }
}
//登录
$('.input-wrap-btn').on('click', '.btn-login', function () {
        usernameCheckLogin()
        pwdCheckLogin()
        if ($('.wrapper-quicklogin .panel#login .message#username').html() == "" && $('.wrapper-quicklogin .panel#login .message#pwd').html() == "") {
            var username = $('.panel.active#login input#username').val()
            var pwd = $('.panel.active#login input#pwd').val()
            var data = {
                username: username,
                password: md5(pwd),
            }
            $.ajax({
                url: '/user/login',
                type: 'post',
                data: data,
                success: function (data, status) {
                    if (data.code !== 0) {
                        if (data.code == -501) {
                            alert('登录失败')
                            return console.log(data)
                        }
                        if (data.code == -503) {
                            return $('.panel.active#login p.message#username').html('用户名或密码错误')
                        }
                    } else {
                        //alert('登录成功')
                        $('.panel.active#login input#username').val('')
                        $('.panel.active#login input#pwd').val('')
                        hideQuickLogin()
                    }
                },
                error: function (data, err) {
                    return console.log(err);
                }
            })
        } else {
            return console.log('请修改后重试')

        }
})
