var cellOneApp = angular.module('cellOneApp', []);

function closeDialog() {
	$( "#dialog" ).dialog("close");
}

cellOneApp.config(['$locationProvider', function($locationProvider){
  // won't we always have window.history and pushState?
  if ( window.history && window.history.pushState ){
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }
}]);
cellOneApp.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
});

cellOneApp.controller('CellOneAppMainCtrl', ['$scope', '$http', function($scope, $http) 
{
	
$scope.reset = function() {
	$scope.isLoginPage = true;
	$scope.userName = "user1";
	$scope.password = "";
	$scope.uid = "1110568334";
	$scope.token = "7642B860792EFD01D5A467D8B63559A0";
	$scope.pendingTransactions = [];
	$scope.recentTransactions = [];
	$scope.splittedTransactionArray = [];
};


$scope.reset();
$scope.userLoginMap = {
	"user1": { "UID": 1110568334, "token": "7642B860792EFD01D5A467D8B63559A0"},
	"user2": { "UID": 1110570164, "token": "119947F2D985C3788998543A3D3AD90C"},
	"user3": { "UID": 1110570166, "token": "63C08C4AA6E3CB1A4B13C9C5299365C0"}
};


var defaultUserData = {
            "1110568334": {
                "transaction": [
                ],
                "splittedTransactions" : [],
                "beneficiary": [
                    {
                        "id": "1110570164",
                        "name": "user2"
                    },
                    {
                        "id": "11105701555",
                        "name": "sam"
                    },
                    {
                        "id": "11105701666",
                        "name": "Nancy"
                    }/*
                    ,
                                        {
                                            "id": "1110570166",
                                            "name": "user3"
                                        }*/
                    
                ]
        },
            "1110570164": {
                "transaction": [
                ],
                "splittedTransactions" : [],
                "beneficiary": [
                    {
                        "id": "1110568334",
                        "name": "user1"
                    },
                    {
                        "id": "1110570166",
                        "name": "user3"
                    }
                ]
            }
};

localStorage.setItem('userData', "");
$scope.userData = localStorage.userData ? localStorage.userData : defaultUserData;
localStorage.setItem('userData', JSON.stringify($scope.userData));

$scope.login = function() {
	$scope.isLoginPage = false;
	$scope.uid = $scope.userLoginMap[$scope.userName]["UID"];
	$scope.token = $scope.userLoginMap[$scope.userName]["token"];
	$scope.getTransactions();
};

$scope.logoff = function() {
	$scope.reset();
};

$scope.modalShown = false;
$scope.openSplitDialog = function($event, merchant, amount) {
	var target = $event.target;
	
	if (!$(target).hasClass("button_nonclick")) {
		$scope.selectedBeneficiary = "";
		$scope.amount = "";
		$("#selectedBeneficiary").prop('selectedIndex', 0);
		$("#amount").val("");
		
		$scope.selectedTransId = $(target).data("tid");
		$scope.selectedMerchant = $(target).data("merchant");
		$scope.selectedAmount = $(target).data("amount");
		var localStorageBen = JSON.parse(localStorage.userData);
		$scope.beneficiaries = localStorageBen[$scope.uid]["beneficiary"];
	    $scope.modalShown = !$scope.modalShown;
	}
	
};

$scope.createNewTransObject = function(transId, merchant, amount, showAccptDeny) {
	var transObject = {
      "transaction-id": transId,
      "account-id": "account-id",
      "raw-merchant": "raw merchant",
      "merchant": merchant,
      "is-pending": true,
      "transaction-time": new Date(),
      "amount": amount,
      "isManualSplit": showAccptDeny,
      "acceptanceStatus": "pending"
   };
	return transObject;
};

$scope.splitEqual = function() {
	var numbers = 2;
	var divAmount = parseFloat(($scope.selectedAmount * -1) / numbers).toFixed(2);
	$("#amount").val(divAmount);
};

$scope.split = function() {
	var selectedBeneficiary = $("#selectedBeneficiary").val();
	var splitAmount = $("#amount").val();
	var localStorageBen = JSON.parse(localStorage.userData);
	
	var selectedBeneficiaryName =$("#selectedBeneficiary option:selected").text();
	var currentMerchantRecord = "Share credit - " + selectedBeneficiaryName;
	var beneficiaryTMerchantRecord = "Share credit - " + $scope.userName;
	var currentUserTransObject = $scope.createNewTransObject($scope.selectedTransId + "1", currentMerchantRecord, splitAmount * -1, false);
	var beneficiaryTransObject = $scope.createNewTransObject($scope.selectedTransId + "2", beneficiaryTMerchantRecord , splitAmount, true);
	localStorageBen[$scope.uid]["transaction"].push(currentUserTransObject);
	
	// Add splitted transaction
	localStorageBen[$scope.uid]["splittedTransactions"].push($scope.selectedTransId);
	
	localStorageBen[selectedBeneficiary]["transaction"].push(beneficiaryTransObject);
	localStorage.setItem('userData', JSON.stringify(localStorageBen));
	
	$scope.pendingTransactions.transactions.unshift(currentUserTransObject);
	$scope.modalShown = false;
	
	$scope.disableSplitBtn("split_" + $scope.selectedTransId);
	$("#dynamic_msg_content").text("The transaction split request was submitted succesfully.");
	$("#dialog" ).dialog();
	$scope.callNexmo();
};

$scope.callNexmo = function() {
	var userMsg = "Share+credit+acceptance+request+:+Please+login+to+your+capital+one+account+to+accept.";
	var url = "https://rest.nexmo.com/sms/json?api_key=f00942b1&api_secret=0b6dc8d3&from=12529178631&to=14804271035&text=" + userMsg;
	$.ajax({

		type : "GET",

		url : url,

		success : function(data) {

			// we have the response

			console.log(data);

			if (data != null) {

				console.log(data);

			}

		},

		error : function(e) {
			console.log('Error121212: ' + e);
		}
	}); 
};

$scope.onAccept = function($event) {
	var target = $event.target;
	if (!$(target).hasClass("button_nonclick")) {
		$("#dynamic_msg_content").text("Your transaction will be processed.");
		$("#dialog").dialog();
		
		var transId = $(target).data("tid");
		$scope.disableSplitBtn("accept_" + transId);
		$scope.disableSplitBtn("deny_" + transId);
		
		
		// update the local storage
		var localStorageBen = JSON.parse(localStorage.userData);
		var userData = localStorageBen[$scope.uid];
		var transaction = localStorageBen[$scope.uid]["transaction"];
		
		for (var i = 0; i < transaction.length; i++) {
			if (transaction[i]["transaction-id"] == transId) {
				localStorageBen[$scope.uid]["transaction"][i]["acceptanceStatus"] = "accepted";
				localStorageBen['1110568334']["transaction"][i]["acceptanceStatus"] = "accepted";
			}
		}
		localStorage.setItem('userData', JSON.stringify(localStorageBen));
	}
};

$scope.onDeny = function($event) {
	var target = $event.target;
	if (!$(target).hasClass("button_nonclick")) {
		$("#dynamic_msg_content").text("You denied the transaction.");
		$("#dialog").dialog();
		
		var transId = $(target).data("tid");
		$scope.disableSplitBtn("accept_" + transId);
		$scope.disableSplitBtn("deny_" + transId);
		
		
		// update the local storage
		var localStorageBen = JSON.parse(localStorage.userData);
		var userData = localStorageBen[$scope.uid];
		var transaction = localStorageBen[$scope.uid]["transaction"];
		
		for (var i = 0; i < transaction.length; i++) {
			if (transaction[i]["transaction-id"] == transId) {
				localStorageBen[$scope.uid]["transaction"][i]["acceptanceStatus"] = "denied";
				localStorageBen['1110568334']["transaction"][i]["acceptanceStatus"] = "denied";
			}
		}
		localStorage.setItem('userData', JSON.stringify(localStorageBen));
	}
	
};

$scope.disableSplitBtn = function(transId) {
		if (transId) {
			$("#" + transId).removeClass("button_red").addClass("button_nonclick");
		} else {
			var localStorageBen = JSON.parse(localStorage.userData);
			var splittedTransactionArray = localStorageBen[$scope.uid]["splittedTransactions"];
			for (var i = 0; i < splittedTransactionArray.length; i++) {
				$("#split_" + splittedTransactionArray[i]).addClass("button_nonclick");
			}
		}
};

$scope.getTransactions = function() {
	var args_pending = {
		"args" : {
			"uid" : $scope.uid,
			"token" : $scope.token,
			"api-token" : "HackathonApiToken"
		},
		"year": 2015, 
		"month": 3
	};
	
$http({
		method : 'POST',
		url : "https://api.levelmoney.com/api/v2/hackathon/projected-transactions-for-month",
		data : args_pending,
		headers : {
			'Content-Type' : 'application/json'
		}
	}).success(function(data, status) {
		var localStorageBen = JSON.parse(localStorage.userData);
		var localTransaction = localStorageBen[$scope.uid]["transaction"];
		var apiTransaction = data["transactions"];
		var concatTransaction = localTransaction.concat(apiTransaction);
		data["transactions"] = concatTransaction;
		$scope.pendingTransactions = data;
	}).error(function(data, status) {
		$scope.data = data || "Request failed";
		$scope.status = status;
	});
	
	var args_all = {
		"args" : {
			"uid" : $scope.uid,
			"token" : $scope.token,
			"api-token" : "HackathonApiToken"
		}
	};
	
	$http({
		method : 'POST',
		url : "https://api.levelmoney.com/api/v2/hackathon/get-all-transactions",
		data : args_all,
		headers : {
			'Content-Type' : 'application/json'
		}
	}).success(function(data, status) {
		$scope.recentTransactions = data;
	}).error(function(data, status) {
		$scope.data = data || "Request failed";
		$scope.status = status;
	});
  
	/*
	$.ajax({
			type : "POST",
			url : "https://api.levelmoney.com/api/v2/hackathon/get-all-transactions",
			dataType : 'json',
			contentType : "application/json",
			data : JSON.stringify(args),
			success : function(data) {
				// we have the response
				console.log(data);
				if (data != null) {
					console.log(data);
				}
	
			},
			error : function(e) {
				console.log('Error121212: ' + e);
			}
		}); */
	
};



}]);
