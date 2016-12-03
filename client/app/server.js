import {readDocument, readEntireDocument, writeDocument, addDocument} from './database.js';

/**
 * Emulates how a REST call is *asynchronous* -- it calls your function back
 * some time in the future with data.
 */
function emulateServerReturn(data, cb) {
  setTimeout(() => {
    cb(data);
  }, 4);
}

export function adjustPrice(price) {
  if(price == null || price == 0) return "Free!";
  price = price.toString();
  return "$" + price.slice(0,price.length-2) + "." + price.slice(price.length-2,price.length);
}

export function setActiveNavLink(page){
  $(document).ready(function () {
    $("#mainNavLinks li.active").removeClass("active"); //first things first remove active from old class
    $("#mainNavLinks li").filter(":contains('" + page + "')").addClass("active"); //add to the requested one
  });
  //$("#mainNavLinks li.active").removeClass("active"); //first things first remove active from old class
  //if(index === 0)
  //$("#mainNavLinks li:nth-child(1)").addClass("active"); //add active class to home in this case
  //else
  //$("#mainNavLinks li:nth-child(" + index +")").addClass("active"); //add active class to the caller
}

var token = 'eyJpZCI6NH0='; //this is constant for now
/**
 * Properly configure+send an XMLHttpRequest with error handling,
 * authorization token, and other needed properties.
 */
function sendXHR(verb, resource, body, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open(verb, resource);
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  // The below comment tells ESLint that FacebookError is a global.
  // Otherwise, ESLint would complain about it! (See what happens in Atom if
  // you remove the comment...)
  /* global AppError */
  // Response received from server. It could be a failure, though!
  xhr.addEventListener('load', function() {
    var statusCode = xhr.status;
    var statusText = xhr.statusText;
    if (statusCode >= 200 && statusCode < 300) {
      // Success: Status code is in the [200, 300) range.
      // Call the callback with the final XHR object.
      cb(xhr);
    } else {
      // Client or server error.
      // The server may have included some response text with details concerning
      // the error.
      var responseText = xhr.responseText;
      AppError('Could not ' + verb + " " + resource + ": Received " +
        statusCode + " " + statusText + ": " + responseText);
    }
  });
  // Time out the request if it takes longer than 10,000
  // milliseconds (10 seconds)
  xhr.timeout = 10000;
  // Network failure: Could not connect to server.
  xhr.addEventListener('error', function() {
    AppError('Could not ' + verb + " " + resource +
      ": Could not connect to the server.");
  });
  // Network failure: request took too long to complete.
  xhr.addEventListener('timeout', function() {
    AppError('Could not ' + verb + " " + resource +
      ": Request timed out.");
  });
  switch (typeof(body)) {
    case 'undefined':
      // No body to send.
      xhr.send();
      break;
    case 'string':
      // Tell the server we are sending text.
      xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      xhr.send(body);
      break;
    case 'object':
      // Tell the server we are sending JSON.
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      // Convert body into a JSON string.
      xhr.send(JSON.stringify(body));
      break;
    default:
      throw new Error('Unknown body type: ' + typeof(body));
  }
}

function useCB(xhr,cb) {
  cb(JSON.parse(xhr.responseText));
}

export function getGameData(cb) {
  sendXHR('GET', '/games', undefined, (xhr) => { useCB(xhr,cb) });
}

export function getGameById(id,cb) {
  sendXHR('GET', '/game/'+id, undefined, (xhr) => { useCB(xhr,cb) });
}

export function getPopularGameData(cb) {
  sendXHR('GET', '/games/popular', undefined, (xhr) => { useCB(xhr,cb) });
}

export function getPriceyGameData(cb) {
  sendXHR('GET', '/games/pricey', undefined, (xhr) => { useCB(xhr,cb) });
}

export function getUserData(userID, cb) {
  sendXHR('GET', '/user/'+userID, undefined, (xhr) => { useCB(xhr,cb) });
}

export function getForumData(cb) {
  sendXHR('GET', '/forum', undefined, (xhr) => { useCB(xhr,cb) });
}

export function unwatchGame(userid,appid,cb) {
  sendXHR('PUT', '/user/'+userid+'/watchlist/'+appid, undefined, (xhr) => { useCB(xhr,cb) });
}

export function watchGame(userid,appid,cb) {
  sendXHR('DELETE', '/user/'+userid+'/watchlist/'+appid, undefined, (xhr) => { useCB(xhr,cb) });
}

//export function getUserData(cb) {
//var userData = readEntireDocument('users');
//emulateServerReturn(userData, cb);
//}
