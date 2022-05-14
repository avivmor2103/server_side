const { StatusCodes, RESET_CONTENT } = require("http-status-codes");
const globals = require("./globals.js");
const file = require("./rwfile");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require("email-validator");
const console = require("console");


class User {
  first_name 
  last_name ;
  email ;
  personal_id ;
  address  ;
  phone_number ;
  date_of_birth ;
  password ;
  position ;
  status ;

  constructor (fn , ln , email , personal_id , address , phone_number , birthday , password , position , status)
  {
    this.first_name = fn ;
    this.last_name = ln ;
    this.email = email ;
    this.personal_id = personal_id;
    this.address = address ;
    this.phone_number = phone_number ;
    this.date_of_birth = birthday ;
    this.password = password ;
    this.position = position ;
    this.status = status ;
  }

  get_phone_number()
  {
    return this.phone_number ;
  }

  get_address()
  {
    return this.address ;
  }

  get_date_of_birth()
  {
    return this.date_of_birth ;
  }

  get_email()
  {
    return this.email ;
  }
}

const POSITION = {
    CHEF : 1,
    MENAGER : 2,
    BARTENDER : 3,
    WAITER : 4
}

async function login(req, res , client) {

    const db = client.db("Management_system");
    const users = db.collection("Users");
    const email = req.body.email;
    const user_password = req.body.user_password;
    const user_to_find = await users.findOne({ email : email });
    
    
    ///Check it!!!!!!
    // if(!(await bcrypt.compare(user_password , user_to_find.password)))
    // {
    // 	res.status( StatusCodes.BAD_REQUEST );
    // 	res.send( "wrong password!!!");
    // 	return;
    // } 
    
    if (!user_to_find) {
      res.status(StatusCodes.BAD_REQUEST);
      res.send("There is no user with those detailes");
    }
    try{
      users.updateOne({ email : email }, { $set : {status : "Active"}} );
    }catch(error){
      console.log(error);
    }
    console.log("User logged in successfully");
    
    const to_show = await users.findOne({ email : email });
    res.status(StatusCodes.OK);
    res.send(JSON.stringify(to_show));

}

async function logout(req , res, client)
{
  const db = client.db("Management_system");
  const users =  db.collection("Users");

  const token = req.headers.authorization;
  const email = globals.token_map.get(token).email;
  try{
    users.updateOne({ email : email }, { $set : {status : "Disconnect"}} );
  }catch(error){
    console.log(error);
  }
  if(globals.token_map.delete(token))
  {
    res.status(StatusCode.OK)
    res.send("User log-out successfully.");
  }
  else{
    res.send("User already logged-out.")
  }
}

async function create_new_user (req , res , client)
{
  const db = client.db("Management_system");
  const users =  db.collection("Users");

  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const email = req.body.email;
  const personal_id = req.body.personal_id;
  const password = req.body.password;
  const phone_number = req.body.phone_number;
  const date_of_birth = req.body.date_of_birth;
  const address = req.body.address;
  const position = req.body.position;

  if(!(first_name || last_name || email || personal_id || password || phone_number || date_of_birth || address))
  {
    res.status(StatusCodes.BAD_REQUEST);
    res.send("Missing parameter in user's parameters");
  }

  console.log(email);
  console.log(first_name);
  console.log(last_name);

  if(!validator.validate(email))
  {
    res.status( StatusCodes.BAD_REQUEST );
		res.send( "Invalid email in request - not in email format")
		return;
  }

  const email_exist = globals.g_users.find(user => user.email == email);
  if(email_exist)
  {
    res.status(StatusCodes.BAD_REQUEST);
    res.send("Email user already taken");
  } 

  const id_exist = globals.g_users.find(user => user.personal_id == personal_id);
  if(id_exist)
  {
    res.status(StatusCodes.BAD_REQUEST);
    res.send("Id user already taken");
  } 

  let pos = get_postion(position)
  if(pos ==  undefined)
  {
    res.status(StatusCodes.BAD_REQUEST);
    res.send("Id user already taken");
  }

  const new_user = new User( first_name, last_name, email, personal_id, address, phone_number, date_of_birth, await hash(password), position, "Created" );
  console.log(new_user)
  
  try
  {
    await users.insertOne(new_user);
    const new_token = await create_new_token();
    globals.token_map.set(new_token, new_user);
    res.json({token: new_token, new_user: new_user, admin: user.personal_id == 1});
  }
  catch(err){
	  console.log(err)	
  }
  
  res.status( StatusCodes.CREATED );
	res.send(  JSON.stringify( new_user) );  
}

get_postion = (position) => {
  switch(position){
    case 1 : 
        position = POSITION.CHEF;
        break;
    case 2 : 
        position = POSITION.MENAGER;
        break;
    case 3 : 
        position = POSITION.BARTENDER ;
        break; 
    case 4 :
        position = POSITION.WAITER ;
    default : 
        position = 0;
        break;
  }
  return position ;
}

function create_random_token()
{  
	return new Promise((resolve,reject) => {
        crypto.randomBytes(48,function(err,buffer){
              if(err){reject('failed');}
			  resolve(buffer.toString('hex'));
			  
		});
	})
	   
}

async function create_new_token()
{
	let token =  await create_random_token();
	while(globals.token_map.get(token) != undefined)
	{
		token = await create_random_token();
	}
	return token;
}

async function hash(password)
{
  const salt = await bcrypt.genSalt();
	const hash_password = await bcrypt.hash(password,salt);
	return hash_password;
}

async function update_user(req ,res, client)
{
  const db = client.db("Management_system");
  const users = db.collection("Users");
  const personal_id = req.body.personal_id;
  const phone_number = req.body.phone_number;
  const address =  req.body.address;
  const email = req.body.email;
  const position = req.body.position;
  let user_to_update;
  //let idx ;
  user_to_update = await users.findOne({personal_id : personal_id});
  //user_to_update = globals.g_users.find(user => user.id == id);
  if(user_to_update != undefined)
  {
    if(position)
    {
        try{
          await users.updateOne({ position : user_to_update.position }, { $set : {position : position}} );
        }catch(error){
          console.log(error);
        }
    }

    if(phone_number)
    {
      try{
        await users.updateOne({ phone_number : user_to_update.phone_number }, { $set : {phone_number : phone_number}} );
      }catch(error){
        console.log(error);
      }
    }
    if(address)
    {
      try{
        await users.updateOne({ address : user_to_update.address }, { $set : {address : address}} );
      }catch(error){
        console.log(error);
      }
    }

    if(email)
    {   
      if( ( email != user_to_update.email ) && (validator.validate(email))){
        if(await users.findOne({ email : email})){
          res.send("Email already exist. Please try another email address.");
        }
        else{
          try{
            await users.updateOne({ email : user_to_update.email }, { $set : { email : email }} );
          }catch(error){
            console.log(error);
          }
        }
      }else{
        res.status(StatusCodes.BAD_REQUEST);
        res.send("Error");
      }
    }
  }
  else{
    res.status(StatusCodes.BAD_REQUEST);
    res.send("User with such id is not exist");
  }
  res.status(StatusCodes.OK);
  res.send("User data updated"); 
}

async function delete_user(req , res , client)
{
  const db = client.db("Management_system");
  const users = db.collection("Users");
  const personal_id = (req.params.id) ;
  //const active_user = globals.get_active_user(req);
  // if(active_user == undefined)
  // {
  //   res.status(StatusCodes.BAD_REQUEST);
  //   res.send("Error with Active User");
  //   return;
  // }

  // if(active_user.position != "Manager" )
  // {
  //   res.status(StatusCodes.BAD_REQUEST);
  //   res.send("Only manager can delete employee from the system");
  //   return;
  // }

  if (personal_id < 1 || personal_id == undefined)
  {
    res.status(StatusCodes.BAD_REQUEST);
    res.send("The id is not valide ");
    return;
  }
  let user_to_delete = await users.findOne({ personal_id : personal_id });
  console.log(user_to_delete);
  if (!user_to_delete)
  {
    res.status(StatusCodes.BAD_REQUEST);
    res.send("The user is not exist");
  }else{
    try{
    await users.deleteOne({ _id : user_to_delete._id });
    res.status(StatusCodes.OK);
    res.send(`Document deleted`);
    }catch(err)
    {
      console.log(err);
    }
  }
}

async function get_user(req , res , client)
{
  const db = client.db("Management_system");
  const users = db.collection("Users");
  const personal_id = (req.params.id); 

  if(personal_id < 1 )
  {
     res.status (StatusCodes.BAD_REQUEST);
     res.send("Id is invalide number");
     return; 
  }
  const user_to_send = await users.findOne({ personal_id : personal_id });
  console.log(user_to_send);
  if( !user_to_send )
  {
    res.status(StatusCodes.BAD_REQUEST);
    res.send("User not found");
    return
  } 

  let user_details = {
    Id: user_to_send.id ,
    First_name: user_to_send.first_name,
    Last_name : user_to_send.last_name,
    Email : user_to_send.email,
    Birthday : user_to_send.date_of_birth,
    Address : user_to_send.address,
    Position : user_to_send.position
  }   
  
  console.log("Create user successfully");
  res.status(StatusCodes.OK);
	res.send(  JSON.stringify( user_details ));
}

async function get_all_users(req, res, client )
{
  const db = client.db("Management_system");
  const users = db.collection("Users");
  const users_array = await users.find().toArray();
  //console.log(users_array);
  let users_details_to_show = [] ;
  users_array.forEach( user => {
    let user_to_show = {
        id : user.personal_id,
        first_name : user.first_name,
        last_name : user.last_name,
        email : user.email,
        date_of_birth : user.date_of_birth,
        address : user.address,
        phone_number : user.phone_number,
        status : user.status,
        position : user.position
    };
    users_details_to_show.push(user_to_show);
  });

  res.status(StatusCodes.OK);
  res.send(JSON.stringify(users_details_to_show));
}

module.exports = {
  login : login,
  logout : logout,
  create_new_user : create_new_user ,
  update_user : update_user ,
  delete_user : delete_user ,
  get_user : get_user ,
  get_all_users : get_all_users
}