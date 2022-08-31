const express = require("express");
//const StatusCodes = require("http-status-codes").StatusCodes;
const file = require("./rwfile");
const fs = require("fs").promises;
const package = require("./package.json");
const bcrypt = require('bcrypt');
const users = require("./users.js");
const tables = require("./tables.js");
const items = require("./item.js");
const supply = require("./supply.js");
const orders = require("./Orders");
const {MongoClient} =  require('mongodb');
const uri = "mongodb+srv://AvivMor1:AvMo210395!@cluster0.evf8t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client =  new MongoClient(uri);
const cors = require('cors');
const session = require('express-session');


const app = express();
app.use(cors());
let port = 3001;

let msg = `${package.description} listening at port ${port}`;
const manager_user = {
  first_name : "manager" ,
  last_name : "" ,
  email : "manager_rest@gmail.com" ,
  id : 1 ,
  address : "Your-Resturant-Location" ,
  phone_number : "052-3346565" ,
  date_of_birth : "01.01.1995" ,
  password : "manager1" ,
  position : "Manager" ,
  status : "Created"
}
const reExt = /\.([a-z]+)/i;

function content_type_from_extension( url)
{
	const m = url.match( reExt );
	if ( !m ) return 'application/json'
	const ext = m[1].toLowerCase();

	switch( ext )
	{
		case 'js': return 'text/javascript';
		case 'css': return 'text/css';
		case 'html': return 'text/html';
	}

	return 'text/plain'
}

const set_content_type = function (req, res, next) {
  const content_type = req.baseUrl == '/api'? "application/json; charset=utf-8" : content_type_from_extension( req.url)
  res.setHeader("Content-Type", content_type);
  next();
};

app.use( set_content_type);
app.use( express.json()); // to support JSON-encoded bodies
app.use( express.urlencoded(
    // to support URL-encoded bodies
    {
      extended: true,
    }
  )
);

async function hash(password)
{
  const salt = await bcrypt.genSalt();
	const hash_password = await bcrypt.hash(password,salt);
	return hash_password;
}

const router = express.Router();

app.use("/api", router);

 //users requests
router.post("/user/login", (req, res)       => {  users.login(req, res, client)});
router.post("/user/logout", (req, res)      => {  users.logout(req, res , client );});
router.post("/user/create", (req, res)      => {  users.create_new_user(req, res , client);});
router.put("/user/update", (req, res)       => {  users.update_user(req, res , client);});
router.delete("/user/delete/(:id)", (req, res)    => {  users.delete_user(req, res , client);});
router.get("/user/get/(:id)", (req, res) => {  users.get_user(req, res , client);});
router.get("/user/all_users", (req, res)    => {  users.get_all_users(req, res , client);});

//table request
router.post("/tables/create", (req, res)    => {  tables.new_table(req, res , client );});
router.put("/tables/update", (req, res)     => {  tables.update_table(req, res, client );});
router.delete("/tables/delete/:id", (req, res)  => { tables.table_to_delete(req, res, client );});
router.get("/tables/get/:id", (req, res) => {  tables.get_table(req, res, client );});
router.get("/tables/all_table", (req, res)    => {  tables.all_tables(req, res, client );});
router.post("/tables/add_item_to_table", (req, res) => {  tables.add_item_to_table(req, res, client );});
router.put("/tables/delete_item_from_table", (req, res) => {  tables.delete_item_from_table(req, res, client );});
router.put("/tables/total_price", (req, res) => {  tables.table_total_checkout(req, res, client );});
router.get("/tables/erea/:erea",  (req , res) => { tables.get_tables_by_erea(req , res , client); });

//items request
router.post("/item/create", (req, res) => {  items.create_new_item(req, res,client);});
router.put("/item/update", (req, res) => { items.update_item(req, res,client);});
router.delete("/item/delete/:id", (req, res) => { items.delete_item(req, res,client);});
router.get("/item/get/:id", (req, res) => {  items.get_item(req, res,client);});
router.get("/item/all_items", (req, res) => { items.get_all_items(req, res,client);});
router.get("/item/get_items_by_category/:category" , (req, res)=>{ items.get_items_by_category(req, res,client)});

//supply request
router.post("/supply/create", (req, res) => { supply.create_new_supply(req, res);});
router.put("/supply/update", (req, res) => {  supply.update_supply(req, res);});
router.delete("/supply/delete", (req, res) => { supply.delete_supply(req, res);});
router.get("/supply/get", (req, res) => { supply.get_supply(req, res);});


//orders requests

router.post("/order/create", (req, res)      => {  orders.createNewOrder(req, res , client);});
router.put("/order/update", (req, res)       => {  orders.updateOrderData(req, res , client);});
router.delete("/order/delete/(:orderNumber)", (req, res)    => {  orders.deleteOrder(req, res , client);});
router.put("/order/delete_item", (req, res)    => {  orders.deleteItemFromOrder(req, res , client);});
router.get("/order/get/(:orderNumber)", (req, res) => {  orders.getOrder(req, res , client);});
router.get("/order/all_orders", (req, res)    => {  orders.getAllOrders(req, res , client);});


async function start_server(){
  try{
      await client.connect(); 
      let idx ;   
      global.g_users = JSON.parse (await fs.readFile('users.json','utf8'));
      global.g_users.forEach(user => {
      idx = global.g_users.indexOf(user);
      if(user.status == 'deleted'){
        global.g_users.splice(idx , 1);
      }
    });
  }catch(err){
    console.log(err);
    manager_user.password = await hash(manager_user.password);
    global.g_users = [manager_user];
    await file.save_to_file('users.json',global.g_users);
  }

  app.listen(port, () => { console.log(msg) } );
}

start_server();