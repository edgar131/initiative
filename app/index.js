'use strict';

module.exports = 'app';

require('angular-material');
require('angular-messages');
require('ngstorage');
require('angular-material/angular-material.min.css');
require('./encounter.less');
angular.module(module.exports, ["ngMaterial", "ngMessages", "ngStorage"])
    .config(['$mdIconProvider', function($mdIconProvider) {
        $mdIconProvider
            .iconSet('action', '/assets/action-icons.svg', 24)
            .iconSet('alert', '/assets/alert-icons.svg', 24)
            .iconSet('av', '/assets/av-icons.svg', 24)
            .iconSet('communication', '/assets/communication-icons.svg', 24)
            .iconSet('content', '/assets/content-icons.svg', 24)
            .iconSet('device', '/assets/device-icons.svg', 24)
            .iconSet('editor', '/assets/editor-icons.svg', 24)
            .iconSet('file', '/assets/file-icons.svg', 24)
            .iconSet('hardware', '/assets/hardware-icons.svg', 24)
            .iconSet('icons', '/assets/icons-icons.svg', 24)
            .iconSet('image', '/assets/image-icons.svg', 24)
            .iconSet('maps', '/assets/maps-icons.svg', 24)
            .iconSet('navigation', '/assets/navigation-icons.svg', 24)
            .iconSet('notification', '/assets/notification-icons.svg', 24)
            .iconSet('social', '/assets/social-icons.svg', 24)
            .iconSet('toggle', '/assets/toggle-icons.svg', 24)
    }])

    .factory('util', function(){
        var calcMod = function(stat){
            return Math.floor((stat-10)/2);
        };
        var calcModAsString = function(stat){
            var mod = calcMod(stat);
            if(mod > 0) {
                return "+" + mod;
            }
            return "" + mod;
        };
        return {
            calcMod: calcMod,
            calcModAsString: calcModAsString
        };
    })

    .directive('encounter', function(){
        return {
            template: require('./encounter.tpl.html'),
            controllerAs: "encounterCtrl",
            bindToController: true,
            controller: function($scope, $mdDialog, $localStorage, util){
                var ctrl = this;
                ctrl.participants = [{
                    combat: {
                        initiative: 10,
                        hp: 22
                    },
                    data: {
                        name: "Vrell",
                        ac: 16,
                        maxhp: 22,
                        stats: {
                            str: 8,
                            dex: 16,
                            con: 14,
                            int: 12,
                            wis: 15,
                            cha: 10
                        }
                    }
                }, {
                    combat: {
                        initiative: 18,
                        hp: 16
                    },
                    data: {
                        name: "Shin",
                        ac: 18,
                        maxhp: 16,
                        stats: {
                            str: 16,
                            dex: 12,
                            con: 14,
                            int: 10,
                            wis: 17,
                            cha: 12
                        }
                    }
                }, {
                    combat: {
                        initiative: 2,
                        hp: 17
                    },
                    data: {
                        name: "Nari",
                        ac: 14,
                        maxhp: 17,
                        stats: {
                            str: 16,
                            dex: 12,
                            con: 14,
                            int: 10,
                            wis: 17,
                            cha: 12
                        }
                    }
                }];
                ctrl.activeIndex = 0;
                ctrl.calcMod = util.calcModAsString;
                ctrl.modHP = function(participant, damage){
                    participant.combat.hp += damage;
                };
                ctrl.removeParticipant = function(participant){
                    var idx = $scope.participants.indexOf(participant)
                    ctrl.participants.splice(idx, 1);
                    if(idx >= $scope.participants.length){
                        $scope.activeIndex = 0;
                    }
                };
                ctrl.editParticipant = function($event, participant){
                    var scope = $scope.$new();
                    scope.participant = angular.copy(participant);
                    scope.editMode = true;
                    $mdDialog.show({
                        scope: scope,
                        template: require('./addParticipant.tpl.html'),
                        targetEvent: $event,
                        controller: 'addParticipant',
                        clickOutsideToClose: true
                    }).then(function(editParticipant){
                        ctrl.participants[ctrl.participants.indexOf(participant)] = editParticipant;
                    });
                };
                ctrl.addParticipant = function($event){
                    $mdDialog.show({
                        template: require('./addParticipant.tpl.html'),
                        targetEvent: $event,
                        controller: 'addParticipant',
                        clickOutsideToClose: true
                    }).then(function(participant){
                        ctrl.participants.push(participant);
                    });
                };
                ctrl.saveParty = function($event){
                    $mdDialog.show({
                        template: require('./party.tpl.html'),
                        targetEvent: $event,
                        controller: function($scope, $mdBottomSheet){
                            $scope.newParty = {
                                name: "New Party"
                            };
                            $scope.parties = $localStorage.parties;
                            $scope.save = function(){
                                $mdDialog.hide({
                                    name: $scope.partyname,
                                    party: $scope.selParty
                                });
                            };
                            $scope.delete = function(){
                                if($scope.selParty !== $scope.newParty){
                                    $scope.selParty = $scope.newParty;
                                    $scope.partyname = undefined;
                                    $localStorage.parties.splice($localStorage.parties.indexOf($scope.selParty), 1);
                                }
                            };
                            $scope.addToEncounter = function(){
                                $mdBottomSheet.show({
                                    template: '<md-bottom-sheet>TEST</md-bottom-sheet>',
                                    parent: $event.target
                                });
                                /*if($scope.selParty !== $scope.newParty){
                                    ctrl.participants = ctrl.participants.concat($scope.selParty.participants);
                                }*/
                            };
                            $scope.cancel = function(){
                                $mdDialog.cancel();
                            };
                        },
                        clickOutsideToClose: true
                    }).then(function(resp){
                        if($localStorage.parties === undefined){
                            $localStorage.parties = [];
                        }
                        var idx = $localStorage.parties.indexOf(resp.party);
                        if(idx >= 0){
                            $localStorage.parties[idx] = {
                                name: resp.name,
                                participants: ctrl.participants
                            };
                        } else {
                            $localStorage.parties.push({
                                name: resp.name,
                                participants: ctrl.participants
                            });
                        }
                    });
                };
                ctrl.next = function(){
                    ctrl.activeIndex++;
                    if(ctrl.activeIndex >= ctrl.participants.length){
                        ctrl.activeIndex = 0;
                    }
                };
            }
        };
    })

    .directive('participantInfoForm', function(){
        return {
            scope: {
                participant: '='
            },
            require: '^form',
            link: function(scope, element, attrs, form){
                scope.pform = form;
            },
            controller: function($scope, util){
                $scope.calcMod = util.calcModAsString;
            },
            template: require('./participant-info-form.tpl.html')
        };
    })

    .directive('combatInfoForm', function(){
        return {
            scope: {
                participant: '='
            },
            require: '^form',
            link: function(scope, element, attrs, form){
                scope.pform = form;
            },
            template: require('./combat-info-form.tpl.html')
        };
    })

    .controller('addParticipant', function($scope, $mdDialog, util){
        $scope.calcMod = util.calcModAsString;
        $scope.add = function(){
            $mdDialog.hide($scope.participant);
        };
        $scope.cancel = function(){
            $mdDialog.cancel();
        };
        $scope.validateStat = function(stat){
            return !isNaN(stat)
        };
    });