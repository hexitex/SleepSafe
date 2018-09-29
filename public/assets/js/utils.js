function bbConfirm(message, action, method) {
    bootbox.confirm({ // html needs a form with id of 'doSomething'
        size: "small",
        message: message,
        action: action,
        method: method,
        callback: function (result) {
            if (result) {
                $('#doSomething').attr("action", action);
                $('#doSomething').attr("method", method);
                $('#doSomething').submit();
            }
        }
    });
}

function bbCommentEdit(message, text, action, method) {
    bootbox.prompt({ // html needs a form with id of 'doSomething'
        title: message,
        size: "large",
        inputType: 'textarea',
        value: text,
        action: action,
        method: method,
        closeButton: false,
        callback: function (result) {
            if (result) {
                const form = $('#doSomething');
                const el = document.createElement("input");
                el.type = "hidden";
                el.name = "comment";
                el.value = result;
                form.append(el);
                $('#doSomething').attr("action", action);
                $('#doSomething').attr("method", method);
                $('#doSomething').submit();
            }
        }
    })
}