/// <reference path="../SaveXml.js" />
/// <reference path="../SaveXml.js" />
/// <reference path="../SaveXml.js" />
/// <reference path="../SaveXml.js" />
EMIEModule.service("ManageSiteService", function ($http, $q) {

    //this service returns all the info present in the xml file to display all the information on the UI
    this.GetSiteInfo = function () {
        return $http({
            cache: false,
            method: "post",
            url: "XMLHelper/GetSiteInfo",

        });
    }

    //This servie will return all the docmodes required
    this.GetDocModes = function () {
        return $http({
            cache: false,
            method: "post",
            url: "Application/GetDocModes"
        })
    }

    //this service updates the informations of the existing websites
    this.UpdateXml = function (data) {
        return $http({
            cache: false,
            method: "post",
            url: "XMLHelper/UpdateXMLData",
            data: data,
            dataType: "json"
        })
    }

    //This service is used to clear all the data in the list
    this.ClearLists = function () {
        return $http({
            cache: false,
            method: "post",
            url: "XMLHelper/ClearLists"
        })
    }

    //this service is used to add the bulk data from a file
    this.BulkAddFromFile = function (info, isSingleAddition) {
        var parameters = {
            info: info,
            isSingleAddition: isSingleAddition

        };
        return $http({
            cache: false,
            method: "post",
            url: "XMLHelper/BulkAddFromFile",
            data: JSON.stringify(parameters),
            dataType: "json"
        })
    }

    //this service will directly add a site from the Enterprise Mode Site List Manager to the production XML file
    this.DirectAddToFile = function (tickets) {
        return $http({
            cache: false,
            method: "post",
            url: "XMLHelper/AddToV2XMLBulk",
            data: JSON.stringify(tickets),
            dataType: "json"
        })
    }

    //this service will send the site details to be deleted
    this.DeleteSite = function (siteInfo) {
        return $http({
            cache: false,
            method: "post",
            url: "XMLHelper/DeleteSite",
            data: JSON.stringify(siteInfo),
            dataType: "json"
        })
    }

    //this service will ping the url to check whether its valid url
    this.pingURL = function (siteUrl) {
        return $http({
            cache: false,
            method: "post",
            url: "XMLHelper/PingUrl",
            params: { url: siteUrl }
        })
    }

    //Get Xml String in v1 format while saveasxml is in v1
    //making the async call to the function
    this.asyncSavexml = function (info) {
        var deffered = $q.defer(); var path = window.location.toLocaleString(); var subpath = "App/SaveXml.js";
        path = path.replace(path.substring(path.indexOf('#')), '');
        var worker = new Worker(path + subpath);
        var parameter = { info: info };
        worker.postMessage(parameter);
        worker.onmessage = function (xmlString) {
            deffered.resolve(xmlString.data);
        }
        return deffered.promise;
    }

    //getting all the production websites
    this.getSitesFromProduction = function () {
        return $http({
            cache: false,
            method: "post",
            url: "XMLHelper/getSitesFromProduction",
        });
    }
});