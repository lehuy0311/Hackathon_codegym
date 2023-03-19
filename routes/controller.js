var express = require('express');
var router = express.Router();
var multer = require('multer');
var db = require('../models/model');
var alert = require('alert');

// var server = require("http").createServer(app);
// var io = require("socket.io")(server);
var moment = require('moment');

router.get('/', function(req, res, next){
  res.render("login");
  //res.render("chat");
});
router.post('/login', function(req, res, next) {
  let user = req.body.user;
  let pass = req.body.pass;
	if(user=="" || pass=="") res.render("login");
	else{
    db.query(`SELECT ad.username AS aduser, ad.password AS adpass,
    cus.username AS cususer, cus.password AS cuspass,
    dr.username AS druser, dr.password AS drpass FROM doctor AS dr,
    admin AS ad, customer AS cus`,
    function(err, data) {
        if (err) throw err;
        var ad = 0;
        var cu = 0;
        var dr = 0;
        for(let i of data){
          if(i.aduser===user && i.adpass===pass){
            ad = 1;
            break;
          }
          if(i.cususer===user && i.cuspass===pass){
            cu = 1;
            break;
          }
          if(i.druser===user && i.drpass===pass){
            dr = 1;
            break;
          }
        }
        if (dr==1){
          db.query(`select * from doctor where username=? and password=?`,
          [user, pass], function(err, dt){
            if(err) throw err;
            var high = 0;
            if (dt[0].dr_high) high = 1;
            db.query('select * from tag', function(err, dta){
              if(err) throw err;
              db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
                post.time, post.id_dr, post.content, post.title,
                post.image_path, post.liked, post.id_post
                from post left join doctor as dr on post.id_dr = dr.id_dr
                left join tag on post.id_tag = tag.id_tag`,
              function(err, dataBase){
                if(err) throw err;
                let users = {
                  id:dt[0].id_dr,
                  name:dt[0].name,
                  tag:dt[0].id_tag,
                  liked_post:dt[0].liked_post
                }
                if (typeof localStorage === "undefined" || localStorage === null) {
                   var LocalStorage = require('node-localstorage').LocalStorage;
                   localStorage = new LocalStorage('./scratch');
                }
                localStorage.setItem('user', JSON.stringify(users));
                localStorage.setItem('isHigh', high);
                localStorage.setItem('isDoctor', 1);
                localStorage.setItem('posts', JSON.stringify(dataBase));
                localStorage.setItem('tags', JSON.stringify(dta));
                res.render("anotherDoctorPage",{user:users});
              });
            });
          });
        }
        else if(cu==1){
          db.query('select * from customer where username=? and password=?',
          [user, pass], function(err, dt){
            if(err) throw err;
            db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
              post.time, post.id_dr, post.content, post.title,
              post.image_path, post.liked, post.id_post
              from post left join doctor as dr on post.id_dr = dr.id_dr
              left join tag on post.id_tag = tag.id_tag`,
            function(err, dataBase){
              if(err) throw err;
              let users = {
                id:dt[0].id_user,
                name:dt[0].name,
                liked_post:dt[0].liked_post
              }
              if (typeof localStorage === "undefined" || localStorage === null) {
                 var LocalStorage = require('node-localstorage').LocalStorage;
                 localStorage = new LocalStorage('./scratch');
              }
              localStorage.setItem('user', JSON.stringify(users));
              localStorage.setItem('isHigh', 0);
              localStorage.setItem('isDoctor', 0);
              localStorage.setItem('posts', JSON.stringify(dataBase));
              res.render("SOS",{user:users});
            });
          });
        }
        else if(ad==1){
          db.query(`select id_admin, name, liked_post from admin where username=? and password=?`,
          [user, pass], function(err, dta){
            if (typeof localStorage === "undefined" || localStorage === null) {
               var LocalStorage = require('node-localstorage').LocalStorage;
               localStorage = new LocalStorage('./scratch');
            }
            let users = {
              id:dta[0].id_admin,
              name:dta[0].name,
              liked_post:dta[0].liked_post
            }
            localStorage.setItem('user', JSON.stringify(users));
            localStorage.setItem('isHigh', 0);
            localStorage.setItem('isDoctor', 0);
            db.query(`SELECT * FROM customer`, function(err, data) {
              //id, name, phone, email, dr_high,name_tag,
              db.query(`SELECT dr.id_dr, dr.name, dr.phonenumber, dr.email, dr.dr_high,
                tag.name_tag, rank.name_rank
                FROM doctor as dr
                left join tag on dr.id_tag = tag.id_tag
                left join rank on dr.id_rank = rank.id_rank`, function(err, dt) {
                  res.render("admin", {id_ad:users.id, cusList:data, docList:dt});
              });
            });
          });
        }
    });
	}
});

router.post('/register', function(req, res){
  var name = req.body.name;
  var user = req.body.user;
  var pass = req.body.pass;
  var again = req.body.again;
  var phone = req.body.num;
  var mail = req.body.email;
  var ava = req.body.avatar;
  var check = req.body.DocCheck;
  if(pass != again) res.render("login");
  if(check){
    var tag = req.body.speciality;
    var prove = req.body.image;
    db.query('SELECT dr.id_pre, tag.* from pre_doctor as dr, tag',
    function(err, dt){
      if(err) throw err;
      var idTag = 0;
      var idPre = 0;
      var tmp = 0;
      for(let i of dt){
        if(i.id_pre>idPre) idPre = Number(i.id_pre) + 1;
        if (i.name_tag.includes(tag)) idTag = i.id_tag;
        else tmp = Number(i.id_tag) + 1;
      }
      if (idTag==0) {
        idTag = tmp;
        var category = {id_tag:idTag, name_tag:tag};
        db.query('insert into tag SET ?', category, function(err, data) {
            if (err) throw err;
        });
      }
      else{}
      var rgt = {id_pre:idPre, name:name, username:user, password:pass, phonenumber:phone,
        email:mail, icon_image:ava, image_prove:prove, id_tag:idTag};
      db.query('insert into pre_doctor SET ?', rgt, function(err, dta) {
          if (err) throw err;
          alert("Created your doctor account, please wait for admin accept!");
          res.render("login");
      });
    });
  }
  else{
    var idUser = "CU";
    db.query(`SELECT id_user from customer ORDER BY CAST(SUBSTRING(id_user, 3) AS UNSIGNED) DESC LIMIT 1`,
    function(err, data) {
        if (err) throw err;
        var number = Number(data[0].id_user.substring(2)) + 1;
        idUser = idUser + String(number);
        var rgt = {id_user:idUser, name:name, username:user, password:pass,
          phonenumber:phone, email:mail, icon_image:ava};
        db.query('insert into customer SET ?', rgt, function(err, dt) {
            if (err) throw err;
            db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
              post.time, post.id_dr, post.content, post.title,
              post.image_path, post.liked, post.id_post
              from post left join doctor as dr on post.id_dr = dr.id_dr
              left join tag on post.id_tag = tag.id_tag`,
            function(err, dataBase){
              if(err) throw err;
              let users = {
                id:idUser,
                name:name,
                liked_post:null
              }
              if (typeof localStorage === "undefined" || localStorage === null) {
                 var LocalStorage = require('node-localstorage').LocalStorage;
                 localStorage = new LocalStorage('./scratch');
              }
              localStorage.setItem('user', JSON.stringify(users));
              localStorage.setItem('isHigh', 0);
              localStorage.setItem('isDoctor', 0);
              localStorage.setItem('posts', JSON.stringify(dataBase));
              res.render("home");
            });
        });
    });
  }
});

router.get('/mainForm', function(req, res){
  db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
    post.time, post.id_dr, post.content, post.title,
    post.image_path, post.liked, post.id_post
    from post left join doctor as dr on post.id_dr = dr.id_dr
    left join tag on post.id_tag = tag.id_tag`,
  function(err, data) {
      if (err) throw err;
      if (typeof localStorage === "undefined" || localStorage === null) {
         var LocalStorage = require('node-localstorage').LocalStorage;
         localStorage = new LocalStorage('./scratch');
      }
      localStorage.setItem('posts', JSON.stringify(data));
      res.render("home");
    });
});

router.get('/addNewDoc', function(req, res){
  db.query(`SELECT dr.id_pre, dr.name, dr.phonenumber, dr.email, dr.image_prove,
    tag.name_tag FROM pre_doctor as dr
    left join tag on dr.id_tag = tag.id_tag`, function(err, dt) {
      res.render("addNewDoc", {docList:dt});
  });
});
router.get('/addDoc/:id', function(req, res){
  var id = req.params.id;
  db.query(`SELECT * FROM pre_doctor where id_pre='${id}'`, function(err, dt) {
    res.render("addDoc", {doc:dt[0]});
  });
});

router.get('/DocRespon', function(req, res){
  db.query(`SELECT * FROM doctor where want_high=1`, function(err, data) {
    res.render("authorizeDoc",{docList:data});
  });
});
router.post('/storeAuthorDoc', function(req, res){
  var auth = req.body.authorize;
  db.query(`SELECT dr.*, tag.name_tag, rank.name_rank FROM doctor as dr
    left join tag on dr.id_tag = tag.id_tag
    left join rank on rank.id_rank = dr.id_rank
    where dr.id_dr=?`,[auth], function(err, data) {
      res.render("authorDoc",{doc:data[0]});
  });
});
router.post('/storeDoc', function(req, res){
  var id = req.body.add;
  var auth = req.body.authorize;
  if(typeof auth != 'undefined'){
    db.query(`UPDATE doctor SET dr_high=1, want_high=0 WHERE id_dr=?`,[auth], function(err, dt){
      if(err) throw err;
      db.query(`SELECT * FROM doctor where want_high=1`, function(err, data) {
        res.render("authorizeDoc",{docList:data});
      });
    });
  }
  else{
    var idDr = "DR";
    db.query(`select * from pre_doctor where id_pre=?`,[id], function(err, dta){
      db.query(`SELECT id_dr from doctor ORDER BY CAST(SUBSTRING(id_dr, 3) AS UNSIGNED) DESC LIMIT 1`,
      function(err, data) {
          if (err) throw err;
          var number = Number(data[0].id_dr.substring(2)) + 1;
          idDr = idDr + String(number);
          var rgt = {id_dr:idDr, name:dta[0].name, username:dta[0].username,
            password:dta[0].password, phonenumber:dta[0].phonenumber, email:dta[0].email,
            icon_image:dta[0].icon_image, id_tag:dta[0].id_tag, image_prove:dta[0].image_prove};
          db.query('insert into doctor SET ?', rgt, function(err, dt) {
              if (err) throw err;
              db.query('delete from pre_doctor where id_pre=?', [id], function(err, dt) {
                  if (err) throw err;
                  db.query(`SELECT dr.id_pre, dr.name, dr.phonenumber, dr.email, dr.image_prove,
                    tag.name_tag FROM pre_doctor as dr
                    left join tag on dr.id_tag = tag.id_tag`, function(err, dt) {
                      res.render("addNewDoc", {docList:dt});
                  });
              });
          });
      });
    });
  }
});

router.get('/customer/:id', function(req, res){
  var id = req.params.id;
  db.query(`SELECT * FROM customer where id_user='${id}'`, function(err, dt) {
    res.render("cusProfile", {cus:dt[0]});
  });
});
router.get('/doctor/:id', function(req, res){
  var id = req.params.id;
  db.query(`select * from post where id_dr='${id}'`, function(err, dta){
    db.query(`SELECT dr.id_dr, dr.name, dr.phonenumber, dr.email, dr.dr_high, dr.image_prove,
      dr.icon_image, tag.name_tag, rank.name_rank
      FROM doctor as dr
      left join tag on dr.id_tag = tag.id_tag
      left join rank on dr.id_rank = rank.id_rank
      WHERE dr.id_dr='${id}'`, function(err, dt) {
        res.render("docProfile", {doc:dt[0], posts:dta});
    });
  });
});

router.get('/ranking', function(req, res){
  db.query(`SELECT dr.*, tag.name_tag, rank.name_rank
    FROM doctor as dr left join tag on dr.id_tag = tag.id_tag
    left join rank on dr.id_rank = rank.id_rank ORDER BY CAST(dr.sum_like as UNSIGNED) DESC`,
    function(err, data){
      if(err) throw err;
      db.query(`select * from tag`,function(err, dt){
        if(err) throw err;
        res.render("Leaderboard",{tags:dt, docs:data});
      });
   });
});

router.get('/allTag', function(req, res){
  db.query(`select * from tag`,function(err, dt){
    if(err) throw err;
    res.render("allTag",{tags:dt});
  });
});
router.get('/postTag/:id', function(req, res){
  var id = req.params.id;
    db.query(`select * from post where id_tag='${id}'`,function(err, dt){
      if(err) throw err;
      db.query(`select * from tag where id_tag='${id}'`,function(err, dta){
        if(err) throw err;
        res.render("postOfTag",{posts:dt, tag:dta});
      });
    });
});

router.get('/profile/:id', function(req, res){
  var id = req.params.id;
  if (typeof localStorage === "undefined" || localStorage === null) {
     var LocalStorage = require('node-localstorage').LocalStorage;
     localStorage = new LocalStorage('./scratch');
  }
  localStorage.setItem('admin',String(id));
  if(String(id).substr(0, 2).includes("DR")){
    db.query(`SELECT dr.id_dr, dr.name, dr.phonenumber, dr.email, dr.dr_high,
      dr.icon_image, dr.want_high, dr.id_rank, tag.name_tag, rank.name_rank
      FROM doctor as dr
      left join tag on dr.id_tag = tag.id_tag
      left join rank on dr.id_rank = rank.id_rank
      WHERE dr.id_dr='${id}'`, function(err, dt) {
        res.render("selfProfile", {user:dt[0]});
    });
  }
  else if(String(id).substr(0, 2).includes("CU")){
    db.query(`SELECT * FROM customer where id_user='${id}'`, function(err, dt) {
      res.render("selfProfile", {user:dt[0]});
    });
  }
  else{
    db.query(`SELECT * FROM admin where id_admin='${id}'`, function(err, dt) {
      res.render("selfProfile", {user:dt[0]});
    });
  }
});

router.get('/editPost/:id', function(req, res){
  var id = req.params.id;
  db.query(`select dr.name, dr.icon_image, post.time, post.id_dr, post.content,
    post.title, post.image_path, post.id_post from post
    left join doctor as dr on post.id_dr = dr.id_dr where post.id_post='${id}'`,
    function(err, data){
      if(err) throw err;
      res.render("editPost", {post:data});
  });
});
router.get('/alterPost/:id', function(req, res){
  var id = req.params.id;
  var image = req.body.img;
  var title = req.body.tit;
  var content = req.body.cont;
  var rgt = {image_path:image, title:title, content:content};
  db.query(`update post SET ? where id_post='${id}'`,rgt, function(err, dta){
    if(err) throw err;
    db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
      post.time, post.id_dr, post.content, post.title,
      post.image_path, post.liked, post.id_post
      from post left join doctor as dr on post.id_dr = dr.id_dr
      left join tag on post.id_tag = tag.id_tag`,
    function(err, dt){
      if (typeof localStorage === "undefined" || localStorage === null) {
         var LocalStorage = require('node-localstorage').LocalStorage;
         localStorage = new LocalStorage('./scratch');
      }
      localStorage.setItem('posts', JSON.stringify(dt));
      res.render("home");
    });
  });
});

router.get('/delPost/:id', function(req, res){
  var id = req.params.id;
  db.query(`delete from post where id_post='${id}'`, function(err, data){
    if(err) throw err;
    db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
      post.time, post.id_dr, post.content, post.title,
      post.image_path, post.liked, post.id_post
      from post left join doctor as dr on post.id_dr = dr.id_dr
      left join tag on post.id_tag = tag.id_tag`,
    function(err, dt){
      if (typeof localStorage === "undefined" || localStorage === null) {
         var LocalStorage = require('node-localstorage').LocalStorage;
         localStorage = new LocalStorage('./scratch');
      }
      localStorage.setItem('posts', JSON.stringify(dt));
      res.render("home");
    });
  });
});

router.post('/addPost', function(req, res){
  var title = req.body.titles;
  var ctn = req.body.contents;
  var icon = req.body.imageIcon;
  if (typeof localStorage === "undefined" || localStorage === null) {
     var LocalStorage = require('node-localstorage').LocalStorage;
     localStorage = new LocalStorage('./scratch');
  }
  var id = JSON.parse(localStorage.getItem('user')).id;
  var tag = JSON.parse(localStorage.getItem('user')).tag;
  db.query(`SELECT id_prepost FROM pre_post order by CAST(id_prepost AS UNSIGNED) desc limit 1`,
  function(err, data){
    var idPost = Number(data[0].id_prepost.substring(0)) + 1;
    var rgt = {id_prepost:idPost, id_user:id, id_tag:tag, content:ctn, image_path:icon, title:title};
    db.query('insert into pre_post SET ?', rgt, function(err, dta) {
        if (err) throw err;
        alert("Up your post, please wait for accepted!");
        res.render("home");
    });
  });
});

router.get('/acceptPost', function(req, res){
  if (typeof localStorage === "undefined" || localStorage === null) {
     var LocalStorage = require('node-localstorage').LocalStorage;
     localStorage = new LocalStorage('./scratch');
  }
  var tag = JSON.parse(localStorage.getItem('user')).tag;
  var iddr = JSON.parse(localStorage.getItem('user')).id;
  db.query(`SELECT pp.*, dr.name, dr.icon_image FROM pre_post as pp
    left join doctor as dr on dr.id_dr = pp.id_user
    where pp.id_tag=? and dr.id_dr <> ?`,[tag, iddr],
  function(err, data){
    res.render("acceptPost", {listpost:data});
  });
});
router.post('/solveAccept', function(req, res){
  var acc = req.body.accept;
  if (typeof localStorage === "undefined" || localStorage === null) {
     var LocalStorage = require('node-localstorage').LocalStorage;
     localStorage = new LocalStorage('./scratch');
  }
  var iddr = JSON.parse(localStorage.getItem('user')).id;
  db.query(`select * from pre_post where id_prepost=?`,[acc], function(err, dta){
    db.query(`SELECT id_post from post ORDER BY CAST(id_post AS UNSIGNED) DESC LIMIT 1`,
    function(err, data) {
        if (err) throw err;
        var number = Number(data[0].id_post.substring(0)) + 1;
        number = String(number);
        var rgt = {id_post:number, id_user:dta[0].id_user, liked:0,
          content:dta[0].content, title:dta[0].title, dr_check:iddr,
          id_tag:dta[0].id_tag, time:dta[0].time, image_path:dta[0].image_path};
        db.query('insert into post SET ?', rgt, function(err, dt) {
            if (err) throw err;
            db.query('delete from pre_post where id_prepost=?', [acc], function(err, dt) {
                if (err) throw err;
                alert("Updated successfully from pre_post to post!");
                res.render("home");
            });
        });
    });
  });
});

router.post('/editProfile', function(req, res){
  var image = req.body.imgDoc;
  var user = req.body.username;
  var pass = req.body.pass;
  var mail = req.body.email;
  var phone = req.body.contact;
  var id = String(localStorage.getItem('admin'));
  if(id.substr(0, 2).includes("CU")){
    var rgt = {username:user, password:pass, phonenumber:phone,
      email:mail, icon_image:image};
    db.query('update customer SET ? where id_user=?', [rgt,id], function(err, dta){
      db.query(`SELECT * FROM customer where id_user=?`,id, function(err, dt) {
        res.render("cusProfile", {cus:dt[0]});
      });
    });
  }
  else if(id.substr(0, 2).includes("DR")){
    var rgt = {username:user, password:pass, phonenumber:phone,
      email:mail, icon_image:image};
    db.query('update doctor SET ? where id_dr=?', [rgt,id], function(err, data){
      db.query(`select * from post where id_user=?`,id, function(err, dta){
        db.query(`SELECT dr.id_dr, dr.name, dr.phonenumber, dr.email, dr.dr_high,
          tag.name_tag, rank.name_rank
          FROM doctor as dr
          left join tag on dr.id_tag = tag.id_tag
          left join rank on dr.id_rank = rank.id_rank
          WHERE dr.id_dr=?`,id, function(err, dt) {
            res.render("docProfile", {doc:dt[0], posts:dta});
        });
      });
    });
  }
  else{
    var rgt = {username:user, password:pass, phonenumber:phone,
      email:mail, icon_image:image};
    db.query('update admin SET ? where id_admin=?', [rgt,id], function(err, dta){
      db.query(`SELECT * FROM admin where id_admin=?`,id, function(err, dt) {
        if(err) throw err;
        res.render("cusProfile", {cus:dt[0]});
      });
    });
  }
});

router.post('/like_post', function(req, res){
  var post = req.body.idPost;
  var userid = req.body.userID;
  var opt = req.body.option;
  var dr = req.body.id_DR;
  if (typeof localStorage === "undefined" || localStorage === null) {
     var LocalStorage = require('node-localstorage').LocalStorage;
     localStorage = new LocalStorage('./scratch');
  }
  db.query(`select * from post where id_post=?`,post, function(err, dt){
    var liked = String(Number(dt[0].liked) + Number(opt));
    db.query(`update post SET liked=? where id_post=?`,[liked,post], function(err,data){
      db.query(`select * from doctor where id_dr=?`, dr, function(err, dulieu){
        var like_doc = Number(dulieu[0].sum_like) + Number(opt);
        db.query(`update doctor SET sum_like=? where id_dr=?`,[like_doc, dr],
          function(err, dl){
            if(String(userid).substr(0, 2).includes("DR")){
              db.query(`select * from doctor where id_dr=?`,userid, function(err,dta){
                if(String(dta[0].liked_post).includes(String(post))) var list = String(dta[0].liked_post).replace(String(post)+",","").trim();
                else var list = String(dta[0].liked_post).replace("null","").trim() + String(post) + ", ";
                db.query(`update doctor SET liked_post=? where id_dr=?`,[list,userid],
                  function(err, daTa){
                    db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
                      post.time, post.id_dr, post.content, post.title,
                      post.image_path, post.liked, post.id_post
                      from post left join doctor as dr on post.id_dr = dr.id_dr
                      left join tag on post.id_tag = tag.id_tag`,
                    function(err, dataBase){
                      db.query(`select * from doctor where id_dr=?`,userid,
                        function(err, database){
                          if(err) throw err;
                          let users = {
                            id:database[0].id_dr,
                            name:database[0].name,
                            tag:database[0].id_tag,
                            liked_post:database[0].liked_post
                          }
                          localStorage.setItem('user', JSON.stringify(users));
                          localStorage.setItem('posts', JSON.stringify(dataBase));
                          res.render("home");
                      });
                    });
                });
              });
            }
            else if(String(userid).substr(0, 2).includes("CU")){
              db.query(`select * from customer where id_user=?`,userid, function(err,dta){
                if(String(dta[0].liked_post).includes(String(post))) var list = String(dta[0].liked_post).replace(String(post)+",","").trim();
                else var list = String(dta[0].liked_post).replace("null","").trim() + String(post) + ", ";
                db.query(`update customer SET liked_post=? where id_user=?`,[list,userid],
                  function(err, daTa){
                    db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
                      post.time, post.id_dr, post.content, post.title,
                      post.image_path, post.liked, post.id_post
                      from post left join doctor as dr on post.id_dr = dr.id_dr
                      left join tag on post.id_tag = tag.id_tag`,
                    function(err, dataBase){
                      db.query(`select * from customer where id_user=?`,userid,
                        function(err, database){
                          if(err) throw err;
                          let users = {
                            id:database[0].id_user,
                            name:database[0].name,
                            liked_post:database[0].liked_post
                          }
                          localStorage.setItem('user', JSON.stringify(users));
                          localStorage.setItem('posts', JSON.stringify(dataBase));
                          res.render("home");
                      });
                    });
                });
              });
            }
            else{
              db.query(`select * from admin where id_admin=?`,userid, function(err,dta){
                if(String(dta[0].liked_post).includes(String(post))) var list = String(dta[0].liked_post).replace(String(post)+",","").trim();
                else var list = String(dta[0].liked_post).replace("null","").trim() + String(post) + ", ";
                db.query(`update admin SET liked_post=? where id_admin=?`,[list,userid],
                  function(err, daTa){
                    db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
                      post.time, post.id_dr, post.content, post.title,
                      post.image_path, post.liked, post.id_post
                      from post left join doctor as dr on post.id_dr = dr.id_dr
                      left join tag on post.id_tag = tag.id_tag`,
                    function(err, dataBase){
                      db.query(`select * from admin where id_admin=?`,userid,
                        function(err, database){
                          if(err) throw err;
                          let users = {
                            id:database[0].id_admin,
                            name:database[0].name,
                            liked_post:database[0].liked_post
                          }
                          localStorage.setItem('user', JSON.stringify(users));
                          localStorage.setItem('posts', JSON.stringify(dataBase));
                          res.render("home");
                      });
                    });
                });
              });
            }
        });
      });
    });
  });
});

router.get('/postDetail/:id', function(req, res){
  var id = req.params.id;
  db.query(`SELECT dr.id_dr, dr.name, dr.icon_image,
    p.title, p.content, p.time, p.liked, p.image_path, p.id_post
    FROM post as p left join doctor as dr on dr.id_dr = p.id_dr
    where p.id_post='${id}'`, function(err, data){
    db.query(`SELECT cs.name as csname, cs.icon_image as csimg, dr.name as drname,
      dr.icon_image as drimg, ad.name as adname, ad.icon_image as adimg,
      cm.content, cm.time, cm.id_parent, cm.id_cmt FROM comment as cm
      left join customer as cs on cs.id_user = cm.id_user
      left join doctor as dr on dr.id_dr = cm.id_user
      left join admin as ad on ad.id_admin = cm.id_user
      where id_post='${id}'`, function(err, dta){
        res.render("postDetail",{post:data[0], comments:dta});
    });
  });
});

router.post('/comment', function(req, res){
  var id = req.body.id_post;
  var id_pr = req.body.id_parent;
  var id_user = req.body.id_user;
  var cnt = req.body.comment;
  db.query(`SELECT id_cmt from comment ORDER BY CAST(id_cmt AS UNSIGNED) DESC LIMIT 1`,
  function(err, data) {
      if (err) throw err;
      var number = Number(data[0].id_cmt.substring(0)) + 1;
      var rgt = {id_cmt:number, id_post:id, id_user:id_user, id_parent:id_pr, content:cnt};
      db.query(`insert into comment SET ? `, rgt, function(err, dta){
        if(err) throw err;
        res.redirect('/controller/postDetail/'+id);
      });
  });
});

router.post('/search', function(req, res){
  var cnt = req.body.search;
  console.log(cnt);
  var qr = db.query(`select dr.name as docName, dr.icon_image, tag.name_tag,
    post.time, post.id_dr, post.content, post.title,
    post.image_path, post.liked, post.id_post
    from post left join doctor as dr on post.id_dr = dr.id_dr
    left join tag on post.id_tag = tag.id_tag where post.title LIKE '%${cnt}%'`,
  function(err, data) {
      if (err) throw err;
      if (typeof localStorage === "undefined" || localStorage === null) {
         var LocalStorage = require('node-localstorage').LocalStorage;
         localStorage = new LocalStorage('./scratch');
      }
      localStorage.setItem('posts', JSON.stringify(data));
      res.render("home");
  });
  console.log(qr.sql);
});


router.get('/chat/:name', function(req, res){
    if (typeof localStorage === "undefined" || localStorage === null) {
      var LocalStorage = require('node-localstorage').LocalStorage;
      localStorage = new LocalStorage('./scratch');
  }
    var myUser = JSON.parse(localStorage.getItem('user'))
    var yourName;
    var allPeople;
    var listPeople=[];
    
    db.query(`SELECT id_dr AS id, name, icon_image AS avatar FROM doctor 
        UNION SELECT id_user AS id, name, icon_image AS avatar FROM customer 
        UNION SELECT id_admin AS id,  name, icon_image AS avatar FROM admin;`,
        function(err, data){
          if (err) throw err;
          allPeople = data;
          myUser = allPeople.find(function(person){
            return person.name === myUser.name;
          })
          //console.log(myUser.avatar);
          db.query(`SELECT * FROM rooms WHERE person1 = '${myUser.name}' OR person2 = '${myUser.name}'`, 
          function(err, data){
            if(err) throw err;
            myRooms = data;
            //mỗi room sẽ có bản thân và 1 người khác
           // console.log("this is my room " + myRooms[0].conversation + " and " + myRooms[0].person1+ " and " + myRooms[0].person2);
            myRooms.forEach(function(room){
              var person = room.person1 === myUser.name? room.person2 : room.person1;
             // console.log("this is person " + person)
             // console.log("this is someone " + allPeople[0].name)
              var otherUser = allPeople.find(function(eachPerson){
                return eachPerson.name === person;
              })
              // console.log("this is other user " + otherUser.name + " with " +otherUser.id )
              listPeople.push({id: otherUser.id, name: otherUser.name, ava: otherUser.avatar, conversation: room.conversation});
              //console.log("this is list people" + listPeople[0].name )
              
            })
            yourUser = allPeople.find(function(eachPerson){
                return eachPerson.name === req.params.name;
            })
            //console.log(myUser.avatar + " and " + yourUser.avatar);
            res.render("chat", {myself: myUser, yourself: yourUser, listUsers: listPeople})
            // io.to(socket.id).emit("user connected", {user, listPeople});
          })
    });
    
    //console.log("nani???");
    // res.render("demoChat", {myself: myUser, listUser: listPeople})
    

})

module.exports = router;
