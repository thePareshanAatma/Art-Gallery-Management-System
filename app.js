var express = require('express');
var app = express();
var mysql = require('mysql2');
var path = require('path');

var connection = mysql.createConnection({
    host:'localhost',
    database:'artgallery',
    user:'root',
    password:'',
});

var bodyparser = require('body-parser');
app.use(express.static('views'));
app.use(bodyparser.urlencoded({extended:true}));

// app.post('/search',(req,res)=>{
//     connection.query(
//     `Select * from arts where title = "${req.body.Search}"`,
//     (err,rows,cols)=>{
//     if(err)
//     throw err;
//     res.render('page2.ejs',{result:rows});
// })

//});
var login = 0;
var loginId ="";
app.get('/',(req,res)=>{
    res.render('index.ejs',{login: login});
});
app.post('/add',(req,res)=>{
    console.log(req.body);
var name = req.body.fname +" "+ req.body.lname;
var dob  = req.body.yyyy+"-"+req.body.mm+"-"+req.body.dd;
    connection.query(
    `insert into user values('${req.body.uname}','${name}','${req.body.email}',${req.body.phone},'${dob}','NULL')`,
    (err,rows,cols)=>{
    if(err)
    throw err;
    console.log("Successfully added to customers");
}
)
     connection.query(
    `insert into login values('${req.body.uname}','${req.body.pword}')`,
    (err,rows,cols)=>{
    if(err)
    throw err;
    console.log("Successfully added to login");
}
)
    res.redirect('/');
})

app.get('/cart',(req,res)=>{
    var log = "";
    var link = "";
    connection.query(
        `Select user_name,link from user where user_id ='${loginId}'`,
        (err,rows,cols)=>{
            if(err || rows.length==0) {
                console.log("Doesn't exist");
            }
            console.log(rows);
            log = rows[0].user_name;
            link = rows[0].link});
    connection.query(
        `Select arts.arts_id,arts.title,arts.author,arts.price,arts.link,cart.no_of_items from cart,arts where user_id = '${loginId}' AND cart.arts_id = arts.arts_id`,
        (err,rows,cols)=>{
            if(err || rows.length==0) {
                console.log("Doesn't exist");
            }
            console.log(rows);
            res.render('cart.ejs',{link:link,login: log,loginId: loginId,result: rows});
})})
app.get('/login',(req,res)=>{
    connection.query(
        `Select * from user where user_id ="${loginId}"`, (err, row, col) =>
        {
            login = 1 ;
            res.render('index.ejs', {result: row, login: login});
        }
)})

app.post('/login',(req,res)=>{
    connection.query(
    `Select * from login where login_id ='${req.body.login}' AND 
	password='${req.body.password}'`,
    (err,rows,cols)=>{
    if(err || rows.length==0) {
        console.log("Doesn't exist");
        res.redirect('/');
    }
    else{
    console.log("LoginId exists");

    //console.log(rows[0].login_id);
        loginId = rows[0].login_id;
    connection.query(
        `Select * from user where user_id ="${rows[0].login_id}"`, (err, row, col) =>
    {
        login = 1 ;

        res.render('index.ejs', {result: row, login: login});}
)
}
}

)}
)
app.post('/paintings',(req,res)=>{
    console.log(req.body.Search);
	connection.query(
	`Select * from arts where title='${req.body.Search}'`,
	(err,rows,cols)=>{
		if(err)
		throw err;
		console.log(rows);
		res.render('page1.ejs',{result:rows});
	})

});

app.get('/signout',(req,res)=>{
    login=0;
    loginId="";
    res.render("index.ejs",{login: login});
})
app.get('/addtocart',(req,res)=>{

    connection.query(
        `select * from cart where `,
        (err,rows,cols)=>{
            if(err)
                throw err;
            console.log("Successfully added to cart");
        }
    )
})
app.get('/showLogin',(req,res)=>{
    console.log(loginId);
    connection.query(
        `Select * from user where user_id ="${loginId}"`, (err, row, col) =>
        {
            if(err)
                throw err;
            res.render("displayDetails.ejs", {result: row});
        })})

app.get('/orders',(req,res)=>{

    connection.query(
        `Select user_name,link from user where user_id ='${loginId}'`,
        (err,rows,cols)=>{
            if(err || rows.length==0) {
                console.log("Doesn't exist");
            }
            log = rows[0].user_name;
        link = rows[0].link;
        console.log(link);
        })
    connection.query(`Select arts.arts_id,arts.title,arts.author,arts.price,arts.link,arts.no_of_paint from orders,arts where order_cus_id = '${loginId}' AND orders.arts_id = arts.arts_id`,(err, row, col)=>{
        if(err)
            throw err;
        res.render("orders.ejs",{link:link,result: row,login:log,loginId:loginId});
    })

});
app.get('/profile',(req,res)=>{
    var result={};
    connection.query(
        `Select user_name,user_email,user_dob,user_id,link,password from user,login where user_id ='${loginId}' AND login_id = user_id`,
        (err,rows,cols)=>{
            if(err || rows.length==0) {
                console.log("Doesn't exist");
            }
            console.log(rows);
            res.render('profile.ejs',{result: rows});
        });

})
app.use('/delete/:id',(req,res)=> {
    console.log(req.params.id);
    connection.query(`delete from cart where user_id='${loginId}' AND arts_id='${req.params.id}'`,(err,rows,cols)=>{
        if(err)
            throw err;
        res.redirect('/cart');
    })
})
app.get('/deactivate',(req,res)=>{
    connection.query(`delete from user where user_id='${loginId}'`,(err,rows,cols)=>{
        if(err)
            throw err;
        login=0;
        loginId="";
        res.render('index.ejs',{login:login});
    })
})
app.listen(8000,function(){
    console.log("Server started at port 8000");
})