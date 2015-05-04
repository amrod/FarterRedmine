function FasterRedmine() {}

FasterRedmine.prototype.setApiKey = function(key) {
    FasterRedmine.prototype.key = key;
}

FasterRedmine.prototype.setPropagateFlag = function(value) {
    FasterRedmine.prototype.propagate = value;
}

FasterRedmine.prototype.setRedmineUrl = function(url) {
    FasterRedmine.prototype.redmineUrl = url;
}

FasterRedmine.prototype.setAtomUrl = function(url) {
    FasterRedmine.prototype.atomUrl = url;
}

FasterRedmine.prototype.loadConfig = function(config) {
    FasterRedmine.prototype.setApiKey(config.key);
    FasterRedmine.prototype.setPropagateFLag(config.propagate);
    FasterRedmine.prototype.setRedmineUrl(config.redmineUrl);
    FasterRedmine.prototype.setAtomUrl(config.atomUrl);
}

FasterRedmine.prototype.reauthBtnClick = function() {
    FasterRedmine.prototype.getContentVariables(function (vars){
        FasterRedmine.prototype.requestPermission(vars.redmineUrl, function() {});
    });

    chrome.notifications.clear("fasterredminelostpermission");
}

FasterRedmine.prototype.getContentVariables = function(callback) {
    
    chrome.storage.local.get({
        key: ""
        }, function(items) {
            var key = items.key;

            chrome.storage.sync.get({
                propagate: true,
                redmineUrl: "",
                atom_feed: ""
                }, function(items) {
                   var propagate = items.propagate;
                   var redmineUrl = items.redmineUrl;
                   if ( redmineUrl.slice(-1) !== "/" ) {
                       redmineUrl = redmineUrl + "/";
                    }
                    
                    callback({key: key, propagate: propagate, redmineUrl: redmineUrl});
                    
            });

    });
}

FasterRedmine.prototype.refreshBrowserActionIcon = function(tab) {

    var url = tab.url.split('#')[0]; // Exclude URL fragments

    FasterRedmine.prototype.hasPermission(url, function(granted){

        chrome.storage.sync.get({
            redmineUrl: "^$"
        }, function(items){
            re = RegExp(items.redmineUrl);
            var callback =   FasterRedmine.prototype.runtimeLastErrorCallback;

            if (!(re.test(url) && url !== "chrome://extensions")) {
                var paths = {"38": "icons/fast-redmine-bw-38.png"};
                chrome.browserAction.setIcon({tabId: tab.id, path: paths}, callback);

            }else if (granted) {
                var paths = {"38": "icons/fast-redmine-38.png"}; 
                chrome.browserAction.setIcon({tabId: tab.id, path: paths}, callback);

            } else {
                var paths = {"19": "icons/fast-redmine-bw-blocked-19.png", "38": "icons/fast-redmine-bw-blocked-38.png"};
                chrome.browserAction.setIcon({tabId: tab.id, path: paths, callback});
           }

           //chrome.browserAction.show(tab.id);

        });
    });
}

FasterRedmine.prototype.refreshBrowserActionIconAllTabs = function() {
    //console.log("This is: " + JSON.stringify(this));
    chrome.tabs.query({}, function(arrayOfTabs) {
        for (var i = 0; i < arrayOfTabs.length; i++) {
            if (arrayOfTabs[i].status == "complete") {
               FasterRedmine.prototype.refreshBrowserActionIcon(arrayOfTabs[i]);
                //refreshBrowserActionIcon(arrayOfTabs[i]);
            }
        }
    });
}

FasterRedmine.prototype.runtimeLastErrorCallback = function() {
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
    } else {
        // Tab exists
    }
}

FasterRedmine.prototype.reloadTab = function(tabId){
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        chrome.tabs.reload(tabId);
    }); 
}

FasterRedmine.prototype.requestPermission = function(urls, callback) {
    // Permissions must be requested from inside a user gesture, like a button's
    // click handler.

    console.log("FasterRedmine::requestPermisison: Requesting permissions for " + urls);

    if (urls.constructor !== Array) {
        urls = [urls]
    }

    chrome.permissions.request({
        permissions: [],
        origins: urls
    }, function(granted) {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
            callback({granted: true});
        } else {
            callback({granted: false});
        }
    });
}

FasterRedmine.prototype.removePermission = function(urls, callback) {
    
    if (urls.constructor !== Array) {
        urls = [urls]
    }

    chrome.permissions.remove({
        permissions: [],
        origins: urls
    }, function(removed) {
        if (removed) {
            callback({removed: true});
        } else {
            callback({removed: false});
        }
    });

}

FasterRedmine.prototype.hasPermission = function(url, callback){

    chrome.permissions.contains({
        permissions: ['contentSettings'],
        origins: [url]
      }, function(result) {
        if (result) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

FasterRedmine.prototype.injectScripts = function(tab) {
    FasterRedmine.prototype.hasPermission(tab.url, function(granted){
        if (granted) {
            chrome.tabs.executeScript(tab.id, {
                file: "scripts/jquery-1.11.2.min.js",
                runAt: "document_end"
            }, function(){
                chrome.tabs.executeScript(tab.id, {
                    file: "scripts/inject.js",
                    runAt: "document_end"
                });
            });
        }
    });
}

FasterRedmine.prototype.getAtomFeed = function(url, callback) {

    var feed;
    $.ajax({
        type: "GET",
        url: url,
        dataType: 'xml', // format of the response
        success: function(data, textStatus, jqXHR) {
            //console.log("Succes: " + textStatus);
            //feed = data;
            //console.log(data);
            callback(data);
        },
        complete: function(jqXHR, textStatus) {
            //console.log("Complete: " + textStatus);
        }
    });
}

FasterRedmine.prototype.updateBadge = function(tab) {
    
}