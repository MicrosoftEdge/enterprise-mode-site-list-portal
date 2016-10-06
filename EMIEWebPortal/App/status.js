function url() {
    
    var url = window.location.href.split('/');
    var controller = url[url.length - 2] + "/" + url[url.length - 1];

    if (controller == "#/NewCR" || controller == "#/VerifySandbox" || controller == "#/Request" || controller == "#/RequestPage" || controller == "#/Approvers" || controller == "#/Request" || controller == "#/VerifyProduction" || controller == "#/ProductionChanges"
         || controller == "#/SandboxPage" || controller == "#/ApproversPage" || controller == "#/ProductionChangePage" || controller == "#/SignOffPage" || controller == "#/SignInSuccessForRequestor")
        $(".status").css("display", "block");
    else 
        $(".status").css("display", "none");

        if (controller == "#/NewCR" || controller == "#/SignInSuccess") {
            $(".status #Middle-child-1,.status #First-child").unbind('click').click()
            $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child").click(function (event) {
                event.preventDefault();

            });
        }
        else if (controller == "#/VerifySandbox") {
             $(".status #First-child").unbind('click').click()
            $(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child").click(function (event) {
                event.preventDefault();

            });
        }
        else if (controller == "#/Approvers") {
            $(".status #First-child,.status #Middle-child-1").unbind('click').click()
            $(".status #Middle-child-2,.status #Middle-child-3,.status #Last-child").click(function (event) {
                event.preventDefault();

            });
        }
        else if (controller == "#/ProductionChanges") {
            $(".status #First-child,.status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3").unbind('click').click()
            $(".status #Last-child").click(function (event) {
                event.preventDefault();

            });
        }
        else {
            $(".status #Middle-child-1,.status #Middle-child-2,.status #Middle-child-3,.status #Last-child").unbind('click').click();
        }

    }


