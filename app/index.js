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
            .iconSet('action', require('./assets/action-icons.svg'), 24)
            .iconSet('alert', require('./assets/alert-icons.svg'), 24)
            .iconSet('av', require('./assets/av-icons.svg'), 24)
            .iconSet('communication', require('./assets/communication-icons.svg'), 24)
            .iconSet('content', require('./assets/content-icons.svg'), 24)
            .iconSet('device', require('./assets/device-icons.svg'), 24)
            .iconSet('editor', require('./assets/editor-icons.svg'), 24)
            .iconSet('file', require('./assets/file-icons.svg'), 24)
            .iconSet('hardware', require('./assets/hardware-icons.svg'), 24)
            .iconSet('image', require('./assets/image-icons.svg'), 24)
            .iconSet('maps', require('./assets/maps-icons.svg'), 24)
            .iconSet('navigation', require('./assets/navigation-icons.svg'), 24)
            .iconSet('notification', require('./assets/notification-icons.svg'), 24)
            .iconSet('social', require('./assets/social-icons.svg'), 24)
            .iconSet('toggle', require('./assets/toggle-icons.svg'), 24)
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
                ctrl.combatants = [];
                /*ctrl.combatants = [{
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
                }];*/
                ctrl.activeIndex = 0;
                ctrl.calcMod = util.calcModAsString;
                ctrl.modHP = function(combatant, damage){
                    if(!isNaN(damage)){
                        combatant.combat.hp += damage;
                    }
                };
                ctrl.removeCombatant = function($event, combatant){
                    $mdDialog.show($mdDialog.confirm()
                        .ok('Remove')
                        .cancel('Cancel')
                        .title('Are you sure you wish to remove ' + combatant.data.name + ' from the encounter?')
                        .targetEvent($event)).then(function(){
                        var idx = ctrl.combatants.indexOf(combatant);
                        ctrl.combatants.splice(idx, 1);
                        if(idx >= ctrl.combatants.length){
                            ctrl.activeIndex = 0;
                        }
                    });
                };
                ctrl.editCombatant = function($event, combatant){
                    var scope = $scope.$new();
                    scope.combatant = angular.copy(combatant);
                    scope.editMode = true;
                    $mdDialog.show({
                        scope: scope,
                        template: require('./addCombatant.tpl.html'),
                        targetEvent: $event,
                        controller: 'addCombatant',
                        clickOutsideToClose: true
                    }).then(function(editcombatant){
                        ctrl.combatants[ctrl.combatants.indexOf(combatant)] = editcombatant;
                    });
                };
                ctrl.addCombatant = function($event){
                    $mdDialog.show({
                        template: require('./addCombatant.tpl.html'),
                        targetEvent: $event,
                        controller: 'addCombatant',
                        clickOutsideToClose: true
                    }).then(function(combatant){
                        ctrl.combatants.push(combatant);
                    });
                };
                ctrl.saveParty = function($event){
                    $mdDialog.show({
                        template: require('./party.tpl.html'),
                        targetEvent: $event,
                        controller: function($scope, $mdBottomSheet){
                            $scope.saveable = ctrl.combatants.length > 0;
                            $scope.state = 'create';
                            $scope.tabIndex = 0;
                            $scope.newParty = {
                                name: "New Party"
                            };
                            $scope.parties = $localStorage.parties;
                            $scope.save = function(){
                                var saveParty = angular.copy(ctrl.combatants);
                                angular.forEach(saveParty, function(combatant){
                                    delete combatant.combat;
                                });
                                if($localStorage.parties === undefined){
                                    $localStorage.parties = [];
                                }
                                var idx = $localStorage.parties.indexOf($scope.selParty);
                                if(idx >= 0){
                                    $localStorage.parties[idx] = {
                                        name: $scope.partyname,
                                        combatants: saveParty
                                    };
                                } else {
                                    $localStorage.parties.push({
                                        name: $scope.partyname,
                                        combatants: saveParty
                                    });
                                }
                                $mdDialog.hide();
                            };
                            $scope.delete = function(){
                                if($scope.selParty !== $scope.newParty){
                                    $localStorage.parties.splice($localStorage.parties.indexOf($scope.selParty), 1);
                                    $scope.selParty = $scope.newParty;
                                    $scope.partyname = undefined;
                                }
                            };
                            $scope.editPartyForEncounter = function($event){
                                $event.preventDefault();
                                $scope.state = 'add';
                                $scope.saveParty = angular.copy($scope.selParty);
                            };
                            $scope.addPartyToEncounter = function () {
                                if ($scope.selParty !== $scope.newParty) {
                                    ctrl.combatants = ctrl.combatants.concat($scope.saveParty.combatants);
                                }
                                $mdDialog.hide();
                            };
                            $scope.cancel = function(){
                                $mdDialog.cancel();
                            };
                        },
                        clickOutsideToClose: true
                    });
                };
                ctrl.next = function(){
                    ctrl.activeIndex++;
                    if(ctrl.activeIndex >= ctrl.combatants.length){
                        ctrl.activeIndex = 0;
                    }
                };
            }
        };
    })

    .directive('combatantInfoForm', function(){
        return {
            scope: {
                combatant: '='
            },
            require: '^form',
            link: function(scope, element, attrs, form){
                scope.pform = form;
            },
            controller: function($scope, util){
                $scope.calcMod = util.calcModAsString;
                $scope.stats = ["str", "dex", "con", "int", "wis", "cha"];
            },
            template: require('./combatant-info-form.tpl.html')
        };
    })

    .directive('combatInfoForm', function(){
        return {
            scope: {
                combatant: '='
            },
            require: '^form',
            link: function(scope, element, attrs, form){
                scope.pform = form;
            },
            template: require('./combat-info-form.tpl.html')
        };
    })

    .controller('addCombatant', function($scope, $mdDialog, util){
        $scope.calcMod = util.calcModAsString;
        $scope.add = function(){
            $mdDialog.hide($scope.combatant);
        };
        $scope.cancel = function(){
            $mdDialog.cancel();
        };
        $scope.validateStat = function(stat){
            return !isNaN(stat)
        };
    });