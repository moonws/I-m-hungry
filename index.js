/**
 * Created by Administrator on 2017/4/7.
 */
    //引入模块
var express=require("express");
var mysql=require("mysql");
//连接数据库
var conn=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"1234",
    database:"kfl"
})
//连接数据库
conn.connect();
//app是express对象的一个实例
//express()是一个由express模块到导出的入口函数
var app=express();

//引入静态文件，express.static是Express内置的唯一一个中间件，参数指的是静态资源文件所在的根目录。
app.use(express.static("kfl"));

app.get("/getDishes",function(req,res){
    //获取前端传过来的参数
    var num=req.query.num;
    var index=req.query.index-1;
    var searchText=req.query.searchText;
    var sqlStr;
    if(searchText==""){
        sqlStr="select * from kf_dish limit "+index*num+ "," +num
    }else {
        sqlStr="select * from kf_dish where name like '%" + searchText + "%' or material like '%" + searchText + "%'";
    }
    //在数据库中查找数据
    conn.query(sqlStr,function(err,result){
        if(err) throw err;
        //把查询到的结果直接发送给前端,res.json()/res.send()
        res.send(result);
    })
})

app.get("/getDish",function(req,res){
    //1.获取前端传过来的菜ID
    //2.写sql查询语句
    //3.conn.query 查询,并把结果返回前端
    var id=req.query.did;
    var sqlID="select * from kf_dish where did="+id;
    conn.query(sqlID,function(err,result){
        if(err) throw err;
        //把查询到的结果直接发送给前端,res.json()/res.send()
        res.send(result);
    })
})

app.get("/orderDish",function(req,res){
    //1.接收订单信息
    //（属性）列名称必须与数据库后台名称一致，接收前端传过来的值
    var dish = {
        user_Name : req.query.userName,
        sex : req.query.sex,
        phone : req.query.phone,
        addr : req.query.addr,
        did:req.query.did
    };
    console.log(dish);
    //console.log(userName,sex,phone,addr);
    //2.拼接查询语句(insert)
    conn.query("insert into kf_order set ?",dish,function(err,results){
        if(err) throw err;
        res.send({"result":results.insertId})
    });
    // insert into 表名 values(值,值,....)
    // insert into 表名 set 列名=值,....
    //3.执行语句，并返回信息
});
app.get("/getMyOrders",function(req,res){
    var phone = req.query.phone;
    var sqlStr = "select * from kf_order inner join kf_dish on kf_order.did = kf_dish.did where phone ='" + phone + "' order by oid desc";
    conn.query(sqlStr,function(err,result){
        if(err) throw err;
        //把查询到的结果直接发送给前端,res.json()/res.send()
        res.json(result);
    })
})


//监听端口
app.listen(3000)
