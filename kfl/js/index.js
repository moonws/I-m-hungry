/**
 * Created by Administrator on 2017/4/6.
 */
angular.module("myApp",["ng","ngRoute"])
    .controller("startCtrl",function($timeout,$location){
        $timeout(function(){
            //2秒以后自动跳到main页面
            $location.path("/main");
        },2000);
    })
    .controller("mainCtrl",function($scope,$http){
        //一组取4个
        var num=4;
        var index=1;
        $scope.dishes=[];
        //设置加载状态，1:未加载，2加载中，3没有加载更多
        $scope.loadStatus=1;
        $scope.searchText="";
        function getDishes(){
            $scope.loadStatus=2;
            //服务请求，到后台获取数据
            $http({
                url:"getDishes",  //向后端获取数据的路径
                method:"get",
                params:{          //传参，通过地址栏的参数传递，还有一种data方式传参（麻烦）
                    num:num,
                    index:index,
                    searchText:$scope.searchText
                }
            }).success(function(data){
                //从后端获取数据成功后，将数据放到数组里面
                $scope.dishes=$scope.dishes.concat(data);
                index++;
                //如果数据库中没有数据了
                if(data.length==0){
                    $scope.loadStatus=3;
                }else {
                    $scope.loadStatus=1;
                }
                console.log($scope.dishes);
            });
        };
        $scope.getMoreDishes=function(){
            getDishes();
        };
        $scope.searchDishes=function (event) {
            if(event.keyCode==13){
                //后端根据查询内容取得菜谱信息
                if($scope.searchText==""){
                    $scope.dishes=[];
                    getDishes();
                }else{
                    $http({
                        url:"getDishes",
                        method:"get",
                        params:{
                            num:num,
                            index:index,
                            searchText:$scope.searchText
                        }
                    }).success(function (data) {
                        $scope.dishes=data;
                        index=1;
                        $scope.loadStatus=3;
                    })
                }
            };
        }


        getDishes();

    })
    .controller("detailCtrl",function($scope,$routeParams,$http){
        //你在路由里面设置的是什么变量就是$routeParams.什么。
        //$routeParams用来获取路由参数
        var did=$routeParams.did;
        $scope.dish=[];
        //根据菜ID，向后端发送请求($http)
        $http({
            url:"getDish",
            method:"get",
            params:{
                did:$routeParams.did
            }
        }).success(function(data){
            //由于每次只是查找一条记录，所以直接获取这个数据，此时是一个对象
            $scope.dish=data[0];
           // console.log(data);
        })

    })
    .controller("myOrderCtrl",function($scope,$http){
        $scope.orders = [];
        $scope.hasOrder = false;
        function GetLocalStorage(key){
            return localStorage.getItem("kfl_" + key);
        }
        var phone = GetLocalStorage("phone");
        //console.log(phone);
        if(phone != null){
            $http({
                url:"getMyOrders",
                method:"get",
                params:{
                    phone:phone
                }
            }).success(function(data){
                $scope.hasOrder = true;
                $scope.orders = data;
            });
        }else{
            $scope.hasOrder = false;
        }
    })
    .controller("orderCtrl",function($timeout,$routeParams,$scope,$http,$location){
        //$location可以用来实现页面的跳转
        function SetLocalStorage(key,value){
            localStorage.setItem("kfl_" + key,value );
        }
        function GetLocalStorage(key){
            return localStorage.getItem("kfl_" + key);
        }

        var id = $routeParams.id;
        $scope.msg = "";
        $scope.userName = GetLocalStorage("userName");
        $scope.sex = GetLocalStorage("sex");
        $scope.phone = GetLocalStorage("phone");
        $scope.addr = GetLocalStorage("addr");
        $scope.orderDish = function(){
            var userName = $scope.userName;
            var sex  = $scope.sex;
            var phone = $scope.phone;
            var addr = $scope.addr;

            console.log(userName,sex,phone,addr);
            if(userName == ""){
                showMsg("联系人");
                return;
            }
            if(sex == ""){
                showMsg("性别");
                return;
            }
            if(phone == ""){
                showMsg("联系电话");
                return;
            }
            if(addr == ""){
                showMsg("送餐地址");
                return;
            }
            $http({
                url:"orderDish",
                method:"get",
                params:{
                    "userName":userName,
                    "sex":sex,
                    "phone":phone,
                    "addr":addr,
                    "did":id
                }
            }).success(function(data){
                console.log(data);
                //如果插入成功
                //保存用户输入信息到 localstorage
                if(data.result>0){
                    SetLocalStorage("userName",userName);
                    SetLocalStorage("sex",sex);
                    SetLocalStorage("phone",phone);
                    SetLocalStorage("addr",addr);
                //跳转到我的订单页面
                    $location.path("/myOrder");
                }
                console.log(data);
                //1.给出成功提示，并且跳转页面到订购清单

            });
            function showMsg(msg){
                $scope.msg = msg;
                $timeout(function(){
                    $scope.msg = "";
                },3000);
            }
        }
    })

    .config(function($routeProvider){
        $routeProvider
            .when("/start",{
                templateUrl:"template/start.html",
                controller:"startCtrl"
            })
            .when("/main",{
                templateUrl:"template/main.html",
                controller:"mainCtrl"
            })
            //:did变量名，有多个不同的详情页
            .when("/detail/:did",{
                templateUrl:"template/detail.html",
                controller:"detailCtrl"
            })
            .when("/myOrder",{
                templateUrl:"template/myOrder.html",
                controller:"myOrderCtrl"
            })
            .when("/order/:id",{
                templateUrl:"template/order.html",
                controller:"orderCtrl"
            })
            .otherwise({
                redirectTo:"/start"
            })
    })