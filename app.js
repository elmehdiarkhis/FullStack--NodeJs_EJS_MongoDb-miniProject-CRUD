//express==========================================
const express=require('express');
const app = express();

//Object Js
app.use(express.urlencoded({extended:true}));

//ejs
app.set('view engine','ejs');
//css
app.use(express.static('public'));

//mongoose===========================
const mongoose = require('mongoose');


mongoose.connect("mongodb+srv://system:system@cluster0.8xzdlmn.mongodb.net/?retryWrites=true&w=majority")
.then(resultat=>{
    console.log("mongosse Connected !!")
    app.listen(2003, ()=>{
        console.log("server listening at PORT : 2003 !!")
    })
})
.catch(error=>{
    console.log(error)
})

//create Table User
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type:String,
            required:true
        },
        lastName: {
            type:String,
            required:true
        },
        dateOfBirth: {
            type:String,
            required:true
        },
        email: {
            type:String,
            required:true
        },
        phone: {
            type:String,
            required:true
        },
        adresse: {
            type:String,
            required:true
        },
        image: {
            type:String,
            required:true
        }
    }
,{timestamps:true});
const User = mongoose.model("User",userSchema);


//Create Table RegisteredUser
const RegisteredUserSchema = new mongoose.Schema(
    {
        userName: {
            type:String,
            required:true
        },
        pass: {
            type:String,
            required:true
        }
    }
,{timestamps:true});
const RegisteredUser = mongoose.model("RegisteredUser",RegisteredUserSchema);


//image
const upload = require('express-fileupload');
const { redirect } = require('statuses');
app.use(upload())

//Routes=========================================



//login--------
app.get('/',(req,res)=>{
    res.render('login')
})

app.post('/login',(req,res)=>{

    RegisteredUser.findOne(req.body,(err,user)=>{

        if(err){
            console.log(err)
            return res.redirect("/");
        }

        if(!user){
            return res.redirect("/");
        }

        res.redirect("/allUsers")

    })
})



//FIND().SORT()-------
app.get('/allUsers',(req,res)=>{
    User.find().sort({createdAt:-1})
    .then(result=>{
        //ici
        res.render('index',{users:result})
    })
    .catch(error=>{
        console.log(error)
    })
})

//--------
app.get('/create',(req,res)=>{
    res.render("create")
})


//POST------------------------------
app.post('/create', (req, res) => {
    
    if(req.files){
        //upload images
        var file = req.files.avatar
        var filename = req.files.avatar.name
        file.mv('./public/uploads/images/'+filename,function(err){
            if(err){
                console.log(err)
            }else{
                console.log("File Uploaded")
            }
        })

        //MongoDb post/save()
        const date = new Date(req.body.dateOfBirth);
        
        let user = new User(
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dateOfBirth: date.toLocaleDateString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }),
                email: req.body.email,
                phone: req.body.phone,
                adresse: req.body.adresse,
                image: filename
            }).save()
            .then(resultat=>{
                res.redirect('/allUsers');
            })
            .catch(error=>{
                console.log(error)
            })
    }else{
        console.log("req.files erreur")
    } 
});

//Delete------------------------------
app.delete('/details/:id',(req,res)=>{
    console.log(req.params.id)
    User.findByIdAndDelete(req.params.id)
    .then(result=>{
        res.json({redirect:'/allUsers'})
    })
    .catch(error=>{
        console.log(error)
    })
})

//More Infos--------------------------
app.get('/details/:id', (req,res)=>{
    User.findById(req.params.id)
    .then(result=>{
        res.render('details',{user:result})
    })
    .catch(error=>{
        console.log(error)
    })
})

//Edit--------------------------------
app.get("/edit/:id",(req,res)=>{
    User.findById(req.params.id)
    .then(result=>{
        res.render('edit',{user:result})
    })
    .catch(error=>{
        console.log(error)
    })
})

app.post('/edit/:id',(req,res)=>{
    if(req.files){
        var file = req.files.avatar
        var filename = req.files.avatar.name
        file.mv('./public/uploads/images/'+filename,function(err){
            if(err){
                console.log(err)
            }else{
                console.log("File Uploaded")
            }
        })

        const date = new Date(req.body.dateOfBirth);
        User.updateOne({_id:req.params.id},{
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dateOfBirth: date.toLocaleDateString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }),
            email: req.body.email,
            phone: req.body.phone,
            adresse: req.body.adresse,
            image: filename
        })
        .then(resultat=>{
            res.redirect('/allUsers');
        })
        .catch(error=>{
            console.log(error)
        })
    }
    
})


//signUP-------------
app.get('/signUp',(req,res)=>{
    res.render('signUp')
})

app.post('/signUp',(req,res)=>{
    const registeredUser = new RegisteredUser(req.body).save()
    .then(result=>{
        res.redirect('/');
    })
    .catch(error=>{
        console.log(error)
    })
})

//================================================
app.use((req,res)=>{
    res.render('404')
})
//================================================




